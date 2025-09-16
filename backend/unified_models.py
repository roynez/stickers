from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import uuid

# Simplified Sticker Model - UNIFIED
class StickerFiles(BaseModel):
    # For both platforms - user chooses which formats to include
    png: Optional[str] = None        # Standard PNG (works on both)
    webp: Optional[str] = None       # WebP format (works on both) 
    animated_gif: Optional[str] = None  # Animated GIF (works on both)
    # Platform specific if needed
    ios_specific: Optional[str] = None   # Only for iOS special format
    android_specific: Optional[str] = None # Only for Android special format

class UnifiedSticker(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    category_id: str
    sub_category_id: Optional[str] = None
    
    # Unified file storage
    files: StickerFiles
    
    # Simple platform selection
    platforms: List[str] = ["ios", "android"]  # Just checkboxes
    
    # Metadata
    is_active: bool = True
    is_premium: bool = False
    file_size_mb: Optional[float] = None
    dimensions: Optional[str] = None  # "512x512"
    
    # Analytics per platform
    downloads_ios: int = 0
    downloads_android: int = 0
    views_ios: int = 0
    views_android: int = 0
    
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class UnifiedStickerCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: str
    sub_category_id: Optional[str] = None
    files: StickerFiles
    platforms: List[str] = ["ios", "android"]
    is_active: bool = True
    is_premium: bool = False
    file_size_mb: Optional[float] = None
    dimensions: Optional[str] = None

# Admin Management
class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    password: str  # This will be hashed
    role: str = "admin"  # For future expansion
    is_active: bool = True
    last_login: Optional[datetime] = None
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class AdminCreate(BaseModel):
    email: str
    name: str
    password: str
    is_active: bool = True

class AdminUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    password: Optional[str] = None  # Will be hashed if provided
    is_active: Optional[bool] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# Firebase Configuration - Complete Setup
class FirebaseConfig(BaseModel):
    # Android Configuration
    android_server_key: Optional[str] = None
    android_sender_id: Optional[str] = None
    android_project_id: Optional[str] = None
    
    # iOS Configuration  
    ios_key_id: Optional[str] = None
    ios_team_id: Optional[str] = None
    ios_bundle_id: Optional[str] = None
    ios_key_content: Optional[str] = None  # The actual .p8 file content
    
    # General settings
    is_production: bool = False  # Use production or sandbox
    enabled: bool = False

class NotificationTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    title_template: str  # Can use variables like {user_name}
    body_template: str
    image_url: Optional[str] = None
    category: str = "general"  # general, promotion, update, etc.
    created_date: datetime = Field(default_factory=datetime.utcnow)

# Enhanced Analytics
class PlatformStats(BaseModel):
    total_stickers: int
    total_downloads: int
    total_views: int
    active_users: int
    avg_stickers_per_user: float

class UnifiedAnalytics(BaseModel):
    ios_stats: PlatformStats
    android_stats: PlatformStats
    cross_platform_stickers: int  # Stickers available on both
    ios_only_stickers: int
    android_only_stickers: int
    total_revenue_ios: float
    total_revenue_android: float

# User preferences and segmentation
class UserSegment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    criteria: Dict[str, Any]  # e.g., {"platform": "ios", "downloads": ">10"}
    user_count: int = 0
    created_date: datetime = Field(default_factory=datetime.utcnow)

# App Store Configuration
class AppStoreConfig(BaseModel):
    ios_app_id: Optional[str] = None  # For App Store links
    ios_app_store_url: Optional[str] = None
    android_package_name: Optional[str] = None  # For Play Store links  
    android_play_store_url: Optional[str] = None
    
    # Review configuration
    review_prompt_enabled: bool = True
    min_rating_for_store_redirect: float = 4.0  # Only redirect to store if rating >= 4
    
    # Update prompts
    force_update_enabled: bool = False
    min_supported_version: Optional[str] = None

# Complete System Configuration
class SystemSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Feature toggles
    features: Dict[str, bool] = {
        "subscriptions_enabled": False,
        "rating_system_enabled": True,
        "push_notifications_enabled": True,
        "banners_enabled": True,
        "analytics_enabled": True,
        "admin_panel_enabled": True,
        "file_compression": True,
        "auto_webp_conversion": True
    }
    
    # Firebase configuration
    firebase_config: FirebaseConfig = FirebaseConfig()
    
    # App store configuration
    app_store_config: AppStoreConfig = AppStoreConfig()
    
    # Content settings
    max_file_size_mb: float = 10.0
    supported_formats: List[str] = ["png", "webp", "gif"]
    auto_generate_thumbnails: bool = True
    
    # Performance settings
    cache_duration_hours: int = 24
    api_rate_limit_per_minute: int = 100
    
    updated_date: datetime = Field(default_factory=datetime.utcnow)

# Response models for the new unified system
class StickerUploadResponse(BaseModel):
    sticker: UnifiedSticker
    generated_thumbnails: List[str] = []
    converted_formats: List[str] = []
    total_size_mb: float
    estimated_bandwidth_cost: float

class PlatformStickerResponse(BaseModel):
    """Response format for mobile apps - filtered by platform"""
    id: str
    name: str
    description: Optional[str]
    category_id: str
    sub_category_id: Optional[str]
    files: Dict[str, str]  # Only files available for this platform
    is_premium: bool
    file_size_mb: Optional[float]
    dimensions: Optional[str]

DEFAULT_FIREBASE_INSTRUCTIONS = """
# Configuración de Firebase Cloud Messaging

## Para Android:
1. Ve a Firebase Console (https://console.firebase.google.com)
2. Crea un proyecto o selecciona uno existente
3. Ve a Project Settings > Cloud Messaging
4. Copia el "Server Key" y pegalo en "Android Server Key"
5. Copia el "Sender ID" y pegalo en "Android Sender ID"

## Para iOS:
1. En Firebase Console, ve a Project Settings > Cloud Messaging
2. Sube tu archivo .p8 de Apple Developer
3. Copia el Key ID, Team ID y Bundle ID
4. Pega el contenido del archivo .p8 en "iOS Key Content"

## Testear Configuración:
Una vez configurado, puedes enviar una notificación de prueba desde la sección de Notificaciones.
"""