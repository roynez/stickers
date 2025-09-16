from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import uuid

# Enums for advanced features
class BannerActionType(str, Enum):
    EXTERNAL_LINK = "external_link"
    CATEGORY = "category"  
    SUBCATEGORY = "subcategory"
    STICKER_PACK = "sticker_pack"

class NotificationPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"  
    HIGH = "high"

class BannerPosition(str, Enum):
    TOP = "top"
    MIDDLE = "middle"
    BOTTOM = "bottom"

# App Features Configuration
class AppFeatures(BaseModel):
    subscriptions_enabled: bool = False
    rating_system_enabled: bool = True
    push_notifications_enabled: bool = True
    banners_enabled: bool = True
    premium_content_enabled: bool = False

class RatingConfig(BaseModel):
    enabled: bool = True
    min_app_opens: int = 5  # Show after X app opens
    min_stickers_downloaded: int = 10  # Show after X stickers downloaded
    days_since_install: int = 3  # Show after X days since install
    show_frequency_days: int = 30  # Ask again every X days
    redirect_to_store: bool = True
    custom_message: Optional[str] = "¿Te gusta nuestra app? ¡Califícanos!"

# Banner/Promotional System
class BannerAction(BaseModel):
    type: BannerActionType
    target_id: Optional[str] = None  # category_id, subcategory_id, etc.
    external_url: Optional[str] = None
    
class PromoBanner(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image_url: str
    action: BannerAction
    position: BannerPosition = BannerPosition.TOP
    is_active: bool = True
    priority: int = 1  # Higher number = higher priority
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    platforms: List[str] = ["ios", "android"]  # Which platforms to show
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class PromoBannerCreate(BaseModel):
    title: str
    description: str
    image_url: str
    action: BannerAction
    position: BannerPosition = BannerPosition.TOP
    is_active: bool = True
    priority: int = 1
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    platforms: List[str] = ["ios", "android"]

# Push Notifications System
class PushNotification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    body: str
    image_url: Optional[str] = None
    action: Optional[BannerAction] = None  # What happens when clicked
    priority: NotificationPriority = NotificationPriority.NORMAL
    platforms: List[str] = ["ios", "android"]
    is_scheduled: bool = False
    scheduled_for: Optional[datetime] = None
    sent_count: int = 0
    success_count: int = 0
    failed_count: int = 0
    status: str = "draft"  # draft, scheduled, sending, sent, failed
    created_date: datetime = Field(default_factory=datetime.utcnow)
    sent_date: Optional[datetime] = None

class PushNotificationCreate(BaseModel):
    title: str
    body: str
    image_url: Optional[str] = None
    action: Optional[BannerAction] = None
    priority: NotificationPriority = NotificationPriority.NORMAL
    platforms: List[str] = ["ios", "android"]
    is_scheduled: bool = False
    scheduled_for: Optional[datetime] = None

class NotificationConfig(BaseModel):
    enabled: bool = True
    firebase_server_key: Optional[str] = None
    apns_key_id: Optional[str] = None
    apns_team_id: Optional[str] = None
    apns_bundle_id: Optional[str] = None
    apns_key_file: Optional[str] = None  # Path to .p8 file
    daily_limit: int = 3  # Max notifications per day per user
    quiet_hours_start: str = "22:00"  # Don't send between these hours
    quiet_hours_end: str = "08:00"

# User App Usage Analytics
class UserAnalytics(BaseModel):
    user_id: str
    app_opens: int = 0
    stickers_downloaded: int = 0
    days_since_install: int = 0
    last_rating_prompt: Optional[datetime] = None
    has_rated: bool = False
    subscription_status: str = "free"  # free, premium
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

# System Configuration (extends existing AppSettings)
class SystemConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    features: AppFeatures = AppFeatures()
    rating_config: RatingConfig = RatingConfig()
    notification_config: NotificationConfig = NotificationConfig()
    updated_date: datetime = Field(default_factory=datetime.utcnow)

# Stats for admin dashboard
class AdvancedStats(BaseModel):
    total_banners: int
    active_banners: int
    total_notifications_sent: int
    notification_success_rate: float
    avg_rating_prompt_conversion: float
    banner_click_through_rate: float

# Banner Analytics
class BannerAnalytics(BaseModel):
    banner_id: str
    impressions: int = 0  # Times shown
    clicks: int = 0  # Times clicked
    conversion_rate: float = 0.0
    last_updated: datetime = Field(default_factory=datetime.utcnow)

# Response models for mobile apps
class AppConfigResponse(BaseModel):
    features: AppFeatures
    rating_config: RatingConfig
    active_banners: List[PromoBanner]
    subscription_plans: List[Dict] = []  # Only if subscriptions enabled

class RatingPromptCheck(BaseModel):
    should_show: bool
    message: str
    redirect_url: Optional[str] = None

DEFAULT_SYSTEM_CONFIG = {
    "features": {
        "subscriptions_enabled": False,
        "rating_system_enabled": True,
        "push_notifications_enabled": True,
        "banners_enabled": True,
        "premium_content_enabled": False
    },
    "rating_config": {
        "enabled": True,
        "min_app_opens": 5,
        "min_stickers_downloaded": 10,
        "days_since_install": 3,
        "show_frequency_days": 30,
        "redirect_to_store": True,
        "custom_message": "¿Te gusta nuestra app? ¡Califícanos!"
    },
    "notification_config": {
        "enabled": True,
        "daily_limit": 3,
        "quiet_hours_start": "22:00",
        "quiet_hours_end": "08:00"
    }
}

# Sample banners for demo
SAMPLE_BANNERS = [
    {
        "id": "welcome_banner",
        "title": "¡Bienvenido!",
        "description": "Descubre miles de stickers increíbles",
        "image_url": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop",
        "action": {
            "type": "category",
            "target_id": "popular_category"
        },
        "position": "top",
        "is_active": True,
        "priority": 5,
        "platforms": ["ios", "android"]
    },
    {
        "id": "new_collection",
        "title": "Nueva Colección",
        "description": "Stickers de temporada disponibles ahora",
        "image_url": "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop",
        "action": {
            "type": "external_link",
            "external_url": "https://tu-sitio-web.com/nueva-coleccion"
        },
        "position": "middle",
        "is_active": True,
        "priority": 3,
        "platforms": ["ios", "android"]
    }
]