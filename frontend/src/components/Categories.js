import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  FolderOpen,
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Info,
  Package,
  Smartphone,
  Monitor
} from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadConfig, setUploadConfig] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, configRes] = await Promise.all([
        axios.get('/categories'),
        axios.get('/upload-config')
      ]);
      
      setCategories(categoriesRes.data);
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
      let category;
      if (editingCategory) {
        const response = await axios.put(`/categories/${editingCategory.id}`, formData);
        category = response.data;
        toast.success('Categoría actualizada correctamente');
      } else {
        const response = await axios.post('/categories', formData);
        category = response.data;
        toast.success('Categoría creada correctamente');
      }

      // Upload thumbnail if selected
      if (selectedFile) {
        await uploadThumbnailToCategory(category.id);
      }
      
      fetchData();
      closeModal();
    } catch (error) {
      toast.error('Error al guardar categoría');
    }
  };

  const uploadThumbnailToCategory = async (categoryId) => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post(`/categories/${categoryId}/upload-thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Miniatura subida correctamente');
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al subir miniatura');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size
      const maxSizeMB = uploadConfig?.category_thumbnails?.max_file_size_mb || 0.5;
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`El archivo es muy grande. Máximo ${maxSizeMB}MB`);
        return;
      }

      // Validate file type
      const supportedFormats = uploadConfig?.category_thumbnails?.supported_formats || ['PNG', 'JPG', 'JPEG', 'WebP'];
      const fileExtension = file.name.split('.').pop().toUpperCase();
      if (!supportedFormats.includes(fileExtension)) {
        toast.error(`Formato no soportado. Use: ${supportedFormats.join(', ')}`);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await axios.delete(`/categories/${categoryId}`);
        toast.success('Categoría eliminada correctamente');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar categoría');
      }
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setSelectedFile(null);
    setFormData({
      name: '',
      image: '',
      platforms: [],
      is_active: true
    });
  };

  // Remove platform toggle - no longer needed

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🗂️ Categorías</h1>
          <p className="text-gray-600 mt-1">Gestiona categorías con miniaturas personalizadas (200x200px)</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nueva Categoría
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Category Thumbnail */}
              <div className="aspect-square bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center relative">
                {category.thumbnail_url ? (
                  <img
                    src={category.thumbnail_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Sin miniatura</p>
                  </div>
                )}
                
                {category.is_active ? (
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                    <Eye className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 bg-gray-400 text-white p-1 rounded-full">
                    <EyeOff className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>{category.package_count || 0} paquetes</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(category)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
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

      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay categorías</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No se encontraron categorías con ese término.' : 'Comienza creando una nueva categoría.'}
          </p>
        </div>
      )}

      {/* Upload Guidelines */}
      {uploadConfig && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-2">📷 Especificaciones de Miniaturas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                <div>
                  <p><strong>Tamaño recomendado:</strong> {uploadConfig.category_thumbnails.recommended_size}</p>
                  <p><strong>Proporción:</strong> {uploadConfig.category_thumbnails.aspect_ratio}</p>
                </div>
                <div>
                  <p><strong>Tamaño máximo:</strong> {uploadConfig.category_thumbnails.max_file_size_mb}MB</p>
                  <p><strong>Formatos:</strong> {uploadConfig.category_thumbnails.supported_formats.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Categoría
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
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción de la categoría..."
                  />
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">🖼️ Miniatura de Categoría</h4>
                <p className="text-xs text-gray-600 mb-4">
                  Tamaño recomendado: {uploadConfig?.category_thumbnails?.recommended_size} (cuadrada)
                </p>
                
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {selectedFile && (
                  <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
                    <p className="text-sm text-purple-800">
                      📁 {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                    </p>
                  </div>
                )}

                {editingCategory?.thumbnail_url && !selectedFile && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Miniatura actual:</p>
                    <img
                      src={editingCategory.thumbnail_url}
                      alt="Current thumbnail"
                      className="h-20 w-20 object-cover rounded border"
                    />
                  </div>
                )}
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
                  {uploading ? 'Subiendo...' : editingCategory ? 'Actualizar' : 'Crear'} Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}