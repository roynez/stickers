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
  Image as ImageIcon
} from 'lucide-react';

export default function Stickers() {
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
    category_id: '',
    sub_category_id: '',
    platforms: {
      ios: {
        animated: '',
        webp: ''
      },
      android: {
        png: '',
        webp: ''
      }
    },
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
    fetchStickers();
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (error) {
      toast.error('Error al cargar categorías');
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSticker) {
        await axios.put(`/stickers/${editingSticker.id}`, formData);
        toast.success('Sticker actualizado correctamente');
      } else {
        await axios.post('/stickers', formData);
        toast.success('Sticker creado correctamente');
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
        category_id: sticker.category_id,
        sub_category_id: sticker.sub_category_id || '',
        platforms: sticker.platforms || {
          ios: { animated: '', webp: '' },
          android: { png: '', webp: '' }
        },
        is_active: sticker.is_active
      });
    } else {
      setEditingSticker(null);
      setFormData({
        name: '',
        category_id: selectedCategory || '',
        sub_category_id: selectedSubcategory || '',
        platforms: {
          ios: { animated: '', webp: '' },
          android: { png: '', webp: '' }
        },
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSticker(null);
    setFormData({
      name: '',
      category_id: '',
      sub_category_id: '',
      platforms: {
        ios: { animated: '', webp: '' },
        android: { png: '', webp: '' }
      },
      is_active: true
    });
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

  const hasIOSFiles = (sticker) => {
    return sticker.platforms?.ios && (sticker.platforms.ios.animated || sticker.platforms.ios.webp);
  };

  const hasAndroidFiles = (sticker) => {
    return sticker.platforms?.android && (sticker.platforms.android.png || sticker.platforms.android.webp);
  };

  const filteredStickers = stickers.filter(sticker =>
    sticker.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stickers</h1>
          <p className="text-gray-600 mt-1">Gestiona los stickers para ambas plataformas</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Sticker
        </button>
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
          <option value="ios">iOS</option>
          <option value="android">Android</option>
        </select>
      </div>

      {/* Stickers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStickers.map((sticker) => (
            <div key={sticker.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Sticker Preview */}
              <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                {hasIOSFiles(sticker) || hasAndroidFiles(sticker) ? (
                  <div className="text-center">
                    <Sticker className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Vista previa</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Sin archivos</p>
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
                <div className="flex items-center gap-2 mb-4">
                  {hasIOSFiles(sticker) && (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      <Smartphone className="h-3 w-3" />
                      iOS
                    </div>
                  )}
                  {hasAndroidFiles(sticker) && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      <Monitor className="h-3 w-3" />
                      Android
                    </div>
                  )}
                </div>

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

      {filteredStickers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Sticker className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay stickers</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No se encontraron stickers con ese término.' : 'Comienza creando un nuevo sticker.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSticker ? 'Editar Sticker' : 'Nuevo Sticker'}
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

                {/* iOS Platform */}
                <div className="border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    <h4 className="text-sm font-medium text-gray-900">iOS Files</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Archivo Animado (GIF)
                      </label>
                      <input
                        type="url"
                        value={formData.platforms.ios?.animated || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          platforms: {
                            ...formData.platforms,
                            ios: { ...formData.platforms.ios, animated: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://example.com/sticker.gif"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Archivo WebP
                      </label>
                      <input
                        type="url"
                        value={formData.platforms.ios?.webp || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          platforms: {
                            ...formData.platforms,
                            ios: { ...formData.platforms.ios, webp: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://example.com/sticker.webp"
                      />
                    </div>
                  </div>
                </div>

                {/* Android Platform */}
                <div className="border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="h-5 w-5 text-green-600" />
                    <h4 className="text-sm font-medium text-gray-900">Android Files</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Archivo PNG
                      </label>
                      <input
                        type="url"
                        value={formData.platforms.android?.png || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          platforms: {
                            ...formData.platforms,
                            android: { ...formData.platforms.android, png: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://example.com/sticker.png"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Archivo WebP
                      </label>
                      <input
                        type="url"
                        value={formData.platforms.android?.webp || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          platforms: {
                            ...formData.platforms,
                            android: { ...formData.platforms.android, webp: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="https://example.com/sticker.webp"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Activo</span>
                  </label>
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
                    {editingSticker ? 'Actualizar' : 'Crear'}
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