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

# Import subscription models
from subscription_models import (
    SubscriptionPlan, SubscriptionPlanCreate, UserSubscription, UserSubscriptionCreate,
    SubscriptionStats, SubscriptionCheck, SubscriptionStatus, SubscriptionPlatform,
    PlanDuration, DEFAULT_PLANS, SUBSCRIPTION_FEATURES
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

# Create the main app
app = FastAPI(title="Unified Sticker Admin Panel with Subscriptions", version="2.0.0")

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

# Existing Models (keeping all the original models)
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
    is_premium: bool = False  # New field for premium categories
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str
    image: Optional[str] = None
    platforms: List[Platform] = [Platform.IOS, Platform.ANDROID]
    is_active: bool = True
    is_premium: bool = False

class SubCategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category_id: str
    name: str
    image: Optional[str] = None
    platforms: List[Platform] = [Platform.IOS, Platform.ANDROID]
    is_active: bool = True
    is_premium: bool = False  # New field for premium subcategories
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class SubCategoryCreate(BaseModel):
    category_id: str
    name: str
    image: Optional[str] = None
    platforms: List[Platform] = [Platform.IOS, Platform.ANDROID]
    is_active: bool = True
    is_premium: bool = False

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
    is_premium: bool = False  # New field for premium stickers
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class StickerCreate(BaseModel):
    category_id: str
    sub_category_id: Optional[str] = None
    name: str
    platforms: StickerPlatforms
    is_active: bool = True
    is_premium: bool = False

# Enhanced Ad Configuration Models (keeping existing)
class AdMobConfig(BaseModel):
    banner: Optional[str] = None
    interstitial: Optional[str] = None
    rewarded_interstitial: Optional[str] = None
    rewarded: Optional[str] = None
    native_advanced: Optional[str] = None
    app_open: Optional[str] = None

class FacebookAdsConfig(BaseModel):
    banner: Optional[str] = None
    interstitial: Optional[str] = None
    rewarded_video: Optional[str] = None
    native: Optional[str] = None

class UnityAdsConfig(BaseModel):
    game_id: Optional[str] = None
    banner: Optional[str] = None
    interstitial: Optional[str] = None
    rewarded_video: Optional[str] = None

class IronSourceConfig(BaseModel):
    app_key: Optional[str] = None
    banner: Optional[str] = None
    interstitial: Optional[str] = None
    rewarded_video: Optional[str] = None

class AppLovinConfig(BaseModel):
    sdk_key: Optional[str] = None
    banner: Optional[str] = None
    interstitial: Optional[str] = None
    rewarded: Optional[str] = None
    native: Optional[str] = None

class AdConfig(BaseModel):
    admob: Optional[AdMobConfig] = AdMobConfig()
    facebook: Optional[FacebookAdsConfig] = FacebookAdsConfig()
    unity: Optional[UnityAdsConfig] = UnityAdsConfig()
    ironsource: Optional[IronSourceConfig] = IronSourceConfig()
    applovin: Optional[AppLovinConfig] = AppLovinConfig()

class MonetizationSettings(BaseModel):
    ad_frequency: int = 3
    reward_amount: int = 10
    banner_refresh_rate: int = 30
    interstitial_min_interval: int = 60
    enable_test_ads: bool = False
    subscription_removes_ads: bool = True  # New field

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
    # New subscription stats
    total_subscribers: int
    monthly_revenue: float
    active_subscriptions: int

# Helper Functions (keeping existing)
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

# Existing Routes (Auth and Dashboard)
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
    
    # Subscription stats
    total_subscribers = await db.user_subscriptions.count_documents({
        "status": {"$in": ["active", "trial"]}
    })
    
    # Calculate monthly revenue (active subscriptions)
    active_monthly_subs = await db.user_subscriptions.count_documents({
        "status": "active",
        "plan_id": "support_monthly"
    })
    active_yearly_subs = await db.user_subscriptions.count_documents({
        "status": "active", 
        "plan_id": "support_yearly"
    })
    
    monthly_revenue = (active_monthly_subs * 50.0) + (active_yearly_subs * 400.0 / 12)
    
    return DashboardStats(
        total_categories=total_categories,
        total_subcategories=total_subcategories,
        total_stickers_ios=ios_stickers,
        total_stickers_android=android_stickers,
        total_stickers=total_stickers,
        recent_uploads=recent_uploads,
        total_subscribers=total_subscribers,
        monthly_revenue=round(monthly_revenue, 2),
        active_subscriptions=total_subscribers
    )

# SUBSCRIPTION ROUTES
@api_router.get("/subscriptions/plans", response_model=List[SubscriptionPlan])
async def get_subscription_plans(admin = Depends(get_current_admin)):
    plans = await db.subscription_plans.find({"is_active": True}).sort("price_mxn", 1).to_list(100)
    return [SubscriptionPlan(**plan) for plan in plans]

@api_router.post("/subscriptions/plans", response_model=SubscriptionPlan)
async def create_subscription_plan(plan_data: SubscriptionPlanCreate, admin = Depends(get_current_admin)):
    plan = SubscriptionPlan(**plan_data.dict())
    await db.subscription_plans.insert_one(plan.dict())
    return plan

@api_router.put("/subscriptions/plans/{plan_id}", response_model=SubscriptionPlan)
async def update_subscription_plan(plan_id: str, plan_data: SubscriptionPlanCreate, admin = Depends(get_current_admin)):
    update_data = plan_data.dict()
    update_data["updated_date"] = datetime.utcnow()
    
    result = await db.subscription_plans.update_one(
        {"id": plan_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    updated_plan = await db.subscription_plans.find_one({"id": plan_id})
    return SubscriptionPlan(**updated_plan)

@api_router.get("/subscriptions/stats", response_model=SubscriptionStats)
async def get_subscription_stats(admin = Depends(get_current_admin)):
    # Total active subscribers
    total_active = await db.user_subscriptions.count_documents({
        "status": {"$in": ["active", "trial"]}
    })
    
    # Monthly subscribers
    monthly_subs = await db.user_subscriptions.count_documents({
        "status": "active",
        "plan_id": "support_monthly"
    })
    
    # Yearly subscribers
    yearly_subs = await db.user_subscriptions.count_documents({
        "status": "active",
        "plan_id": "support_yearly"
    })
    
    # Revenue calculations
    monthly_revenue = monthly_subs * 50.0
    yearly_revenue = yearly_subs * 400.0
    total_revenue = monthly_revenue + yearly_revenue
    
    # Simple conversion rate (this would need more complex logic in production)
    total_users = await db.user_subscriptions.distinct("user_id")
    conversion_rate = (total_active / max(len(total_users), 1)) * 100 if total_users else 0
    
    # Churn rate (simplified - expired in last month vs total)
    month_ago = datetime.utcnow() - timedelta(days=30)
    expired_last_month = await db.user_subscriptions.count_documents({
        "status": "expired",
        "updated_date": {"$gte": month_ago}
    })
    churn_rate = (expired_last_month / max(total_active, 1)) * 100 if total_active > 0 else 0
    
    # ARPU (Average Revenue Per User)
    arpu = total_revenue / max(total_active, 1) if total_active > 0 else 0
    
    return SubscriptionStats(
        total_active_subscribers=total_active,
        monthly_subscribers=monthly_subs,
        yearly_subscribers=yearly_subs,
        monthly_revenue=monthly_revenue,
        yearly_revenue=yearly_revenue,
        total_revenue=total_revenue,
        conversion_rate=round(conversion_rate, 2),
        churn_rate=round(churn_rate, 2),
        avg_revenue_per_user=round(arpu, 2)
    )

@api_router.get("/subscriptions/users")
async def get_subscription_users(
    limit: int = 50,
    offset: int = 0,
    status: Optional[SubscriptionStatus] = None,
    admin = Depends(get_current_admin)
):
    query = {}
    if status:
        query["status"] = status
    
    subscriptions = await db.user_subscriptions.find(query)\
        .sort("created_date", -1)\
        .skip(offset)\
        .limit(limit)\
        .to_list(limit)
    
    return [UserSubscription(**sub) for sub in subscriptions]

@api_router.post("/subscriptions/users", response_model=UserSubscription)
async def create_user_subscription(subscription_data: UserSubscriptionCreate, admin = Depends(get_current_admin)):
    # Get the plan to calculate expiration date
    plan = await db.subscription_plans.find_one({"id": subscription_data.plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    
    # Calculate expiration date
    start_date = datetime.utcnow()
    if plan["duration"] == "monthly":
        expires_at = start_date + timedelta(days=30)
    else:  # yearly
        expires_at = start_date + timedelta(days=365)
    
    subscription = UserSubscription(
        **subscription_data.dict(),
        status=SubscriptionStatus.ACTIVE,
        start_date=start_date,
        expires_at=expires_at
    )
    
    await db.user_subscriptions.insert_one(subscription.dict())
    return subscription

# Public API for mobile apps to check subscription status
@api_router.get("/subscriptions/check/{user_id}", response_model=SubscriptionCheck)
async def check_user_subscription(user_id: str):
    # Find active subscription
    subscription = await db.user_subscriptions.find_one({
        "user_id": user_id,
        "status": {"$in": ["active", "trial"]},
        "expires_at": {"$gt": datetime.utcnow()}
    })
    
    if not subscription:
        return SubscriptionCheck(
            user_id=user_id,
            has_active_subscription=False
        )
    
    # Get plan details
    plan = await db.subscription_plans.find_one({"id": subscription["plan_id"]})
    
    return SubscriptionCheck(
        user_id=user_id,
        has_active_subscription=True,
        subscription_type=plan["name"] if plan else "Unknown",
        expires_at=subscription["expires_at"],
        features=plan["features"] if plan else []
    )

# Initialize default subscription plans
@api_router.post("/subscriptions/init-plans")
async def initialize_subscription_plans(admin = Depends(get_current_admin)):
    existing_plans = await db.subscription_plans.count_documents({})
    if existing_plans > 0:
        return {"message": "Plans already exist"}
    
    for plan_data in DEFAULT_PLANS:
        plan_data["created_date"] = datetime.utcnow()
        plan_data["updated_date"] = datetime.utcnow()
        await db.subscription_plans.insert_one(plan_data)
    
    return {"message": "Default subscription plans created", "count": len(DEFAULT_PLANS)}

# Categories (updated with premium support)
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

# Subcategories (keeping existing with premium support)
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

# Stickers (keeping existing with premium support)
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

# App Settings (keeping existing)
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