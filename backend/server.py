from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
from enum import Enum
import shutil

# Import models
from package_models import (
    StickerPackage, StickerPackageCreate, StickerPackageUpdate, StickerFile,
    AddStickersToPackage, ReorderStickers, SocialMediaLinks, SocialMediaUpdate,
    PopularityMetrics, PackageAnalytics, PopularityCalculator, PackageResponse,
    PackageListResponse, STICKER_FORMATS, MAX_STICKERS_PER_PACKAGE, MIN_STICKERS_PER_PACKAGE
)

from banner_models import (
    HorizontalBanner, HorizontalBannerCreate, HorizontalBannerUpdate, BannerAction, BannerActionType,
    CategoryWithThumbnail, CategoryCreate, CategoryUpdate, FileUploadResponse,
    BannerAnalytics, SliderConfig, BannerSliderResponse, BANNER_CONFIG, CATEGORY_THUMBNAIL_CONFIG,
    MAX_BANNERS_ACTIVE, BANNER_IMAGE_FORMATS, CATEGORY_THUMBNAIL_FORMATS
)

from subscription_models import (
    SubscriptionPlan, SubscriptionPlanCreate, UserSubscription, UserSubscriptionCreate,
    SubscriptionStats, SubscriptionCheck, SubscriptionStatus, SubscriptionPlatform,
    PlanDuration, DEFAULT_PLANS, SUBSCRIPTION_FEATURES
)

from advanced_models import (
    AppFeatures, RatingConfig, PromoBanner, PromoBannerCreate, BannerAction, BannerActionType,
    PushNotification, PushNotificationCreate, NotificationConfig, NotificationPriority,
    UserAnalytics, SystemConfig, AdvancedStats, BannerAnalytics, AppConfigResponse,
    RatingPromptCheck, DEFAULT_SYSTEM_CONFIG, SAMPLE_BANNERS, BannerPosition
)

from unified_models import (
    AdminUser, AdminCreate, AdminUpdate, PasswordChange, FirebaseConfig, NotificationTemplate,
    UserSegment, AppStoreConfig, SystemSettings, DEFAULT_FIREBASE_INSTRUCTIONS
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'sticker_app')]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-this')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Security
security = HTTPBearer()
api_router = APIRouter(prefix="/api")

