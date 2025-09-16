import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Banknote,
  ExternalLink,
  FolderOpen,
  Layers,
  Package,
  Eye,
  EyeOff,
  Calendar,
  Target,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    action: {
      type: 'external_link',
      target_id: '',
      external_url: ''
    },
    position: 'top',
    is_active: true,
    priority: 1,
    start_date: '',
    end_date: '',
    platforms: ['ios', 'android']
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bannersRes, categoriesRes, subcategoriesRes] = await Promise.all([
        axios.get('/banners'),
        axios.get('/categories'),
        axios.get('/subcategories')
      ]);
      
      setBanners(bannersRes.data);
      setCategories(categoriesRes.data);
      setSubcategories(subcategoriesRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const initSampleBanners = async () => {
    try {
      await axios.post('/banners/init-samples');
      toast.success('Banners de ejemplo creados');
      fetchData();
    } catch (error) {
      toast.error('Error al crear banners de ejemplo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
      };

      if (editingBanner) {
        await axios.put(`/banners/${editingBanner.id}`, submitData);
        toast.success('Banner actualizado correctamente');
      } else {
        await axios.post('/banners', submitData);
        toast.success('Banner creado correctamente');
      }
      
      fetchData();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar banner');
    }
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este banner?')) {
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
        image_url: banner.image_url,
        action: banner.action,
        position: banner.position,
        is_active: banner.is_active,
        priority: banner.priority,
        start_date: banner.start_date ? new Date(banner.start_date).toISOString().split('T')[0] : '',
        end_date: banner.end_date ? new Date(banner.end_date).toISOString().split('T')[0] : '',
        platforms: banner.platforms
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        action: {
          type: 'external_link',
          target_id: '',
          external_url: ''
        },
        position: 'top',
        is_active: true,
        priority: 1,
        start_date: '',
        end_date: '',
        platforms: ['ios', 'android']
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
  };

  const updateAction = (field, value) => {
    setFormData(prev => ({
      ...prev,
      action: {
        ...prev.action,
        [field]: value
      }
    }));
  };

  const togglePlatform = (platform) => {
    const updatedPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform];
    
    setFormData({ ...formData, platforms: updatedPlatforms });
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'external_link': return <ExternalLink className="h-4 w-4" />;
      case 'category': return <FolderOpen className="h-4 w-4" />;
      case 'subcategory': return <Layers className="h-4 w-4" />;
      case 'sticker_pack': return <Package className="h-4 w-4" />;
      default: return <LinkIcon className="h-4 w-4" />;
    }
  };

  const getActionLabel = (action) => {
    switch (action.type) {
      case 'external_link': 
        return action.external_url ? `Enlace: ${action.external_url.substring(0, 30)}...` : 'Enlace externo';
      case 'category': 
        const category = categories.find(c => c.id === action.target_id);
        return category ? `Categoría: ${category.name}` : 'Categoría no encontrada';
      case 'subcategory': 
        const subcategory = subcategories.find(s => s.id === action.target_id);
        return subcategory ? `Subcategoría: ${subcategory.name}` : 'Subcategoría no encontrada';
      case 'sticker_pack': 
        return `Paquete: ${action.target_id}`;
      default: 
        return 'Acción no definida';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority >= 5) return 'bg-red-100 text-red-800';
    if (priority >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Banners Promocionales</h1>
          <p className="text-gray-600 mt-1">Gestiona los carteles que aparecen en la aplicación</p>
        </div>
        <div className="flex items-center gap-3">
          {banners.length === 0 && (
            <button
              onClick={initSampleBanners}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ImageIcon className="h-5 w-5" />
              Crear Ejemplos
            </button>
          )}
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nuevo Banner
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar banners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Banners Grid */}
      {filteredBanners.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Banknote className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay banners</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No se encontraron banners con ese término.' : 'Comienza creando un nuevo banner promocional.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Banner Image */}
              <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                {banner.image_url ? (
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>

              {/* Banner Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {banner.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(banner.priority)}`}>
                      {banner.priority >= 5 ? 'Alta' : banner.priority >= 3 ? 'Media' : 'Baja'}
                    </span>
                    {banner.is_active ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{banner.description}</p>

                {/* Action */}
                <div className="flex items-center gap-2 mb-3">
                  {getActionIcon(banner.action.type)}
                  <span className="text-xs text-gray-600 truncate">
                    {getActionLabel(banner.action)}
                  </span>
                </div>

                {/* Position & Platforms */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {banner.position === 'top' && <ArrowUp className="h-4 w-4 text-blue-600" />}
                    {banner.position === 'middle' && <Target className="h-4 w-4 text-purple-600" />}
                    {banner.position === 'bottom' && <ArrowDown className="h-4 w-4 text-green-600" />}
                    <span className="text-xs text-gray-600 capitalize">{banner.position}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {banner.platforms.includes('ios') && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">iOS</span>
                    )}
                    {banner.platforms.includes('android') && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Android</span>
                    )}
                  </div>
                </div>

                {/* Dates */}
                {(banner.start_date || banner.end_date) && (
                  <div className="text-xs text-gray-500 mb-3">
                    {banner.start_date && (
                      <div>Inicio: {new Date(banner.start_date).toLocaleDateString()}</div>
                    )}
                    {banner.end_date && (
                      <div>Fin: {new Date(banner.end_date).toLocaleDateString()}</div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(banner)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBanner ? 'Editar Banner' : 'Nuevo Banner'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
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
                      Posición
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="top">Superior</option>
                      <option value="middle">Medio</option>
                      <option value="bottom">Inferior</option>
                    </select>
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
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de Imagen
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    required
                  />
                </div>

                {/* Action Configuration */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Acción al hacer clic</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de acción
                      </label>
                      <select
                        value={formData.action.type}
                        onChange={(e) => updateAction('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="external_link">Enlace externo</option>
                        <option value="category">Ir a categoría</option>
                        <option value="subcategory">Ir a subcategoría</option>
                        <option value="sticker_pack">Ir a paquete de stickers</option>
                      </select>
                    </div>

                    {formData.action.type === 'external_link' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL del enlace
                        </label>
                        <input
                          type="url"
                          value={formData.action.external_url}
                          onChange={(e) => updateAction('external_url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://ejemplo.com"
                        />
                      </div>
                    )}

                    {formData.action.type === 'category' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Seleccionar categoría
                        </label>
                        <select
                          value={formData.action.target_id}
                          onChange={(e) => updateAction('target_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar categoría</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formData.action.type === 'subcategory' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Seleccionar subcategoría
                        </label>
                        <select
                          value={formData.action.target_id}
                          onChange={(e) => updateAction('target_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar subcategoría</option>
                          {subcategories.map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formData.action.type === 'sticker_pack' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID del paquete
                        </label>
                        <input
                          type="text"
                          value={formData.action.target_id}
                          onChange={(e) => updateAction('target_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="pack_id_123"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>Baja (1)</option>
                      <option value={2}>Baja (2)</option>
                      <option value={3}>Media (3)</option>
                      <option value={4}>Media (4)</option>
                      <option value={5}>Alta (5)</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Banner activo</span>
                    </label>
                  </div>
                </div>

                {/* Platforms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plataformas
                  </label>
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

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de inicio (opcional)
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
                      Fecha de fin (opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                  >
                    {editingBanner ? 'Actualizar' : 'Crear'}
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