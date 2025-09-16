import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Package,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  FolderOpen,
  Upload,
  Image as ImageIcon,
  Activity,
  TrendingUp,
  Heart,
  Download,
  Star,
  Flame,
  Sparkles,
  DragHandleDots2,
  X,
  GripVertical
} from 'lucide-react';

export default function PackageManager() {
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showStickerManager, setShowStickerManager] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    platforms: ['ios', 'android'],
    is_premium: false,
    is_featured: false,
    stickers: []
  });

  const [stickerFiles, setStickerFiles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [selectedCategory, selectedPlatform, sortBy]);

  const fetchData = async () => {
    try {
      const [packagesRes, categoriesRes] = await Promise.all([
        axios.get('/packages'),
        axios.get('/categories')
      ]);
      
      setPackages(packagesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedPlatform) params.platform = selectedPlatform;
      if (sortBy) params.sort_by = sortBy;
      
      const response = await axios.get('/packages', { params });
      setPackages(response.data);
    } catch (error) {
      toast.error('Error al cargar paquetes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (stickerFiles.length < 3) {
      toast.error('Cada paquete debe tener al menos 3 stickers');
      return;
    }

    if (stickerFiles.length > 30) {
      toast.error('Un paquete no puede tener más de 30 stickers');
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        stickers: stickerFiles.map((file, index) => ({
          filename: file.name || `sticker_${index + 1}.png`,
          url: file.url || file.preview,
          file_size_kb: file.size ? Math.round(file.size / 1024) : 50,
          dimensions: "512x512"
        }))
      };

      if (editingPackage) {
        await axios.put(`/packages/${editingPackage.id}`, submitData);
        toast.success('Paquete actualizado correctamente');
      } else {
        const response = await axios.post('/packages', submitData);
        toast.success(`Paquete creado: ${response.data.total_stickers} stickers, ${response.data.popularity_rank}`);
      }
      
      fetchPackages();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar paquete');
    }
  };

  const handleDelete = async (packageId, packageName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el paquete "${packageName}"?`)) {
      try {
        await axios.delete(`/packages/${packageId}`);
        toast.success('Paquete eliminado correctamente');
        fetchPackages();
      } catch (error) {
        toast.error('Error al eliminar paquete');
      }
    }
  };

  const openModal = (packageData = null) => {
    if (packageData) {
      setEditingPackage(packageData);
      setFormData({
        name: packageData.name,
        description: packageData.description || '',
        category_id: packageData.category_id,
        platforms: packageData.platforms || ['ios', 'android'],
        is_premium: packageData.is_premium || false,
        is_featured: packageData.is_featured || false
      });
      // Convert existing stickers to file format for editing
      setStickerFiles(packageData.stickers.map(sticker => ({
        id: sticker.id,
        name: sticker.filename,
        url: sticker.url,
        preview: sticker.url,
        size: (sticker.file_size_kb || 50) * 1024,
        existing: true
      })));
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        description: '',
        category_id: selectedCategory || '',
        platforms: ['ios', 'android'],
        is_premium: false,
        is_featured: false
      });
      setStickerFiles([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPackage(null);
    setStickerFiles([]);
  };

  const togglePlatform = (platform) => {
    const updatedPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform];
    
    setFormData({ ...formData, platforms: updatedPlatforms });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newSticker = {
            id: Date.now() + Math.random(),
            name: file.name,
            file: file,
            preview: e.target.result,
            size: file.size,
            url: '' // Will be set after upload
          };
          setStickerFiles(prev => [...prev, newSticker]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeSticker = (stickerId) => {
    setStickerFiles(prev => prev.filter(s => s.id !== stickerId));
  };

  const reorderStickers = (dragIndex, hoverIndex) => {
    const draggedSticker = stickerFiles[dragIndex];
    const newStickers = [...stickerFiles];
    newStickers.splice(dragIndex, 1);
    newStickers.splice(hoverIndex, 0, draggedSticker);
    setStickerFiles(newStickers);
  };

  const getPopularityIcon = (rank) => {
    if (rank.includes('🔥')) return <Flame className="h-4 w-4 text-red-500" />;
    if (rank.includes('⭐')) return <Star className="h-4 w-4 text-yellow-500" />;
    if (rank.includes('📈')) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (rank.includes('👍')) return <Sparkles className="h-4 w-4 text-blue-500" />;
    return <Package className="h-4 w-4 text-gray-400" />;
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">📦 Gestión de Paquetes</h1>
          <p className="text-gray-600 mt-1">Administra paquetes de stickers para WhatsApp</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Paquete
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paquetes</p>
              <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Solo iOS</p>
              <p className="text-2xl font-bold text-blue-600">
                {packages.filter(p => p.platforms.includes('ios') && !p.platforms.includes('android')).length}
              </p>
            </div>
            <Smartphone className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Solo Android</p>
              <p className="text-2xl font-bold text-green-600">
                {packages.filter(p => p.platforms.includes('android') && !p.platforms.includes('ios')).length}
              </p>
            </div>
            <Monitor className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Multiplataforma</p>
              <p className="text-2xl font-bold text-purple-600">
                {packages.filter(p => p.platforms.includes('ios') && p.platforms.includes('android')).length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar paquetes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las plataformas</option>
          <option value="ios">Solo iOS</option>
          <option value="android">Solo Android</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="popularity">Por popularidad</option>
          <option value="created_date">Más recientes</option>
          <option value="downloads">Más descargados</option>
          <option value="name">Por nombre</option>
        </select>

        <div className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-pink-50 to-blue-50 border border-pink-200 rounded-lg">
          <span className="text-sm font-medium text-gray-700">{filteredPackages.length} paquetes</span>
        </div>
      </div>

      {/* Packages Grid */}
      {filteredPackages.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay paquetes</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No se encontraron paquetes con ese término.' : 'Comienza creando un nuevo paquete.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Package Preview */}
              <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                <div className="text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-600">
                    {pkg.total_stickers} stickers
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {getPopularityIcon(pkg.popularity_rank)}
                    <span className="text-xs text-gray-500">{pkg.popularity_rank}</span>
                  </div>
                </div>
                
                {/* Premium Badge */}
                {pkg.is_premium && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Premium
                  </div>
                )}

                {/* Featured Badge */}
                {pkg.is_featured && (
                  <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Destacado
                  </div>
                )}
              </div>

              {/* Package Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {pkg.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    {pkg.is_active ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {pkg.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{pkg.description}</p>
                )}

                <div className="space-y-1 mb-3">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    {pkg.category_name || 'Sin categoría'}
                  </p>
                </div>

                {/* Platform Indicators */}
                <div className="flex items-center gap-2 mb-3">
                  {pkg.platforms.includes('ios') && (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      <Smartphone className="h-3 w-3" />
                      iOS
                    </div>
                  )}
                  {pkg.platforms.includes('android') && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      <Monitor className="h-3 w-3" />
                      Android
                    </div>
                  )}
                </div>

                {/* Popularity Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-400" />
                    {pkg.likes_count || 0} likes
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3 text-blue-400" />
                    {pkg.total_downloads || 0}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(pkg)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                  >
                    <Edit2 className="h-3 w-3" />
                    Editar
                  </button>
                  <button
                    onClick={() => setShowStickerManager(pkg)}
                    className="flex items-center justify-center bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-xs"
                    title="Gestionar stickers"
                  >
                    <GripVertical className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id, pkg.name)}
                    className="flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Package Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPackage ? 'Editar Paquete' : 'Nuevo Paquete de Stickers'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Paquete
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Stickers Upload Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Stickers del Paquete</h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Sube entre 3 y 30 stickers (formato 512x512 píxeles, máximo 100KB por sticker).
                  </p>
                  
                  <div className="mb-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Stickers Preview */}
                  {stickerFiles.length > 0 && (
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {stickerFiles.map((sticker, index) => (
                        <div key={sticker.id} className="relative group">
                          <img
                            src={sticker.preview}
                            alt={sticker.name}
                            className="w-full h-16 object-cover rounded border"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeSticker(sticker.id)}
                              className="text-white hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 text-center">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Stickers subidos: {stickerFiles.length} (mínimo 3, máximo 30)
                  </p>
                </div>

                {/* Platform Selection */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Plataformas Disponibles</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes('ios')}
                        onChange={() => togglePlatform('ios')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                        <Smartphone className="h-4 w-4" />
                        iOS (iPhone/iPad)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes('android')}
                        onChange={() => togglePlatform('android')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                        <Monitor className="h-4 w-4" />
                        Android
                      </span>
                    </label>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_premium}
                        onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Contenido premium</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Paquete destacado</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={stickerFiles.length < 3}
                  >
                    {editingPackage ? 'Actualizar Paquete' : 'Crear Paquete'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Individual Sticker Manager Modal */}
      {showStickerManager && (
        <StickerManagerModal
          package={showStickerManager}
          onClose={() => setShowStickerManager(null)}
          onUpdate={fetchPackages}
        />
      )}
    </div>
  );
}

// Component for managing individual stickers in a package
function StickerManagerModal({ package: pkg, onClose, onUpdate }) {
  const [stickers, setStickers] = useState(pkg.stickers || []);
  const [loading, setLoading] = useState(false);

  const removeSticker = async (stickerId) => {
    if (stickers.length <= 3) {
      toast.error('Un paquete debe tener al menos 3 stickers');
      return;
    }

    if (window.confirm('¿Eliminar este sticker del paquete?')) {
      setLoading(true);
      try {
        await axios.delete(`/packages/${pkg.id}/stickers/${stickerId}`);
        setStickers(stickers.filter(s => s.id !== stickerId));
        toast.success('Sticker eliminado del paquete');
        onUpdate();
      } catch (error) {
        toast.error('Error al eliminar sticker');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Gestionar Stickers: {pkg.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Actualmente: {stickers.length} stickers en el paquete
          </p>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}

          <div className="grid grid-cols-6 gap-4">
            {stickers.map((sticker, index) => (
              <div key={sticker.id} className="relative group">
                <img
                  src={sticker.url}
                  alt={sticker.filename}
                  className="w-full h-24 object-cover rounded border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                  <button
                    onClick={() => removeSticker(sticker.id)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 text-center">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}