# Create FastAPI app
app = FastAPI(title="WhatsApp Sticker Package Manager", version="5.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id = payload.get("sub")
        if admin_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    admin = await db.admins.find_one({"id": admin_id})
    if admin is None:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    return AdminUser(**admin)

# ==========================================
# AUTHENTICATION ROUTES
# ==========================================

@api_router.post("/init-admin")
async def initialize_admin():
    """Create default admin if none exists"""
    existing_admin = await db.admins.find_one({})
    
    if existing_admin:
        return {"message": "Admin already exists"}
    
    default_admin = AdminUser(
        email="admin@stickers.com",
        name="Administrator",
        password=get_password_hash("admin123")
    )
    
    await db.admins.insert_one(default_admin.dict())
    return {"message": "Default admin created successfully"}

class LoginRequest(BaseModel):
    email: str
    password: str

@api_router.post("/auth/login")
async def login(login_data: LoginRequest):
    if not login_data.email or not login_data.password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    admin = await db.admins.find_one({"email": login_data.email})
    if not admin or not verify_password(login_data.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not admin.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is inactive")
    
    # Update last login
    await db.admins.update_one(
        {"id": admin["id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Create token
    access_token = create_access_token(data={"sub": admin["id"]})
    
    return {
        "token": access_token,
        "id": admin["id"],
        "email": admin["email"],
        "name": admin["name"]
    }

# ==========================================
# DASHBOARD & ANALYTICS
# ==========================================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(admin = Depends(get_current_admin)):
    """Get comprehensive dashboard statistics"""
    
    # Basic counts
    total_packages = await db.sticker_packages.count_documents({"is_active": True})
    total_categories = await db.categories.count_documents({"is_active": True})
    
    # Recent activity (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_packages = await db.sticker_packages.count_documents({
        "created_date": {"$gte": seven_days_ago}
    })
    
    # Platform statistics
    ios_packages = await db.sticker_packages.count_documents({
        "platforms": "ios",
        "is_active": True
    })
    
    android_packages = await db.sticker_packages.count_documents({
        "platforms": "android", 
        "is_active": True
    })
    
    cross_platform_packages = await db.sticker_packages.count_documents({
        "platforms": {"$all": ["ios", "android"]},
        "is_active": True
    })
    
    # Download statistics
    total_downloads_pipeline = [
        {"$group": {
            "_id": None,
            "ios_downloads": {"$sum": "$downloads_ios"},
            "android_downloads": {"$sum": "$downloads_android"},
            "total_likes": {"$sum": "$likes_count"}
        }}
    ]
    
    download_stats = await db.sticker_packages.aggregate(total_downloads_pipeline).to_list(1)
    download_data = download_stats[0] if download_stats else {
        "ios_downloads": 0, "android_downloads": 0, "total_likes": 0
    }
    
    # Top categories
    top_categories_pipeline = [
        {"$lookup": {
            "from": "categories",
            "localField": "category_id", 
            "foreignField": "id",
            "as": "category"
        }},
        {"$unwind": "$category"},
        {"$group": {
            "_id": "$category_id",
            "category_name": {"$first": "$category.name"},
            "package_count": {"$sum": 1},
            "total_downloads": {"$sum": {"$add": ["$downloads_ios", "$downloads_android"]}},
            "total_likes": {"$sum": "$likes_count"}
        }},
        {"$sort": {"total_downloads": -1}},
        {"$limit": 5}
    ]
    
    top_categories = await db.sticker_packages.aggregate(top_categories_pipeline).to_list(5)
    
    return {
        "total_packages": total_packages,
        "total_categories": total_categories,
        "recent_packages": recent_packages,
        "ios_packages": ios_packages,
        "android_packages": android_packages,
        "cross_platform_packages": cross_platform_packages,
        "total_downloads_ios": download_data["ios_downloads"],
        "total_downloads_android": download_data["android_downloads"],
        "total_likes": download_data["total_likes"],
        "top_categories": top_categories,
        "total_downloads": download_data["ios_downloads"] + download_data["android_downloads"]
    }

@api_router.get("/dashboard/popular-packages")
async def get_popular_packages(limit: int = 10, admin = Depends(get_current_admin)):
    """Get most popular packages with detailed metrics"""
    
    packages = await db.sticker_packages.find(
        {"is_active": True}
    ).sort("popularity_score", -1).limit(limit).to_list(limit)
    
    popular_packages = []
    for package in packages:
        # Get category name
        category = await db.categories.find_one({"id": package["category_id"]})
        category_name = category["name"] if category else "Sin categoría"
        
        metrics = PopularityMetrics(
            package_id=package["id"],
            package_name=package["name"],
            category_name=category_name,
            likes_count=package.get("likes_count", 0),
            total_downloads=package.get("downloads_ios", 0) + package.get("downloads_android", 0),
            downloads_ios=package.get("downloads_ios", 0),
            downloads_android=package.get("downloads_android", 0),
            recent_downloads_7d=package.get("recent_downloads_7d", 0),
            popularity_score=package.get("popularity_score", 0),
            popularity_rank=package.get("popularity_rank", "📦 Nuevo"),
            download_trend="stable",  # You could calculate this
            days_since_creation=(datetime.utcnow() - package["created_date"]).days,
            like_to_download_ratio=0.0,  # Calculate if needed
            cross_platform_usage=len(package.get("platforms", [])) > 1
        )
        popular_packages.append(metrics)
    
    return popular_packages

# ==========================================
# CATEGORIES MANAGEMENT (Simplified - No Subcategories)
# ==========================================

# Categories endpoints moved to the bottom with thumbnail support

@api_router.put("/categories/{category_id}")
async def update_category(category_id: str, name: str, description: str = "", admin = Depends(get_current_admin)):
    """Update category"""
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": {
            "name": name,
            "description": description,
            "updated_date": datetime.utcnow()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated_category = await db.categories.find_one({"id": category_id})
    return updated_category

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, admin = Depends(get_current_admin)):
    """Delete category (only if no packages use it)"""
    # Check if category has packages
    package_count = await db.sticker_packages.count_documents({"category_id": category_id})
    if package_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category with {package_count} packages. Move packages first."
        )
    
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

# ==========================================
# STICKER PACKAGES MANAGEMENT
# ==========================================

@api_router.get("/packages", response_model=List[PackageResponse])
async def get_packages(
    category_id: str = None,
    platform: str = None,
    is_featured: bool = None,
    sort_by: str = "popularity",  # popularity, created_date, downloads, name
    page: int = 1,
    per_page: int = 20,
    admin = Depends(get_current_admin)
):
    """Get sticker packages with filtering and sorting"""
    
    # Build query
    query = {"is_active": True}
    
    if category_id:
        query["category_id"] = category_id
    
    if platform:
        query["platforms"] = platform
        
    if is_featured is not None:
        query["is_featured"] = is_featured
    
    # Sorting
    sort_options = {
        "popularity": [("popularity_score", -1), ("created_date", -1)],
        "created_date": [("created_date", -1)],
        "downloads": [("downloads_ios", -1), ("downloads_android", -1)],
        "name": [("name", 1)]
    }
    
    sort_criteria = sort_options.get(sort_by, sort_options["popularity"])
    
    # Get total count
    total_count = await db.sticker_packages.count_documents(query)
    
    # Get packages with pagination
    skip = (page - 1) * per_page
    packages = await db.sticker_packages.find(query).sort(sort_criteria).skip(skip).limit(per_page).to_list(per_page)
    
    # Enhance with category names
    package_responses = []
    for package in packages:
        category = await db.categories.find_one({"id": package["category_id"]})
        category_name = category["name"] if category else "Sin categoría"
        
        package_response = PackageResponse(
            id=package["id"],
            name=package["name"],
            description=package.get("description"),
            category_id=package["category_id"],
            category_name=category_name,
            total_stickers=len(package.get("stickers", [])),
            stickers=package.get("stickers", []),
            platforms=package.get("platforms", []),
            is_premium=package.get("is_premium", False),
            is_featured=package.get("is_featured", False),
            likes_count=package.get("likes_count", 0),
            total_downloads=package.get("downloads_ios", 0) + package.get("downloads_android", 0),
            popularity_rank=package.get("popularity_rank", "📦 Nuevo"),
            created_date=package["created_date"]
        )
        package_responses.append(package_response)
    
    return package_responses

@api_router.post("/packages", response_model=PackageResponse)
async def create_package(package_data: StickerPackageCreate, admin = Depends(get_current_admin)):
    """Create new sticker package"""
    
    # Validate sticker count
    sticker_count = len(package_data.stickers)
    if sticker_count < MIN_STICKERS_PER_PACKAGE:
        raise HTTPException(
            status_code=400, 
            detail=f"Package must have at least {MIN_STICKERS_PER_PACKAGE} stickers"
        )
    
    if sticker_count > MAX_STICKERS_PER_PACKAGE:
        raise HTTPException(
            status_code=400, 
            detail=f"Package cannot have more than {MAX_STICKERS_PER_PACKAGE} stickers"
        )
    
    # Process stickers
    processed_stickers = []
    total_size_mb = 0
    
    for index, sticker_data in enumerate(package_data.stickers):
        sticker_file = StickerFile(
            filename=sticker_data.get("filename", f"sticker_{index+1}.png"),
            url=sticker_data.get("url", ""),
            file_size_kb=sticker_data.get("file_size_kb", 50),
            dimensions=sticker_data.get("dimensions", "512x512"),
            order_index=index
        )
        processed_stickers.append(sticker_file.dict())
        total_size_mb += (sticker_data.get("file_size_kb", 50) / 1024)
    
    # Create package
    package = StickerPackage(
        name=package_data.name,
        description=package_data.description,
        category_id=package_data.category_id,
        stickers=processed_stickers,
        total_stickers=len(processed_stickers),
        platforms=package_data.platforms,
        is_premium=package_data.is_premium,
        is_featured=package_data.is_featured,
        total_size_mb=round(total_size_mb, 2)
    )
    
    # Calculate initial popularity (new package)
    days_since_creation = 0
    is_cross_platform = len(package_data.platforms) > 1
    
    package.popularity_score = PopularityCalculator.calculate_popularity_score(
        likes=0,
        total_downloads=0,
        recent_downloads_7d=0,
        days_since_creation=days_since_creation,
        is_cross_platform=is_cross_platform
    )
    package.popularity_rank = PopularityCalculator.get_popularity_rank(package.popularity_score)
    
    # Save to database
    await db.sticker_packages.insert_one(package.dict())
    
    # Update category package count
    await db.categories.update_one(
        {"id": package_data.category_id},
        {"$inc": {"package_count": 1}}
    )
    
    # Get category name for response
    category = await db.categories.find_one({"id": package_data.category_id})
    category_name = category["name"] if category else "Sin categoría"
    
    return PackageResponse(
        id=package.id,
        name=package.name,
        description=package.description,
        category_id=package.category_id,
        category_name=category_name,
        total_stickers=package.total_stickers,
        stickers=processed_stickers,
        platforms=package.platforms,
        is_premium=package.is_premium,
        is_featured=package.is_featured,
        likes_count=package.likes_count,
        total_downloads=0,
        popularity_rank=package.popularity_rank,
        created_date=package.created_date
    )

@api_router.put("/packages/{package_id}", response_model=PackageResponse)
async def update_package(package_id: str, package_data: StickerPackageUpdate, admin = Depends(get_current_admin)):
    """Update package details (not stickers themselves)"""
    
    current_package = await db.sticker_packages.find_one({"id": package_id})
    if not current_package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Build update data
    update_data = {"updated_date": datetime.utcnow()}
    
    if package_data.name is not None:
        update_data["name"] = package_data.name
    if package_data.description is not None:
        update_data["description"] = package_data.description
    if package_data.category_id is not None:
        update_data["category_id"] = package_data.category_id
    if package_data.platforms is not None:
        update_data["platforms"] = package_data.platforms
        # Recalculate popularity if platform changes
        is_cross_platform = len(package_data.platforms) > 1
        days_since_creation = (datetime.utcnow() - current_package["created_date"]).days
        
        new_score = PopularityCalculator.calculate_popularity_score(
            likes=current_package.get("likes_count", 0),
            total_downloads=current_package.get("downloads_ios", 0) + current_package.get("downloads_android", 0),
            recent_downloads_7d=current_package.get("recent_downloads_7d", 0),
            days_since_creation=days_since_creation,
            is_cross_platform=is_cross_platform
        )
        update_data["popularity_score"] = new_score
        update_data["popularity_rank"] = PopularityCalculator.get_popularity_rank(new_score)
        
    if package_data.is_active is not None:
        update_data["is_active"] = package_data.is_active
    if package_data.is_premium is not None:
        update_data["is_premium"] = package_data.is_premium
    if package_data.is_featured is not None:
        update_data["is_featured"] = package_data.is_featured
    
    # Update package
    result = await db.sticker_packages.update_one(
        {"id": package_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Get updated package
    updated_package = await db.sticker_packages.find_one({"id": package_id})
    category = await db.categories.find_one({"id": updated_package["category_id"]})
    category_name = category["name"] if category else "Sin categoría"
    
    return PackageResponse(
        id=updated_package["id"],
        name=updated_package["name"],
        description=updated_package.get("description"),
        category_id=updated_package["category_id"],
        category_name=category_name,
        total_stickers=len(updated_package.get("stickers", [])),
        stickers=updated_package.get("stickers", []),
        platforms=updated_package.get("platforms", []),
        is_premium=updated_package.get("is_premium", False),
        is_featured=updated_package.get("is_featured", False),
        likes_count=updated_package.get("likes_count", 0),
        total_downloads=updated_package.get("downloads_ios", 0) + updated_package.get("downloads_android", 0),
        popularity_rank=updated_package.get("popularity_rank", "📦 Nuevo"),
        created_date=updated_package["created_date"]
    )

@api_router.delete("/packages/{package_id}")
async def delete_package(package_id: str, admin = Depends(get_current_admin)):
    """Delete entire package"""
    
    package = await db.sticker_packages.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Delete package
    result = await db.sticker_packages.delete_one({"id": package_id})
    
    # Update category count
    await db.categories.update_one(
        {"id": package["category_id"]},
        {"$inc": {"package_count": -1}}
    )
    
    return {"message": f"Package '{package['name']}' deleted successfully"}

# ==========================================
# INDIVIDUAL STICKER MANAGEMENT IN PACKAGES
# ==========================================

@api_router.post("/packages/{package_id}/stickers")
async def add_stickers_to_package(package_id: str, sticker_data: AddStickersToPackage, admin = Depends(get_current_admin)):
    """Add new stickers to existing package"""
    
    package = await db.sticker_packages.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    current_stickers = package.get("stickers", [])
    
    # Check total limit
    new_total = len(current_stickers) + len(sticker_data.stickers)
    if new_total > MAX_STICKERS_PER_PACKAGE:
        raise HTTPException(
            status_code=400,
            detail=f"Package would exceed maximum of {MAX_STICKERS_PER_PACKAGE} stickers"
        )
    
    # Process new stickers
    next_order_index = len(current_stickers)
    new_stickers = []
    
    for index, sticker in enumerate(sticker_data.stickers):
        sticker_file = StickerFile(
            filename=sticker.get("filename", f"sticker_{next_order_index + index + 1}.png"),
            url=sticker.get("url", ""),
            file_size_kb=sticker.get("file_size_kb", 50),
            dimensions=sticker.get("dimensions", "512x512"),
            order_index=next_order_index + index
        )
        new_stickers.append(sticker_file.dict())
    
    # Update package
    all_stickers = current_stickers + new_stickers
    total_size_mb = sum(s.get("file_size_kb", 50) / 1024 for s in all_stickers)
    
    await db.sticker_packages.update_one(
        {"id": package_id},
        {"$set": {
            "stickers": all_stickers,
            "total_stickers": len(all_stickers),
            "total_size_mb": round(total_size_mb, 2),
            "updated_date": datetime.utcnow()
        }}
    )
    
    return {"message": f"Added {len(new_stickers)} stickers to package", "new_total": len(all_stickers)}

@api_router.delete("/packages/{package_id}/stickers/{sticker_id}")
async def remove_sticker_from_package(package_id: str, sticker_id: str, admin = Depends(get_current_admin)):
    """Remove specific sticker from package"""
    
    package = await db.sticker_packages.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    stickers = package.get("stickers", [])
    
    # Find and remove sticker
    sticker_found = False
    updated_stickers = []
    
    for sticker in stickers:
        if sticker["id"] != sticker_id:
            updated_stickers.append(sticker)
        else:
            sticker_found = True
    
    if not sticker_found:
        raise HTTPException(status_code=404, detail="Sticker not found in package")
    
    # Check minimum stickers
    if len(updated_stickers) < MIN_STICKERS_PER_PACKAGE:
        raise HTTPException(
            status_code=400,
            detail=f"Package must have at least {MIN_STICKERS_PER_PACKAGE} stickers"
        )
    
    # Reorder remaining stickers
    for index, sticker in enumerate(updated_stickers):
        sticker["order_index"] = index
    
    # Update package
    total_size_mb = sum(s.get("file_size_kb", 50) / 1024 for s in updated_stickers)
    
    await db.sticker_packages.update_one(
        {"id": package_id},
        {"$set": {
            "stickers": updated_stickers,
            "total_stickers": len(updated_stickers),
            "total_size_mb": round(total_size_mb, 2),
            "updated_date": datetime.utcnow()
        }}
    )
    
    return {"message": "Sticker removed successfully", "remaining_stickers": len(updated_stickers)}

@api_router.put("/packages/{package_id}/reorder")
async def reorder_stickers(package_id: str, reorder_data: ReorderStickers, admin = Depends(get_current_admin)):
    """Reorder stickers within package"""
    
    package = await db.sticker_packages.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    stickers = package.get("stickers", [])
    
    # Create lookup for new orders
    new_orders = {item["sticker_id"]: item["new_order"] for item in reorder_data.sticker_orders}
    
    # Apply new ordering
    for sticker in stickers:
        if sticker["id"] in new_orders:
            sticker["order_index"] = new_orders[sticker["id"]]
    
    # Sort by new order
    stickers.sort(key=lambda x: x["order_index"])
    
    # Update package
    await db.sticker_packages.update_one(
        {"id": package_id},
        {"$set": {
            "stickers": stickers,
            "updated_date": datetime.utcnow()
        }}
    )
    
    return {"message": "Stickers reordered successfully"}

# ==========================================
# POPULARITY & ANALYTICS
# ==========================================

@api_router.post("/packages/{package_id}/like")
async def like_package(package_id: str):
    """Add like to package (public endpoint for mobile apps)"""
    
    package = await db.sticker_packages.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Increment like count
    new_likes = package.get("likes_count", 0) + 1
    
    # Recalculate popularity
    days_since_creation = (datetime.utcnow() - package["created_date"]).days
    is_cross_platform = len(package.get("platforms", [])) > 1
    
    new_score = PopularityCalculator.calculate_popularity_score(
        likes=new_likes,
        total_downloads=package.get("downloads_ios", 0) + package.get("downloads_android", 0),
        recent_downloads_7d=package.get("recent_downloads_7d", 0),
        days_since_creation=days_since_creation,
        is_cross_platform=is_cross_platform
    )
    
    new_rank = PopularityCalculator.get_popularity_rank(new_score)
    
    # Update package
    await db.sticker_packages.update_one(
        {"id": package_id},
        {"$set": {
            "likes_count": new_likes,
            "popularity_score": new_score,
            "popularity_rank": new_rank,
            "updated_date": datetime.utcnow()
        }}
    )
    
    return {
        "message": "Package liked successfully",
        "new_likes_count": new_likes,
        "popularity_rank": new_rank
    }

@api_router.post("/packages/{package_id}/download")
async def record_download(package_id: str, platform: str):
    """Record package download (public endpoint for mobile apps)"""
    
    if platform not in ["ios", "android"]:
        raise HTTPException(status_code=400, detail="Platform must be 'ios' or 'android'")
    
    package = await db.sticker_packages.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Increment download count
    field_name = f"downloads_{platform}"
    new_downloads = package.get(field_name, 0) + 1
    
    # Update recent downloads (last 7 days)
    # In a real implementation, you'd track this more precisely
    new_recent_downloads = package.get("recent_downloads_7d", 0) + 1
    
    # Recalculate popularity
    days_since_creation = (datetime.utcnow() - package["created_date"]).days
    is_cross_platform = len(package.get("platforms", [])) > 1
    total_downloads = package.get("downloads_ios", 0) + package.get("downloads_android", 0) + 1
    
    new_score = PopularityCalculator.calculate_popularity_score(
        likes=package.get("likes_count", 0),
        total_downloads=total_downloads,
        recent_downloads_7d=new_recent_downloads,
        days_since_creation=days_since_creation,
        is_cross_platform=is_cross_platform
    )
    
    new_rank = PopularityCalculator.get_popularity_rank(new_score)
    
    # Update package
    update_fields = {
        field_name: new_downloads,
        "recent_downloads_7d": new_recent_downloads,
        "popularity_score": new_score,
        "popularity_rank": new_rank,
        "last_download_date": datetime.utcnow(),
        "updated_date": datetime.utcnow()
    }
    
    await db.sticker_packages.update_one(
        {"id": package_id},
        {"$set": update_fields}
    )
    
    return {
        "message": f"Download recorded for {platform}",
        "total_downloads": total_downloads,
        "popularity_rank": new_rank
    }

# ==========================================
# SOCIAL MEDIA LINKS
# ==========================================

@api_router.get("/social-media")
async def get_social_media_links(admin = Depends(get_current_admin)):
    """Get social media links configuration"""
    
    social_links = await db.social_media.find_one({})
    
    if not social_links:
        # Create default empty configuration
        default_links = SocialMediaLinks()
        await db.social_media.insert_one(default_links.dict())
        return default_links
    
    return SocialMediaLinks(**social_links)

@api_router.put("/social-media")
async def update_social_media_links(social_data: SocialMediaUpdate, admin = Depends(get_current_admin)):
    """Update social media links"""
    
    existing_links = await db.social_media.find_one({})
    
    if not existing_links:
        # Create new configuration
        new_links = SocialMediaLinks(**social_data.dict(exclude_unset=True))
        await db.social_media.insert_one(new_links.dict())
        return new_links
    else:
        # Update existing configuration
        update_data = social_data.dict(exclude_unset=True)
        update_data["updated_date"] = datetime.utcnow()
        
        await db.social_media.update_one(
            {"id": existing_links["id"]},
            {"$set": update_data}
        )
        
        updated_links = await db.social_media.find_one({"id": existing_links["id"]})
        return SocialMediaLinks(**updated_links)

@api_router.get("/public/social-media")
async def get_public_social_media():
    """Get social media links for public/mobile app use"""
    
    social_links = await db.social_media.find_one({"show_in_app": True})
    
    if not social_links:
        return {"links": [], "show_in_app": False}
    
    # Return only non-empty links
    links = {}
    for platform in ["tiktok", "instagram", "facebook", "twitter_x", "whatsapp_channel"]:
        if social_links.get(platform):
            links[platform] = social_links[platform]
    
    return {
        "links": links,
        "show_in_app": social_links.get("show_in_app", True),
        "show_in_footer": social_links.get("show_in_footer", True)
    }

# ==========================================
# ADMIN PROFILE MANAGEMENT
# ==========================================

@api_router.get("/admin/profile", response_model=AdminUser)
async def get_admin_profile(admin = Depends(get_current_admin)):
    """Get current admin profile"""
    return admin

@api_router.put("/admin/profile", response_model=AdminUser)
async def update_admin_profile(update_data: AdminUpdate, admin = Depends(get_current_admin)):
    """Update admin profile"""
    
    update_fields = {"updated_date": datetime.utcnow()}
    
    if update_data.name:
        update_fields["name"] = update_data.name
    if update_data.email:
        # Check if email already exists
        existing_admin = await db.admins.find_one({"email": update_data.email, "id": {"$ne": admin.id}})
        if existing_admin:
            raise HTTPException(status_code=400, detail="Email already exists")
        update_fields["email"] = update_data.email
    if update_data.password:
        update_fields["password"] = get_password_hash(update_data.password)
    if update_data.is_active is not None:
        update_fields["is_active"] = update_data.is_active
    
    await db.admins.update_one(
        {"id": admin.id},
        {"$set": update_fields}
    )
    
    updated_admin = await db.admins.find_one({"id": admin.id})
    return AdminUser(**updated_admin)

@api_router.post("/admin/change-password")
async def change_password(password_data: PasswordChange, admin = Depends(get_current_admin)):
    """Change admin password"""
    
    # Verify current password
    if not verify_password(password_data.current_password, admin.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Hash new password
    new_password_hash = get_password_hash(password_data.new_password)
    
    # Update password
    await db.admins.update_one(
        {"id": admin.id},
        {"$set": {
            "password": new_password_hash,
            "updated_date": datetime.utcnow()
        }}
    )
    
    return {"message": "Password changed successfully"}

@api_router.get("/admin/list")
async def get_admin_list(admin = Depends(get_current_admin)):
    """Get list of all admins"""
    
    admins = await db.admins.find({}).sort("created_date", -1).to_list(100)
    
    # Remove password field from response
    for admin_record in admins:
        admin_record.pop("password", None)
    
    return admins

@api_router.post("/admin/create")
async def create_admin(admin_data: AdminCreate, admin = Depends(get_current_admin)):
    """Create new admin user"""
    
    # Check if email already exists
    existing_admin = await db.admins.find_one({"email": admin_data.email})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create new admin
    new_admin = AdminUser(
        email=admin_data.email,
        name=admin_data.name,
        password=get_password_hash(admin_data.password),
        is_active=admin_data.is_active
    )
    
    await db.admins.insert_one(new_admin.dict())
    
    # Return admin without password
    admin_response = new_admin.dict()
    admin_response.pop("password")
    
    return admin_response

# ==========================================
# SYSTEM CONFIGURATION & FIREBASE
# ==========================================

@api_router.get("/system/config")
async def get_system_config(admin = Depends(get_current_admin)):
    """Get system configuration"""
    
    config = await db.system_config.find_one({})
    
    if not config:
        # Create default configuration
        default_config = DEFAULT_SYSTEM_CONFIG.copy()
        default_config["id"] = str(uuid.uuid4())
        default_config["created_date"] = datetime.utcnow()
        default_config["updated_date"] = datetime.utcnow()
        
        await db.system_config.insert_one(default_config)
        return default_config
    
    return config

@api_router.put("/system/config")
async def update_system_config(config_update: dict, admin = Depends(get_current_admin)):
    """Update system configuration"""
    
    existing_config = await db.system_config.find_one({})
    
    if not existing_config:
        raise HTTPException(status_code=404, detail="System configuration not found")
    
    # Update configuration
    config_update["updated_date"] = datetime.utcnow()
    
    await db.system_config.update_one(
        {"id": existing_config["id"]},
        {"$set": config_update}
    )
    
    updated_config = await db.system_config.find_one({"id": existing_config["id"]})
    return updated_config

@api_router.get("/system/firebase-instructions")
async def get_firebase_instructions(admin = Depends(get_current_admin)):
    """Get Firebase setup instructions"""
    return {"instructions": DEFAULT_FIREBASE_INSTRUCTIONS}

@api_router.post("/system/test-firebase")
async def test_firebase_config(admin = Depends(get_current_admin)):
    """Test Firebase configuration"""
    
    config = await db.system_config.find_one({})
    if not config or not config.get("firebase_config"):
        raise HTTPException(status_code=400, detail="Firebase not configured")
    
    firebase_config = config["firebase_config"]
    
    # Basic validation
    issues = []
    if not firebase_config.get("android_server_key"):
        issues.append("Android Server Key missing")
    if not firebase_config.get("ios_key_content"):
        issues.append("iOS Key Content missing")
    if not firebase_config.get("ios_team_id"):
        issues.append("iOS Team ID missing")
    
    if issues:
        return {"status": "warning", "message": "Configuration incomplete", "issues": issues}
    
    # In a real implementation, you would test actual Firebase connection here
    return {"status": "success", "message": "Firebase configuration appears valid"}

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# ==========================================
# FILE UPLOAD ENDPOINTS
# ==========================================

@api_router.post("/upload/banner", response_model=FileUploadResponse)
async def upload_banner_image(file: UploadFile = File(...), admin = Depends(get_current_admin)):
    """Upload banner image (800x400px recommended)"""
    
    # Validate file type
    if not any(file.filename.lower().endswith(ext) for ext in BANNER_IMAGE_FORMATS):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file format. Supported: {', '.join(BANNER_IMAGE_FORMATS)}"
        )
    
    # Validate file size (2MB max)
    file_content = await file.read()
    file_size_mb = len(file_content) / (1024 * 1024)
    
    if file_size_mb > BANNER_CONFIG["max_file_size_mb"]:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {BANNER_CONFIG['max_file_size_mb']}MB"
        )
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"banner_{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / "banners" / unique_filename
    
    # Create banners directory
    (UPLOAD_DIR / "banners").mkdir(exist_ok=True)
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Generate URL (you'll need to adjust this based on your hosting)
    file_url = f"/uploads/banners/{unique_filename}"
    
    return FileUploadResponse(
        filename=unique_filename,
        url=file_url,
        size_kb=round(len(file_content) / 1024, 2),
        message=f"Banner image uploaded successfully. Recommended size: {BANNER_CONFIG['recommended_size']}"
    )

@api_router.post("/upload/category-thumbnail", response_model=FileUploadResponse)
async def upload_category_thumbnail(file: UploadFile = File(...), admin = Depends(get_current_admin)):
    """Upload category thumbnail (200x200px recommended)"""
    
    # Validate file type
    if not any(file.filename.lower().endswith(ext) for ext in CATEGORY_THUMBNAIL_FORMATS):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format. Supported: {', '.join(CATEGORY_THUMBNAIL_FORMATS)}"
        )
    
    # Validate file size (500KB max)
    file_content = await file.read()
    file_size_mb = len(file_content) / (1024 * 1024)
    
    if file_size_mb > CATEGORY_THUMBNAIL_CONFIG["max_file_size_mb"]:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {CATEGORY_THUMBNAIL_CONFIG['max_file_size_mb']}MB"
        )
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"category_{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / "categories" / unique_filename
    
    # Create categories directory
    (UPLOAD_DIR / "categories").mkdir(exist_ok=True)
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Generate URL
    file_url = f"/uploads/categories/{unique_filename}"
    
    return FileUploadResponse(
        filename=unique_filename,
        url=file_url,
        size_kb=round(len(file_content) / 1024, 2),
        message=f"Category thumbnail uploaded successfully. Recommended size: {CATEGORY_THUMBNAIL_CONFIG['recommended_size']}"
    )

# ==========================================
# HORIZONTAL BANNERS MANAGEMENT
# ==========================================

@api_router.get("/banners", response_model=List[HorizontalBanner])
async def get_banners(is_active: bool = None, admin = Depends(get_current_admin)):
    """Get all horizontal banners"""
    
    query = {}
    if is_active is not None:
        query["is_active"] = is_active
    
    banners = await db.horizontal_banners.find(query).sort("priority", 1).to_list(50)
    return [HorizontalBanner(**banner) for banner in banners]

@api_router.post("/banners", response_model=HorizontalBanner)
async def create_banner(banner_data: HorizontalBannerCreate, admin = Depends(get_current_admin)):
    """Create new horizontal banner"""
    
    # Check max active banners limit
    active_count = await db.horizontal_banners.count_documents({"is_active": True})
    if banner_data.is_active and active_count >= MAX_BANNERS_ACTIVE:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_BANNERS_ACTIVE} active banners allowed"
        )
    
    banner = HorizontalBanner(**banner_data.dict())
    await db.horizontal_banners.insert_one(banner.dict())
    
    return banner

