from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import uuid

# Sticker individual dentro de un paquete
class StickerFile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str  # Nombre original del archivo
    url: str  # URL donde está alojado el sticker
    file_size_kb: Optional[float] = None
    dimensions: Optional[str] = "512x512"  # Estándar WhatsApp
    order_index: int = 0  # Orden dentro del paquete
    created_date: datetime = Field(default_factory=datetime.utcnow)

# Paquete de Stickers
class StickerPackage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # Nombre del paquete
    description: Optional[str] = None
    category_id: str  # Solo categorías, sin subcategorías
    
    # Stickers del paquete (orden importante)
    stickers: List[StickerFile] = []
    total_stickers: int = 0  # Calculado automáticamente
    
    # Configuración de plataforma
    platforms: List[str] = ["ios", "android"]  # Disponibilidad
    
    # Métricas de popularidad
    likes_count: int = 0
    downloads_ios: int = 0
    downloads_android: int = 0
    recent_downloads_7d: int = 0  # Downloads últimos 7 días
    popularity_score: float = 0.0  # Calculado con algoritmo
    popularity_rank: str = "📦 Nuevo"  # Categoria visual
    
    # Configuración
    is_active: bool = True
    is_premium: bool = False
    is_featured: bool = False  # Destacado por admin
    
    # Fechas
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)
    last_download_date: Optional[datetime] = None
    
    # Metadata adicional
    total_size_mb: Optional[float] = None  # Tamaño total del paquete
    average_rating: Optional[float] = None  # Para futuras mejoras

class StickerPackageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: str
    platforms: List[str] = ["ios", "android"]
    is_premium: bool = False
    is_featured: bool = False
    stickers: List[Dict[str, Any]] = []  # Lista de URLs y nombres

class StickerPackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    platforms: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_premium: Optional[bool] = None
    is_featured: Optional[bool] = None

# Modelo para agregar stickers a paquete existente
class AddStickersToPackage(BaseModel):
    stickers: List[Dict[str, Any]]  # Lista de nuevos stickers

# Modelo para reordenar stickers
class ReorderStickers(BaseModel):
    sticker_orders: List[Dict[str, int]]  # [{"sticker_id": "id", "new_order": 1}]

# Redes Sociales
class SocialMediaLinks(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tiktok: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    twitter_x: Optional[str] = None  # X (antes Twitter)
    whatsapp_channel: Optional[str] = None
    
    # Configuración de visibilidad
    show_in_app: bool = True
    show_in_footer: bool = True
    
    created_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

class SocialMediaUpdate(BaseModel):
    tiktok: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    twitter_x: Optional[str] = None
    whatsapp_channel: Optional[str] = None
    show_in_app: Optional[bool] = None
    show_in_footer: Optional[bool] = None

# Métricas de popularidad detalladas
class PopularityMetrics(BaseModel):
    package_id: str
    package_name: str
    category_name: str
    
    # Métricas base
    likes_count: int
    total_downloads: int
    downloads_ios: int
    downloads_android: int
    recent_downloads_7d: int
    
    # Score calculado
    popularity_score: float
    popularity_rank: str
    
    # Análisis temporal
    download_trend: str  # "increasing", "stable", "decreasing"
    days_since_creation: int
    
    # Engagement
    like_to_download_ratio: float
    cross_platform_usage: bool

# Analytics para dashboard
class PackageAnalytics(BaseModel):
    # Top packages
    top_packages_by_popularity: List[PopularityMetrics]
    top_packages_by_downloads: List[PopularityMetrics]
    trending_packages_7d: List[PopularityMetrics]
    
    # Estadísticas generales
    total_packages: int
    total_likes: int
    total_downloads: int
    
    # Por plataforma
    ios_packages: int
    android_packages: int
    cross_platform_packages: int
    
    # Tendencias
    packages_created_this_week: int
    downloads_this_week: int
    likes_this_week: int
    
    # Top categorías
    top_categories_by_packages: List[Dict[str, Any]]
    top_categories_by_popularity: List[Dict[str, Any]]

# Algoritmo de popularidad
class PopularityCalculator:
    @staticmethod
    def calculate_popularity_score(
        likes: int,
        total_downloads: int,
        recent_downloads_7d: int,
        days_since_creation: int,
        is_cross_platform: bool
    ) -> float:
        """
        Algoritmo optimizado para popularidad de paquetes de stickers
        """
        # Componentes del score
        likes_score = likes * 3.0
        downloads_score = total_downloads * 1.5
        recent_score = recent_downloads_7d * 2.0
        
        # Factor de decaimiento temporal (favorece contenido reciente pero no penaliza mucho el antiguo)
        time_decay = max(0.1, 1.0 - (days_since_creation / 365))
        time_score = time_decay * 0.8
        
        # Bonus por cross-platform
        cross_platform_bonus = 1.2 if is_cross_platform else 0
        
        # Score final
        total_score = (
            likes_score + 
            downloads_score + 
            recent_score + 
            time_score + 
            cross_platform_bonus
        )
        
        return round(total_score, 2)
    
    @staticmethod
    def get_popularity_rank(score: float) -> str:
        """Determina el rango visual basado en el score"""
        if score >= 100:
            return "🔥 Viral"
        elif score >= 75:
            return "⭐ Trending"
        elif score >= 50:
            return "📈 Popular"
        elif score >= 25:
            return "👍 Creciendo"
        else:
            return "📦 Nuevo"
    
    @staticmethod
    def analyze_trend(current_downloads: int, previous_downloads: int) -> str:
        """Analiza la tendencia de descargas"""
        if previous_downloads == 0:
            return "new"
        
        growth_rate = (current_downloads - previous_downloads) / previous_downloads
        
        if growth_rate > 0.2:
            return "increasing"
        elif growth_rate < -0.2:
            return "decreasing"
        else:
            return "stable"

# Response models para API
class PackageResponse(BaseModel):
    """Response optimizada para aplicaciones móviles"""
    id: str
    name: str
    description: Optional[str]
    category_id: str
    category_name: Optional[str]
    
    total_stickers: int
    stickers: List[StickerFile]
    
    platforms: List[str]
    is_premium: bool
    is_featured: bool
    
    # Métricas de popularidad (para mostrar en app)
    likes_count: int
    total_downloads: int
    popularity_rank: str
    
    created_date: datetime

class PackageListResponse(BaseModel):
    """Response para listado con paginación"""
    packages: List[PackageResponse]
    total_count: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

# Constantes
STICKER_FORMATS = ["png", "webp"]  # Solo formatos necesarios para WhatsApp
MAX_STICKERS_PER_PACKAGE = 30  # Límite WhatsApp
MIN_STICKERS_PER_PACKAGE = 3   # Mínimo para crear paquete
STICKER_SIZE_REQUIREMENTS = {
    "min_size": "512x512",
    "max_size": "512x512",  # WhatsApp requiere exactamente 512x512
    "max_file_size_kb": 100  # 100KB máximo por sticker
}