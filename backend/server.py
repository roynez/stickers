from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
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

# Create the main app
app = FastAPI(title="Unified Sticker Admin Panel", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Enums
class Platform(str, Enum):
    IOS = "ios"
    ANDROID = "android"

class StickerType(str, Enum):
    ANIMATED = "animated"
    PNG = "png"
    WEBP = "webp"

# Models
class AdminLogin(BaseModel):
    email: str
    password: str

class AdminResponse(BaseModel):
    id: str
    email: str
    name: str
    token: str

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    image: Optional[str] = None
    platforms: List[Platform] = [Platform.IOS, Platform.ANDROID]
    is_active: bool = True
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str
    image: Optional[str] = None
    platforms: List[Platform] = [Platform.IOS, Platform.ANDROID]
    is_active: bool = True

class SubCategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category_id: str
    name: str
    image: Optional[str] = None
    platforms: List[Platform] = [Platform.IOS, Platform.ANDROID]
    is_active: bool = True
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class SubCategoryCreate(BaseModel):
    category_id: str
    name: str
    image: Optional[str] = None
    platforms: List[Platform] = [Platform.IOS, Platform.ANDROID]
    is_active: bool = True

class StickerFile(BaseModel):
    animated: Optional[str] = None  # For iOS
    png: Optional[str] = None       # For Android
    webp: Optional[str] = None      # For both

class StickerPlatforms(BaseModel):
    ios: Optional[StickerFile] = None
    android: Optional[StickerFile] = None

class Sticker(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category_id: str
    sub_category_id: Optional[str] = None
    name: str
    platforms: StickerPlatforms
    is_active: bool = True
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class StickerCreate(BaseModel):
    category_id: str
    sub_category_id: Optional[str] = None
    name: str
    platforms: StickerPlatforms
    is_active: bool = True

# Enhanced Ad Configuration Models
class AdMobConfig(BaseModel):
    banner: Optional[str] = None              # Banner ads
    interstitial: Optional[str] = None        # Interstitial ads
    rewarded_interstitial: Optional[str] = None  # Rewarded interstitial (BETA)
    rewarded: Optional[str] = None            # Rewarded video ads
    native_advanced: Optional[str] = None     # Native advanced ads
    app_open: Optional[str] = None            # App open ads

class FacebookAdsConfig(BaseModel):
    banner: Optional[str] = None              # Banner placement
    interstitial: Optional[str] = None        # Interstitial placement
    rewarded_video: Optional[str] = None      # Rewarded video placement
    native: Optional[str] = None              # Native ads placement

class UnityAdsConfig(BaseModel):
    game_id: Optional[str] = None             # Unity Game ID
    banner: Optional[str] = None              # Banner placement
    interstitial: Optional[str] = None        # Interstitial placement
    rewarded_video: Optional[str] = None      # Rewarded video placement

class IronSourceConfig(BaseModel):
    app_key: Optional[str] = None             # IronSource App Key
    banner: Optional[str] = None              # Banner instance
    interstitial: Optional[str] = None        # Interstitial instance
    rewarded_video: Optional[str] = None      # Rewarded video instance

class AppLovinConfig(BaseModel):
    sdk_key: Optional[str] = None             # AppLovin SDK Key
    banner: Optional[str] = None              # Banner ad unit
    interstitial: Optional[str] = None        # Interstitial ad unit
    rewarded: Optional[str] = None            # Rewarded ad unit
    native: Optional[str] = None              # Native ad unit

class AdConfig(BaseModel):
    admob: Optional[AdMobConfig] = AdMobConfig()
    facebook: Optional[FacebookAdsConfig] = FacebookAdsConfig()
    unity: Optional[UnityAdsConfig] = UnityAdsConfig()
    ironsource: Optional[IronSourceConfig] = IronSourceConfig()
    applovin: Optional[AppLovinConfig] = AppLovinConfig()

class MonetizationSettings(BaseModel):
    ad_frequency: int = 3                     # Show ad every X sticker views
    reward_amount: int = 10                   # Coins/points for watching rewarded ads
    banner_refresh_rate: int = 30             # Banner refresh in seconds
    interstitial_min_interval: int = 60       # Minimum seconds between interstitials
    enable_test_ads: bool = False             # Show test ads in development

class AppSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ios: AdConfig
    android: AdConfig
    monetization: MonetizationSettings = MonetizationSettings()
    app_version: str = "1.0.0"
    maintenance_mode: bool = False
    privacy_policy_url: Optional[str] = None
    terms_of_service_url: Optional[str] = None
    support_email: Optional[str] = None
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class DashboardStats(BaseModel):
    total_categories: int
    total_subcategories: int
    total_stickers_ios: int
    total_stickers_android: int
    total_stickers: int
    recent_uploads: int

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id: str = payload.get("sub")
        if admin_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        admin = await db.admins.find_one({"id": admin_id})
        if admin is None:
            raise HTTPException(status_code=401, detail="Admin not found")
        return admin
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@api_router.post("/auth/login", response_model=AdminResponse)
async def login(admin_data: AdminLogin):
    admin = await db.admins.find_one({"email": admin_data.email})
    if not admin or not verify_password(admin_data.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": admin["id"], "email": admin["email"]})
    return AdminResponse(
        id=admin["id"],
        email=admin["email"], 
        name=admin["name"],
        token=token
    )

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(admin = Depends(get_current_admin)):
    total_categories = await db.categories.count_documents({"is_active": True})
    total_subcategories = await db.subcategories.count_documents({"is_active": True})
    
    # Count stickers by platform
    ios_stickers = await db.stickers.count_documents({
        "is_active": True,
        "platforms.ios": {"$exists": True, "$ne": None}
    })
    android_stickers = await db.stickers.count_documents({
        "is_active": True, 
        "platforms.android": {"$exists": True, "$ne": None}
    })
    total_stickers = await db.stickers.count_documents({"is_active": True})
    
    # Recent uploads (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_uploads = await db.stickers.count_documents({
        "created_date": {"$gte": week_ago}
    })
    
    return DashboardStats(
        total_categories=total_categories,
        total_subcategories=total_subcategories,
        total_stickers_ios=ios_stickers,
        total_stickers_android=android_stickers,
        total_stickers=total_stickers,
        recent_uploads=recent_uploads
    )

# Categories
@api_router.get("/categories", response_model=List[Category])
async def get_categories(platform: Optional[Platform] = None, admin = Depends(get_current_admin)):
    query = {"is_active": True}
    if platform:
        query["platforms"] = platform
    
    categories = await db.categories.find(query).sort("created_date", -1).to_list(100)
    return [Category(**cat) for cat in categories]

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate, admin = Depends(get_current_admin)):
    category = Category(**category_data.dict())
    await db.categories.insert_one(category.dict())
    return category

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category_data: CategoryCreate, admin = Depends(get_current_admin)):
    update_data = category_data.dict()
    update_data["updated_date"] = datetime.utcnow()
    
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated_category = await db.categories.find_one({"id": category_id})
    return Category(**updated_category)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, admin = Depends(get_current_admin)):
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": {"is_active": False, "updated_date": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

