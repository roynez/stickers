from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import uuid

# Banner Action Types (sin cambios)
class BannerActionType(str, Enum):
    EXTERNAL_LINK = "external_link"
    PACKAGE_DETAIL = "package_detail"
    CATEGORY = "category"
    NONE = "none"

class BannerAction(BaseModel):
    type: BannerActionType
    value: Optional[str] = None  # URL, package_id, category_id, etc.

# Nuevo modelo de Banner Horizontal (sin posición)
class HorizontalBanner(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    
    # Archivo de imagen (en lugar de URL)
    image_filename: Optional[str] = None  # Nombre del archivo subido
    image_url: Optional[str] = None       # URL generada después de subir
    image_size_kb: Optional[float] = None # Tamaño del archivo
    
    # Acción del banner
    action: BannerAction
    
    # Configuración
    is_active: bool = True
    priority: int = 1  # Para el orden en el slider (1=primero)
    
    # Programación temporal
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    # Plataformas
    platforms: List[str] = ["ios", "android"]
    
    # Métricas
    views_count: int = 0
    clicks_count: int = 0
    
    # Fechas
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class HorizontalBannerCreate(BaseModel):
    title: str
    description: str
    action: BannerAction
    is_active: bool = True
    priority: int = 1
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    platforms: List[str] = ["ios", "android"]

class HorizontalBannerUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    action: Optional[BannerAction] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    platforms: Optional[List[str]] = None

# Modelo de Categoría con Thumbnail
class CategoryWithThumbnail(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    
    # Thumbnail personalizado
    thumbnail_filename: Optional[str] = None  # Nombre del archivo subido
    thumbnail_url: Optional[str] = None       # URL generada después de subir
    thumbnail_size_kb: Optional[float] = None # Tamaño del archivo
    
    # Configuración
    is_active: bool = True
    package_count: int = 0  # Calculado automáticamente
    
    # Estadísticas
    total_downloads: int = 0
    total_likes: int = 0
    
    # Fechas
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# Respuesta para subida de archivos
class FileUploadResponse(BaseModel):
    filename: str
    url: str
    size_kb: float
    message: str

# Banner Analytics
class BannerAnalytics(BaseModel):
    banner_id: str
    banner_title: str
    views_count: int
    clicks_count: int
    click_through_rate: float
    platforms: List[str]
    is_active: bool
    created_date: datetime

# Configuración de archivos
BANNER_CONFIG = {
    "recommended_size": "800x400px",
    "aspect_ratio": "2:1 (ancho:alto)",
    "max_file_size_mb": 2.0,
    "supported_formats": ["PNG", "JPG", "JPEG", "WebP"],
    "description": "Banners rectangulares para slider horizontal en apps móviles"
}

CATEGORY_THUMBNAIL_CONFIG = {
    "recommended_size": "200x200px", 
    "aspect_ratio": "1:1 (cuadrado)",
    "max_file_size_mb": 0.5,
    "supported_formats": ["PNG", "JPG", "JPEG", "WebP"],
    "description": "Miniaturas cuadradas para iconos de categorías"
}

# Slider Configuration
class SliderConfig(BaseModel):
    auto_scroll: bool = True
    scroll_interval_seconds: int = 5
    show_indicators: bool = True
    infinite_loop: bool = True
    swipe_enabled: bool = True
    
# Response para el slider móvil
class BannerSliderResponse(BaseModel):
    banners: List[HorizontalBanner]
    config: SliderConfig
    total_count: int

# Constantes para validación
MAX_BANNERS_ACTIVE = 10  # Máximo 10 banners activos simultáneamente
BANNER_IMAGE_FORMATS = [".png", ".jpg", ".jpeg", ".webp"]
CATEGORY_THUMBNAIL_FORMATS = [".png", ".jpg", ".jpeg", ".webp"]