@api_router.put("/banners/{banner_id}", response_model=HorizontalBanner)
async def update_banner(banner_id: str, banner_data: HorizontalBannerUpdate, admin = Depends(get_current_admin)):
    """Update horizontal banner"""
    
    current_banner = await db.horizontal_banners.find_one({"id": banner_id})
    if not current_banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    # Build update data
    update_data = {"updated_date": datetime.utcnow()}
    
    for field, value in banner_data.dict(exclude_unset=True).items():
        update_data[field] = value
    
    # Check active banners limit if activating
    if banner_data.is_active and not current_banner.get("is_active"):
        active_count = await db.horizontal_banners.count_documents({"is_active": True})
        if active_count >= MAX_BANNERS_ACTIVE:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum {MAX_BANNERS_ACTIVE} active banners allowed"
            )
    
    await db.horizontal_banners.update_one(
        {"id": banner_id},
        {"$set": update_data}
    )
    
    updated_banner = await db.horizontal_banners.find_one({"id": banner_id})
    return HorizontalBanner(**updated_banner)

@api_router.post("/banners/{banner_id}/upload-image")
async def upload_banner_image_to_banner(banner_id: str, file: UploadFile = File(...), admin = Depends(get_current_admin)):
    """Upload image directly to a specific banner"""
    
    banner = await db.horizontal_banners.find_one({"id": banner_id})
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    # Upload file using existing endpoint logic
    upload_result = await upload_banner_image(file, admin)
    
    # Update banner with image info
    await db.horizontal_banners.update_one(
        {"id": banner_id},
        {"$set": {
            "image_filename": upload_result.filename,
            "image_url": upload_result.url,
            "image_size_kb": upload_result.size_kb,
            "updated_date": datetime.utcnow()
        }}
    )
    
    return {
        "message": "Banner image uploaded and linked successfully",
        "upload_result": upload_result
    }