# Subcategories
@api_router.get("/subcategories", response_model=List[SubCategory])
async def get_subcategories(category_id: Optional[str] = None, platform: Optional[Platform] = None, admin = Depends(get_current_admin)):
    query = {"is_active": True}
    if category_id:
        query["category_id"] = category_id
    if platform:
        query["platforms"] = platform
    
    subcategories = await db.subcategories.find(query).sort("created_date", -1).to_list(100)
    return [SubCategory(**subcat) for subcat in subcategories]

@api_router.post("/subcategories", response_model=SubCategory)
async def create_subcategory(subcategory_data: SubCategoryCreate, admin = Depends(get_current_admin)):
    subcategory = SubCategory(**subcategory_data.dict())
    await db.subcategories.insert_one(subcategory.dict())
    return subcategory

# Stickers
@api_router.get("/stickers", response_model=List[Sticker])
async def get_stickers(
    category_id: Optional[str] = None,
    sub_category_id: Optional[str] = None,
    platform: Optional[Platform] = None,
    admin = Depends(get_current_admin)
):
    query = {"is_active": True}
    if category_id:
        query["category_id"] = category_id
    if sub_category_id:
        query["sub_category_id"] = sub_category_id
    if platform:
        query[f"platforms.{platform}"] = {"$exists": True, "$ne": None}
    
    stickers = await db.stickers.find(query).sort("created_date", -1).to_list(100)
    return [Sticker(**sticker) for sticker in stickers]

@api_router.post("/stickers", response_model=Sticker)
async def create_sticker(sticker_data: StickerCreate, admin = Depends(get_current_admin)):
    sticker = Sticker(**sticker_data.dict())
    await db.stickers.insert_one(sticker.dict())
    return sticker

# App Settings
@api_router.get("/settings", response_model=AppSettings)
async def get_app_settings(admin = Depends(get_current_admin)):
    settings = await db.settings.find_one()
    if not settings:
        # Create default settings
        default_settings = AppSettings(
            ios=AdConfig(),
            android=AdConfig()
        )
        await db.settings.insert_one(default_settings.dict())
        return default_settings
    return AppSettings(**settings)

@api_router.put("/settings", response_model=AppSettings)
async def update_app_settings(settings_data: AppSettings, admin = Depends(get_current_admin)):
    settings_data.updated_date = datetime.utcnow()
    
    await db.settings.update_one(
        {},
        {"$set": settings_data.dict()},
        upsert=True
    )
    
    return settings_data

# Initialize default admin
@api_router.post("/init-admin")
async def initialize_admin():
    existing_admin = await db.admins.find_one()
    if existing_admin:
        return {"message": "Admin already exists"}
    
    admin = {
        "id": str(uuid.uuid4()),
        "email": "admin@stickers.com",
        "password": hash_password("admin123"),
        "name": "Admin",
        "created_date": datetime.utcnow()
    }
    
    await db.admins.insert_one(admin)
    return {"message": "Default admin created", "email": "admin@stickers.com", "password": "admin123"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)