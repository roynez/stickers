import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Sticker,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  FolderOpen,
  Layers,
  Upload,
  Image as ImageIcon,
  FileImage,
  Activity,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';

export default function UnifiedStickers() {
  const [stickers, setStickers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSticker, setEditingSticker] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    sub_category_id: '',
    files: {
      png: '',
      webp: '',
      animated_gif: '',
      ios_specific: '',
      android_specific: ''
    },
    platforms: ['ios', 'android'],
    is_active: true,
    is_premium: false,
    file_size_mb: null,
    dimensions: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories();
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchStickers();
  }, [selectedCategory, selectedSubcategory, selectedPlatform]);

  const fetchData = async () => {
    try {
      const [stickersRes, categoriesRes] = await Promise.all([
        axios.get('/stickers'),
        axios.get('/categories')
      ]);
      
      setStickers(stickersRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const params = selectedCategory ? { category_id: selectedCategory } : {};
      const response = await axios.get('/subcategories', { params });
      setSubcategories(response.data);
    } catch (error) {
      toast.error('Error al cargar subcategorías');
    }
  };

  const fetchStickers = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedSubcategory) params.sub_category_id = selectedSubcategory;
      if (selectedPlatform) params.platform = selectedPlatform;
      
      const response = await axios.get('/stickers', { params });
      setStickers(response.data);
    } catch (error) {
      toast.error('Error al cargar stickers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        file_size_mb: formData.file_size_mb ? parseFloat(formData.file_size_mb) : null
      };

      if (editingSticker) {
        await axios.put(`/stickers/${editingSticker.id}`, submitData);
        toast.success('Sticker actualizado correctamente');
      } else {
        const response = await axios.post('/stickers', submitData);
        toast.success(`Sticker creado correctamente - Tamaño estimado: ${response.data.total_size_mb.toFixed(2)} MB`);
      }
      
      fetchStickers();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar sticker');
    }
  };

  const handleDelete = async (stickerId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este sticker?')) {
      try {
        await axios.delete(`/stickers/${stickerId}`);
        toast.success('Sticker eliminado correctamente');
        fetchStickers();
      } catch (error) {
        toast.error('Error al eliminar sticker');
      }
    }
  };

  const openModal = (sticker = null) => {
    if (sticker) {
      setEditingSticker(sticker);
      setFormData({
        name: sticker.name,
        description: sticker.description || '',
        category_id: sticker.category_id,
        sub_category_id: sticker.sub_category_id || '',
        files: sticker.files || {
          png: '',
          webp: '',
          animated_gif: '',
          ios_specific: '',
          android_specific: ''
        },
        platforms: sticker.platforms || ['ios', 'android'],
        is_active: sticker.is_active,
        is_premium: sticker.is_premium || false,
        file_size_mb: sticker.file_size_mb,
        dimensions: sticker.dimensions || ''
      });
    } else {
      setEditingSticker(null);
      setFormData({
        name: '',
        description: '',
        category_id: selectedCategory || '',
        sub_category_id: selectedSubcategory || '',
        files: {
          png: '',
          webp: '',
          animated_gif: '',
          ios_specific: '',
          android_specific: ''
        },
        platforms: ['ios', 'android'],
        is_active: true,
        is_premium: false,
        file_size_mb: null,
        dimensions: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSticker(null);
  };

  const togglePlatform = (platform) => {
    const updatedPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform];
    
    setFormData({ ...formData, platforms: updatedPlatforms });
  };

  const updateFiles = (field, value) => {
    setFormData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [field]: value
      }
    }));
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  const getSubcategoryName = (subcategoryId) => {
    if (!subcategoryId) return null;
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    return subcategory ? subcategory.name : 'Sin subcategoría';
  };

  const getAvailableFiles = (sticker) => {
    const files = sticker.files || {};
    const availableFiles = [];
    
    if (files.png) availableFiles.push('PNG');
    if (files.webp) availableFiles.push('WebP');
    if (files.animated_gif) availableFiles.push('GIF');
    if (files.ios_specific) availableFiles.push('iOS');
    if (files.android_specific) availableFiles.push('Android');
    
    return availableFiles;
  };

  const filteredStickers = stickers.filter(sticker =>
    sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sticker.description && sticker.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Stickers Unificados</h1>
          <p className="text-gray-600 mt-1">Una sola subida para ambas plataformas</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Sticker
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stickers</p>
              <p className="text-2xl font-bold text-gray-900">{stickers.length}</p>
            </div>
            <Sticker className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Solo iOS</p>
              <p className="text-2xl font-bold text-blue-600">
                {stickers.filter(s => s.platforms.includes('ios') && !s.platforms.includes('android')).length}
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
                {stickers.filter(s => s.platforms.includes('android') && !s.platforms.includes('ios')).length}
              </p>
            </div>
            <Monitor className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ambas Plataformas</p>
              <p className="text-2xl font-bold text-purple-600">
                {stickers.filter(s => s.platforms.includes('ios') && s.platforms.includes('android')).length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar stickers..."
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
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!selectedCategory}
        >
          <option value="">Todas las subcategorías</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
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
      </div>

      {/* Stickers Grid */}
      {filteredStickers.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Sticker className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay stickers</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No se encontraron stickers con ese término.' : 'Comienza creando un nuevo sticker.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStickers.map((sticker) => (
            <div key={sticker.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Sticker Preview */}
              <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                <div className="text-center">
                  <Sticker className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <div className="flex flex-wrap gap-1 justify-center">
                    {getAvailableFiles(sticker).map((format, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Premium Badge */}
                {sticker.is_premium && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Premium
                  </div>
                )}
              </div>

              {/* Sticker Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {sticker.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    {sticker.is_active ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {sticker.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{sticker.description}</p>
                )}

                <div className="space-y-1 mb-3">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    {getCategoryName(sticker.category_id)}
                  </p>
                  {sticker.sub_category_id && (
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {getSubcategoryName(sticker.sub_category_id)}
                    </p>
                  )}
                </div>

                {/* Platform Indicators */}
                <div className="flex items-center gap-2 mb-3">
                  {sticker.platforms.includes('ios') && (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      <Smartphone className="h-3 w-3" />
                      iOS
                    </div>
                  )}
                  {sticker.platforms.includes('android') && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      <Monitor className="h-3 w-3" />
                      Android
                    </div>
                  )}
                </div>

                {/* Analytics */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    iOS: {sticker.downloads_ios || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Android: {sticker.downloads_android || 0}
                  </div>
                </div>

                {/* File Size */}
                {sticker.file_size_mb && (
                  <p className="text-xs text-gray-500 mb-3">
                    Tamaño: {sticker.file_size_mb.toFixed(2)} MB
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(sticker)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                  >
                    <Edit2 className="h-3 w-3" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(sticker.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSticker ? 'Editar Sticker' : 'Nuevo Sticker Unificado'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Sticker
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategoría (opcional)
                  </label>
                  <select
                    value={formData.sub_category_id}
                    onChange={(e) => setFormData({ ...formData, sub_category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sin subcategoría</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Files Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Archivos del Sticker</h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Sube los formatos que tengas disponibles. No es necesario subir todos.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <FileImage className="h-3 w-3" />
                        Archivo PNG (Universal)
                      </label>
                      <input
                        type="url"
                        value={formData.files.png}
                        onChange={(e) => updateFiles('png', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://ejemplo.com/sticker.png"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        Archivo WebP (Optimizado)
                      </label>
                      <input
                        type="url"
                        value={formData.files.webp}
                        onChange={(e) => updateFiles('webp', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://ejemplo.com/sticker.webp"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        GIF Animado
                      </label>
                      <input
                        type="url"
                        value={formData.files.animated_gif}
                        onChange={(e) => updateFiles('animated_gif', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://ejemplo.com/sticker.gif"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Smartphone className="h-3 w-3 text-blue-600" />
                        Específico iOS
                      </label>
                      <input
                        type="url"
                        value={formData.files.ios_specific}
                        onChange={(e) => updateFiles('ios_specific', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Formato especial para iOS"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Monitor className="h-3 w-3 text-green-600" />
                        Específico Android
                      </label>
                      <input
                        type="url"
                        value={formData.files.android_specific}
                        onChange={(e) => updateFiles('android_specific', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Formato especial para Android"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tamaño del archivo (MB)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.file_size_mb || ''}
                        onChange={(e) => setFormData({ ...formData, file_size_mb: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="2.5"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Dimensiones
                      </label>
                      <input
                        type="text"
                        value={formData.dimensions}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="512x512"
                      />
                    </div>
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">¿En qué plataformas estará disponible?</h4>
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
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Sticker activo</span>
                    </label>
                  </div>

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
                    {editingSticker ? 'Actualizar' : 'Crear Sticker'}
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