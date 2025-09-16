import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit2, 
  Search, 
  Bell,
  Send,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  ExternalLink,
  FolderOpen,
  Layers,
  Package,
  Users,
  TrendingUp
} from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    image_url: '',
    action: {
      type: 'external_link',
      target_id: '',
      external_url: ''
    },
    priority: 'normal',
    platforms: ['ios', 'android'],
    is_scheduled: false,
    scheduled_for: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notificationsRes, categoriesRes, subcategoriesRes] = await Promise.all([
        axios.get('/notifications'),
        axios.get('/categories'),
        axios.get('/subcategories')
      ]);
      
      setNotifications(notificationsRes.data);
      setCategories(categoriesRes.data);
      setSubcategories(subcategoriesRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        scheduled_for: formData.scheduled_for ? new Date(formData.scheduled_for).toISOString() : null
      };

      if (editingNotification) {
        await axios.put(`/notifications/${editingNotification.id}`, submitData);
        toast.success('Notificación actualizada correctamente');
      } else {
        await axios.post('/notifications', submitData);
        toast.success('Notificación creada correctamente');
      }
      
      fetchData();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar notificación');
    }
  };

  const handleSend = async (notificationId) => {
    if (window.confirm('¿Estás seguro de que quieres enviar esta notificación ahora?')) {
      try {
        await axios.post(`/notifications/${notificationId}/send`);
        toast.success('Notificación enviada correctamente');
        fetchData();
      } catch (error) {
        toast.error('Error al enviar notificación');
      }
    }
  };

  const openModal = (notification = null) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        body: notification.body,
        image_url: notification.image_url || '',
        action: notification.action || {
          type: 'external_link',
          target_id: '',
          external_url: ''
        },
        priority: notification.priority,
        platforms: notification.platforms,
        is_scheduled: notification.is_scheduled,
        scheduled_for: notification.scheduled_for ? 
          new Date(notification.scheduled_for).toISOString().slice(0, 16) : ''
      });
    } else {
      setEditingNotification(null);
      setFormData({
        title: '',
        body: '',
        image_url: '',
        action: {
          type: 'external_link',
          target_id: '',
          external_url: ''
        },
        priority: 'normal',
        platforms: ['ios', 'android'],
        is_scheduled: false,
        scheduled_for: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNotification(null);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'sending': return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'scheduled': return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Edit2 className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'external_link': return <ExternalLink className="h-4 w-4" />;
      case 'category': return <FolderOpen className="h-4 w-4" />;
      case 'subcategory': return <Layers className="h-4 w-4" />;
      case 'sticker_pack': return <Package className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones Push</h1>
          <p className="text-gray-600 mt-1">Envía notificaciones a todos los usuarios de la app</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nueva Notificación
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Enviadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.status === 'sent').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Programadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.status === 'scheduled').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Borradores</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.status === 'draft').length}
              </p>
            </div>
            <Edit2 className="h-8 w-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.length > 0 
                  ? `${Math.round((notifications.filter(n => n.status === 'sent').length / notifications.length) * 100)}%`
                  : '0%'
                }
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar notificaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No se encontraron notificaciones con ese término.' : 'Comienza creando una nueva notificación.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plataformas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enviadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {notification.image_url && (
                          <img
                            src={notification.image_url}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {notification.body}
                          </div>
                          {notification.action && (
                            <div className="flex items-center gap-1 mt-1">
                              {getActionIcon(notification.action.type)}
                              <span className="text-xs text-gray-400">
                                {notification.action.type === 'external_link' ? 'Enlace externo' : 
                                 notification.action.type === 'category' ? 'Categoría' :
                                 notification.action.type === 'subcategory' ? 'Subcategoría' : 'Paquete'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(notification.status)}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                          {notification.status === 'sent' && 'Enviada'}
                          {notification.status === 'sending' && 'Enviando'}
                          {notification.status === 'scheduled' && 'Programada'}
                          {notification.status === 'failed' && 'Fallida'}
                          {notification.status === 'draft' && 'Borrador'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority === 'high' && 'Alta'}
                        {notification.priority === 'normal' && 'Normal'}
                        {notification.priority === 'low' && 'Baja'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {notification.platforms.includes('ios') && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">iOS</span>
                        )}
                        {notification.platforms.includes('android') && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Android</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {notification.scheduled_for ? 
                        new Date(notification.scheduled_for).toLocaleString('es-MX') : 
                        'Ahora'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {notification.sent_count || 0}
                        </div>
                        {notification.success_count > 0 && (
                          <div className="text-xs text-green-600">
                            {notification.success_count} exitosas
                          </div>
                        )}
                        {notification.failed_count > 0 && (
                          <div className="text-xs text-red-600">
                            {notification.failed_count} fallidas
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(notification)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {(notification.status === 'draft' || notification.status === 'scheduled') && (
                          <button
                            onClick={() => handleSend(notification.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingNotification ? 'Editar Notificación' : 'Nueva Notificación'}
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
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.title.length}/50 caracteres</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Baja</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.body.length}/200 caracteres</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de Imagen (opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>

                {/* Action Configuration */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Acción al tocar (opcional)</h4>
                  
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
                  </div>
                </div>

                {/* Scheduling */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="is_scheduled"
                      checked={formData.is_scheduled}
                      onChange={(e) => setFormData({ ...formData, is_scheduled: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_scheduled" className="text-sm font-medium text-gray-700">
                      Programar envío
                    </label>
                  </div>

                  {formData.is_scheduled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha y hora de envío
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduled_for}
                        onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}
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
                    {editingNotification ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Firebase Config Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-900 mb-1">Configuración Requerida</h3>
            <p className="text-sm text-amber-800">
              Para enviar notificaciones push, asegúrate de configurar Firebase Cloud Messaging en la 
              <span className="font-medium"> Configuración del Sistema</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}