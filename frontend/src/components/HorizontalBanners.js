import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Calendar,
  MousePointer,
  Activity,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Package,
  FolderOpen,
  X,
  Info,
  BarChart3
} from 'lucide-react';

export default function HorizontalBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploadConfig, setUploadConfig] = useState(null);
  const [previewSlider, setPreviewSlider] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    action: {
      type: 'external_link',
      value: ''
    },
    is_active: true,
    priority: 1,
    start_date: '',
    end_date: '',
    platforms: ['ios', 'android']
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Preview slider auto-scroll
  useEffect(() => {
    if (previewSlider && banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % banners.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [previewSlider, banners.length]);

  const fetchData = async () => {
    try {
      const [bannersRes, configRes] = await Promise.all([
        axios.get('/banners'),
        axios.get('/upload-config')
      ]);
      
      setBanners(bannersRes.data);
      setUploadConfig(configRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let bannerData = { ...formData };
      
      // Convert dates
      if (bannerData.start_date) {
        bannerData.start_date = new Date(bannerData.start_date).toISOString();
      } else {
        bannerData.start_date = null;
      }
      
      if (bannerData.end_date) {
        bannerData.end_date = new Date(bannerData.end_date).toISOString();
      } else {
        bannerData.end_date = null;
      }

      let banner;
      if (editingBanner) {
        const response = await axios.put(`/banners/${editingBanner.id}`, bannerData);
        banner = response.data;
        toast.success('Banner actualizado correctamente');
      } else {
        const response = await axios.post('/banners', bannerData);
        banner = response.data;
        toast.success('Banner creado correctamente');
      }

      // Upload image if selected
      if (selectedFile) {
        await uploadImageToBanner(banner.id);
      }
      
      fetchData();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar banner');
    }
  };

  const uploadImageToBanner = async (bannerId) => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post(`/banners/${bannerId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Imagen subida correctamente');
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (bannerId, bannerTitle) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el banner "${bannerTitle}"?`)) {
      try {
        await axios.delete(`/banners/${bannerId}`);
        toast.success('Banner eliminado correctamente');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar banner');
      }
    }
  };

  const openModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        description: banner.description,
        action: banner.action,
        is_active: banner.is_active,
        priority: banner.priority,
        start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
        end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
        platforms: banner.platforms || ['ios', 'android']
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        description: '',
        action: {
          type: 'external_link',
          value: ''
        },
        is_active: true,
        priority: banners.length + 1,
        start_date: '',
        end_date: '',
        platforms: ['ios', 'android']
      });
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setSelectedFile(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size
      const maxSizeMB = uploadConfig?.banners?.max_file_size_mb || 2;
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`El archivo es muy grande. Máximo ${maxSizeMB}MB`);
        return;
      }

      // Validate file type
      const supportedFormats = uploadConfig?.banners?.supported_formats || ['PNG', 'JPG', 'JPEG', 'WebP'];
      const fileExtension = file.name.split('.').pop().toUpperCase();
      if (!supportedFormats.includes(fileExtension)) {
        toast.error(`Formato no soportado. Use: ${supportedFormats.join(', ')}`);
        return;
      }

      setSelectedFile(file);
    }
  };

  const togglePlatform = (platform) => {
    const updatedPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform];
    
    setFormData({ ...formData, platforms: updatedPlatforms });
  };

  const getActionTypeLabel = (type) => {
    const types = {
      'external_link': 'Enlace Externo',
      'package_detail': 'Detalle de Paquete',
      'category': 'Categoría',
      'none': 'Sin Acción'
    };
    return types[type] || type;
  };

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeBanners = banners.filter(b => b.is_active);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎯 Banners Horizontales</h1>
          <p className="text-gray-600 mt-1">Slider horizontal para apps móviles (800x400px)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewSlider(!previewSlider)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              previewSlider 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {previewSlider ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            Vista Previa
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nuevo Banner
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Banners</p>
              <p className="text-2xl font-bold text-gray-900">{banners.length}</p>
            </div>
            <ImageIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">{activeBanners.length}</p>
            </div>
            <Eye className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vistas</p>
              <p className="text-2xl font-bold text-purple-600">
                {banners.reduce((sum, b) => sum + (b.views_count || 0), 0)}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-orange-600">
                {banners.reduce((sum, b) => sum + (b.clicks_count || 0), 0)}
              </p>
            </div>
            <MousePointer className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Upload Guidelines */}
      {uploadConfig && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">📐 Especificaciones de Banners</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p><strong>Tamaño recomendado:</strong> {uploadConfig.banners.recommended_size}</p>
                  <p><strong>Proporción:</strong> {uploadConfig.banners.aspect_ratio}</p>
                </div>
                <div>
                  <p><strong>Tamaño máximo:</strong> {uploadConfig.banners.max_file_size_mb}MB</p>
                  <p><strong>Formatos:</strong> {uploadConfig.banners.supported_formats.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Slider */}
      {previewSlider && activeBanners.length > 0 && (
        <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">📱 Vista Previa - Slider Móvil</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide(prev => prev > 0 ? prev - 1 : activeBanners.length - 1)}
                className="p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="text-white text-sm">
                {currentSlide + 1} / {activeBanners.length}
              </span>
              <button
                onClick={() => setCurrentSlide(prev => (prev + 1) % activeBanners.length)}
                className="p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-1 max-w-md mx-auto">
            <div className="relative aspect-[2/1] bg-gray-100 rounded-lg overflow-hidden">
              {activeBanners[currentSlide]?.image_url ? (
                <img
                  src={activeBanners[currentSlide].image_url}
                  alt={activeBanners[currentSlide].title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              {/* Overlay with banner info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h4 className="text-white font-semibold text-sm">
                  {activeBanners[currentSlide]?.title}
                </h4>
                <p className="text-white text-xs opacity-90">
                  {activeBanners[currentSlide]?.description}
                </p>
              </div>
            </div>
            
            {/* Indicators */}
            <div className="flex justify-center gap-1 mt-2">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar banners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Banners List */}
      {filteredBanners.length === 0 && !loading ? (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay banners</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No se encontraron banners con ese término.' : 'Comienza creando un nuevo banner horizontal.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex">
                {/* Banner Preview */}
                <div className="w-48 h-24 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {banner.image_url ? (
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                {/* Banner Info */}
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{banner.title}</h3>
                      <div className="flex items-center gap-2">
                        {banner.is_active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            Inactivo
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Prioridad #{banner.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3">{banner.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Acción:</span>
                      <p className="font-medium">{getActionTypeLabel(banner.action.type)}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Plataformas:</span>
                      <div className="flex gap-1 mt-1">
                        {banner.platforms.includes('ios') && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">iOS</span>
                        )}
                        {banner.platforms.includes('android') && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Android</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-500">Estadísticas:</span>
                      <p className="font-medium">{banner.views_count || 0} vistas, {banner.clicks_count || 0} clicks</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(banner)}
                        className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Edit2 className="h-3 w-3" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id, banner.title)}
                        className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors text-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBanner ? 'Editar Banner' : 'Nuevo Banner Horizontal'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título del Banner
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad (orden en slider)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Image Upload */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">📷 Imagen del Banner</h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Tamaño recomendado: {uploadConfig?.banners?.recommended_size} (ratio 2:1)
                  </p>
                  
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        📁 {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                      </p>
                    </div>
                  )}

                  {editingBanner?.image_url && !selectedFile && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                      <img
                        src={editingBanner.image_url}
                        alt="Current banner"
                        className="h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                {/* Action Configuration */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">🎯 Acción al Tocar</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Acción
                      </label>
                      <select
                        value={formData.action.type}
                        onChange={(e) => setFormData({
                          ...formData,
                          action: { ...formData.action, type: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="external_link">Enlace Externo</option>
                        <option value="package_detail">Detalle de Paquete</option>
                        <option value="category">Categoría</option>
                        <option value="none">Sin Acción</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.action.type === 'external_link' && 'URL del Enlace'}
                        {formData.action.type === 'package_detail' && 'ID del Paquete'}
                        {formData.action.type === 'category' && 'ID de Categoría'}
                        {formData.action.type === 'none' && 'Sin configuración'}
                      </label>
                      <input
                        type="text"
                        value={formData.action.value || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          action: { ...formData.action, value: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={formData.action.type === 'none'}
                        placeholder={
                          formData.action.type === 'external_link' ? 'https://ejemplo.com' :
                          formData.action.type === 'package_detail' ? 'package-id-123' :
                          formData.action.type === 'category' ? 'category-id-456' : ''
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">📱 Plataformas</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes('ios')}
                        onChange={() => togglePlatform('ios')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">iOS</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes('android')}
                        onChange={() => togglePlatform('android')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Android</span>
                    </label>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio (opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Fin (opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Banner activo</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={uploading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={uploading}
                  >
                    {uploading ? 'Subiendo...' : editingBanner ? 'Actualizar Banner' : 'Crear Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}