import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Layers,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  FolderOpen
} from 'lucide-react';

export default function SubCategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    image: '',
    platforms: [],
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories();
    }
  }, [selectedCategory]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSubcategory) {
        await axios.put(`/subcategories/${editingSubcategory.id}`, formData);
        toast.success('Subcategoría actualizada correctamente');
      } else {
        await axios.post('/subcategories', formData);
        toast.success('Subcategoría creada correctamente');
      }
      
      fetchSubcategories();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar subcategoría');
    }
  };

  const handleDelete = async (subcategoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta subcategoría?')) {
      try {
        await axios.delete(`/subcategories/${subcategoryId}`);
        toast.success('Subcategoría eliminada correctamente');
        fetchSubcategories();
      } catch (error) {
        toast.error('Error al eliminar subcategoría');
      }
    }
  };

  const openModal = (subcategory = null) => {
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setFormData({
        category_id: subcategory.category_id,
        name: subcategory.name,
        image: subcategory.image || '',
        platforms: subcategory.platforms,
        is_active: subcategory.is_active
      });
    } else {
      setEditingSubcategory(null);
      setFormData({
        category_id: selectedCategory || '',
        name: '',
        image: '',
        platforms: ['ios', 'android'],
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubcategory(null);
    setFormData({
      category_id: '',
      name: '',
      image: '',
      platforms: [],
      is_active: true
    });
  };

  const togglePlatform = (platform) => {
    const updatedPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform];
    
    setFormData({ ...formData, platforms: updatedPlatforms });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subcategorías</h1>
          <p className="text-gray-600 mt-1">Gestiona las subcategorías para ambas plataformas</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nueva Subcategoría
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar subcategorías..."
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
      </div>

      {/* Subcategories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubcategories.map((subcategory) => (
            <div key={subcategory.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Subcategory Image */}
              <div className="h-32 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                {subcategory.image ? (
                  <img
                    src={subcategory.image}
                    alt={subcategory.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Layers className="h-12 w-12 text-gray-400" />
                )}
              </div>

              {/* Subcategory Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {subcategory.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    {subcategory.is_active ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                  <FolderOpen className="h-4 w-4" />
                  {getCategoryName(subcategory.category_id)}
                </p>

                {/* Platforms */}
                <div className="flex items-center gap-2 mb-4">
                  {subcategory.platforms.includes('ios') && (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      <Smartphone className="h-3 w-3" />
                      iOS
                    </div>
                  )}
                  {subcategory.platforms.includes('android') && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      <Monitor className="h-3 w-3" />
                      Android
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(subcategory)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(subcategory.id)}
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

      {filteredSubcategories.length === 0 && !loading && (
        <div className="text-center py-12">
          <Layers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay subcategorías</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No se encontraron subcategorías con ese término.' : 'Comienza creando una nueva subcategoría.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingSubcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría Padre
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
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
                  URL de Imagen (opcional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

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
                    <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                      <Smartphone className="h-4 w-4" />
                      iOS
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

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Activa</span>
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
                  {editingSubcategory ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}