@api_router.delete("/banners/{banner_id}")
async def delete_banner(banner_id: str, admin = Depends(get_current_admin)):
    """Delete banner"""
    
    result = await db.horizontal_banners.delete_one({"id": banner_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    return {"message": "Banner deleted successfully"}

@api_router.get("/public/banners", response_model=BannerSliderResponse)
async def get_public_banners():
    """Get active banners for mobile apps (public endpoint)"""
    
    # Get active banners within date range
    now = datetime.utcnow()
    query = {
        "is_active": True,
        "$or": [
            {"start_date": None},
            {"start_date": {"$lte": now}}
        ],
        "$or": [
            {"end_date": None}, 
            {"end_date": {"$gte": now}}
        ]
    }
    
    banners = await db.horizontal_banners.find(query).sort("priority", 1).to_list(MAX_BANNERS_ACTIVE)
    
    config = SliderConfig(
        auto_scroll=True,
        scroll_interval_seconds=5,
        show_indicators=True,
        infinite_loop=True,
        swipe_enabled=True
    )
    
    return BannerSliderResponse(
        banners=[HorizontalBanner(**banner) for banner in banners],
        config=config,
        total_count=len(banners)
    )

@api_router.post("/banners/{banner_id}/view")
async def record_banner_view(banner_id: str):
    """Record banner view (public endpoint)"""
    
    await db.horizontal_banners.update_one(
        {"id": banner_id},
        {"$inc": {"views_count": 1}}
    )
    
    return {"message": "View recorded"}

@api_router.post("/banners/{banner_id}/click")
async def record_banner_click(banner_id: str):
    """Record banner click (public endpoint)"""
    
    await db.horizontal_banners.update_one(
        {"id": banner_id},
        {"$inc": {"clicks_count": 1}}
    )
    
    return {"message": "Click recorded"}

# ==========================================
# CATEGORIES WITH THUMBNAILS
# ==========================================

@api_router.get("/categories", response_model=List[CategoryWithThumbnail])
async def get_categories(admin = Depends(get_current_admin)):
    """Get all categories with thumbnail support"""
    categories = await db.categories.find({"is_active": True}).sort("name", 1).to_list(100)
    return [CategoryWithThumbnail(**category) for category in categories]

@api_router.post("/categories", response_model=CategoryWithThumbnail)
async def create_category(category_data: CategoryCreate, admin = Depends(get_current_admin)):
    """Create new category (thumbnail uploaded separately)"""
    
    category = CategoryWithThumbnail(
        name=category_data.name,
        description=category_data.description or ""
    )
    
    await db.categories.insert_one(category.dict())
    return category

@api_router.post("/categories/{category_id}/upload-thumbnail")
async def upload_category_thumbnail_to_category(category_id: str, file: UploadFile = File(...), admin = Depends(get_current_admin)):
    """Upload thumbnail directly to a specific category"""
    
    category = await db.categories.find_one({"id": category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Upload file using existing endpoint logic
    upload_result = await upload_category_thumbnail(file, admin)
    
    # Update category with thumbnail info
    await db.categories.update_one(
        {"id": category_id},
        {"$set": {
            "thumbnail_filename": upload_result.filename,
            "thumbnail_url": upload_result.url,
            "thumbnail_size_kb": upload_result.size_kb,
            "updated_date": datetime.utcnow()
        }}
    )
    
    return {
        "message": "Category thumbnail uploaded and linked successfully",
        "upload_result": upload_result
    }

@api_router.get("/upload-config")
async def get_upload_config(admin = Depends(get_current_admin)):
    """Get upload configuration and requirements"""
    
    return {
        "banners": BANNER_CONFIG,
        "category_thumbnails": CATEGORY_THUMBNAIL_CONFIG,
        "max_active_banners": MAX_BANNERS_ACTIVE
    }

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Mount the API router
app.include_router(api_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)