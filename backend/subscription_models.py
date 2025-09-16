from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import uuid

# Enums
class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    PENDING = "pending"
    TRIAL = "trial"

class SubscriptionPlatform(str, Enum):
    IOS = "ios"
    ANDROID = "android"
    WEB = "web"

class PlanDuration(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

# Models
class SubscriptionPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price_mxn: float
    duration: PlanDuration
    features: List[str]
    ios_product_id: Optional[str] = None
    android_product_id: Optional[str] = None
    is_active: bool = True
    discount_percentage: Optional[int] = None
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class SubscriptionPlanCreate(BaseModel):
    name: str
    description: str
    price_mxn: float
    duration: PlanDuration
    features: List[str]
    ios_product_id: Optional[str] = None
    android_product_id: Optional[str] = None
    is_active: bool = True
    discount_percentage: Optional[int] = None

class UserSubscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # This would be the user's device ID or user identifier
    plan_id: str
    status: SubscriptionStatus
    platform: SubscriptionPlatform
    start_date: datetime
    expires_at: datetime
    transaction_id: Optional[str] = None  # Store receipt/transaction ID
    auto_renewal: bool = True
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class UserSubscriptionCreate(BaseModel):
    user_id: str
    plan_id: str
    platform: SubscriptionPlatform
    transaction_id: Optional[str] = None
    auto_renewal: bool = True

class SubscriptionStats(BaseModel):
    total_active_subscribers: int
    monthly_subscribers: int
    yearly_subscribers: int
    monthly_revenue: float
    yearly_revenue: float
    total_revenue: float
    conversion_rate: float
    churn_rate: float
    avg_revenue_per_user: float

class SubscriptionCheck(BaseModel):
    user_id: str
    has_active_subscription: bool
    subscription_type: Optional[str] = None
    expires_at: Optional[datetime] = None
    features: List[str] = []

# Default subscription plans
DEFAULT_PLANS = [
    {
        "id": "support_monthly",
        "name": "Apoyo Mensual al Creador",
        "description": "Apoya al creador de estos increíbles stickers y disfruta sin anuncios",
        "price_mxn": 50.0,
        "duration": "monthly",
        "features": [
            "no_ads",
            "support_creator",
            "premium_badge",
            "priority_support"
        ],
        "ios_product_id": "com.stickerapp.support.monthly",
        "android_product_id": "support_monthly",
        "is_active": True,
        "discount_percentage": None
    },
    {
        "id": "support_yearly",
        "name": "Apoyo Anual al Creador",
        "description": "¡La mejor forma de apoyar! 33% de descuento - Solo $400 MXN al año",
        "price_mxn": 400.0,
        "duration": "yearly", 
        "features": [
            "no_ads",
            "support_creator",
            "premium_badge",
            "priority_support",
            "exclusive_content",
            "early_access"
        ],
        "ios_product_id": "com.stickerapp.support.yearly",
        "android_product_id": "support_yearly",
        "is_active": True,
        "discount_percentage": 33
    }
]

SUBSCRIPTION_FEATURES = {
    "no_ads": {
        "name": "Sin Anuncios",
        "description": "Disfruta de todos los stickers sin interrupciones publicitarias"
    },
    "support_creator": {
        "name": "Apoyo al Creador",
        "description": "Tu suscripción ayuda directamente al creador a seguir haciendo stickers increíbles"
    },
    "premium_badge": {
        "name": "Insignia Premium",
        "description": "Muestra que apoyas al creador con una insignia especial"
    },
    "priority_support": {
        "name": "Soporte Prioritario",
        "description": "Recibe ayuda más rápida cuando la necesites"
    },
    "exclusive_content": {
        "name": "Contenido Exclusivo",
        "description": "Acceso a stickers exclusivos solo para suscriptores anuales"
    },
    "early_access": {
        "name": "Acceso Anticipado",
        "description": "Sé el primero en ver los nuevos stickers antes que nadie"
    }
}