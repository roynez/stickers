import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Settings,
  ToggleLeft,
  ToggleRight,
  Crown,
  Star,
  Bell,
  Banknote,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Smartphone,
  Calendar,
  Users,
  MessageCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export default function SystemConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get('/system/config');
      setConfig(response.data);
    } catch (error) {
      toast.error('Error al cargar configuración del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/system/config', config);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (feature) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const updateRatingConfig = (field, value) => {
    setConfig(prev => ({
      ...prev,
      rating_config: {
        ...prev.rating_config,
        [field]: value
      }
    }));
  };

  const updateNotificationConfig = (field, value) => {
    setConfig(prev => ({
      ...prev,
      notification_config: {
        ...prev.notification_config,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600 mt-1">Controla todas las funcionalidades de la aplicación</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {saving ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      {/* Features Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Settings className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Funcionalidades de la App</h2>
            <p className="text-sm text-gray-600">Activa o desactiva características principales</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subscriptions */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-purple-600" />
              <div>
                <h3 className="font-medium text-gray-900">Sistema de Suscripciones</h3>
                <p className="text-sm text-gray-600">Permite a usuarios suscribirse y apoyar al creador</p>
              </div>
            </div>
            <button
              onClick={() => toggleFeature('subscriptions_enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config?.features?.subscriptions_enabled 
                  ? 'bg-purple-600' 
                  : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config?.features?.subscriptions_enabled 
                    ? 'translate-x-6' 
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Rating System */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-gray-900">Sistema de Calificación</h3>
                <p className="text-sm text-gray-600">Pide a usuarios calificar la app después de cierto uso</p>
              </div>
            </div>
            <button
              onClick={() => toggleFeature('rating_system_enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config?.features?.rating_system_enabled 
                  ? 'bg-yellow-600' 
                  : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config?.features?.rating_system_enabled 
                    ? 'translate-x-6' 
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900">Notificaciones Push</h3>
                <p className="text-sm text-gray-600">Envía notificaciones a usuarios de la app</p>
              </div>
            </div>
            <button
              onClick={() => toggleFeature('push_notifications_enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config?.features?.push_notifications_enabled 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config?.features?.push_notifications_enabled 
                    ? 'translate-x-6' 
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Banners */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Banknote className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-gray-900">Banners Promocionales</h3>
                <p className="text-sm text-gray-600">Muestra carteles promocionales en la app</p>
              </div>
            </div>
            <button
              onClick={() => toggleFeature('banners_enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config?.features?.banners_enabled 
                  ? 'bg-green-600' 
                  : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config?.features?.banners_enabled 
                    ? 'translate-x-6' 
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Subscription Warning */}
        {!config?.features?.subscriptions_enabled && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                <strong>Suscripciones desactivadas:</strong> Los usuarios no verán opciones de suscripción hasta que actives esta función.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Rating Configuration */}
      {config?.features?.rating_system_enabled && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Configuración de Calificación</h2>
              <p className="text-sm text-gray-600">Cuándo y cómo pedir calificaciones a los usuarios</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Smartphone className="inline h-4 w-4 mr-1" />
                Mínimo aperturas de app
              </label>
              <input
                type="number"
                value={config?.rating_config?.min_app_opens || 5}
                onChange={(e) => updateRatingConfig('min_app_opens', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="inline h-4 w-4 mr-1" />
                Mínimo stickers descargados
              </label>
              <input
                type="number"
                value={config?.rating_config?.min_stickers_downloaded || 10}
                onChange={(e) => updateRatingConfig('min_stickers_downloaded', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                min="1"
                max="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Días desde instalación
              </label>
              <input
                type="number"
                value={config?.rating_config?.days_since_install || 3}
                onChange={(e) => updateRatingConfig('days_since_install', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                min="1"
                max="365"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <RefreshCw className="inline h-4 w-4 mr-1" />
                Frecuencia (días)
              </label>
              <input
                type="number"
                value={config?.rating_config?.show_frequency_days || 30}
                onChange={(e) => updateRatingConfig('show_frequency_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                min="7"
                max="365"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="inline h-4 w-4 mr-1" />
                Mensaje personalizado
              </label>
              <input
                type="text"
                value={config?.rating_config?.custom_message || ''}
                onChange={(e) => updateRatingConfig('custom_message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="¿Te gusta nuestra app? ¡Califícanos!"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config?.rating_config?.redirect_to_store || false}
                  onChange={(e) => updateRatingConfig('redirect_to_store', e.target.checked)}
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="ml-3">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    Redirigir a tienda
                  </span>
                  <p className="text-xs text-gray-500">Abrir App Store/Play Store</p>
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Notification Configuration */}
      {config?.features?.push_notifications_enabled && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Configuración de Notificaciones</h2>
              <p className="text-sm text-gray-600">Configuración para notificaciones push</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Límite diario por usuario
              </label>
              <select
                value={config?.notification_config?.daily_limit || 3}
                onChange={(e) => updateNotificationConfig('daily_limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1 notificación/día</option>
                <option value={2}>2 notificaciones/día</option>
                <option value={3}>3 notificaciones/día</option>
                <option value={5}>5 notificaciones/día</option>
                <option value={10}>10 notificaciones/día</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firebase Server Key
              </label>
              <input
                type="password"
                value={config?.notification_config?.firebase_server_key || ''}
                onChange={(e) => updateNotificationConfig('firebase_server_key', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Clave del servidor Firebase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario silencioso - Inicio
              </label>
              <input
                type="time"
                value={config?.notification_config?.quiet_hours_start || '22:00'}
                onChange={(e) => updateNotificationConfig('quiet_hours_start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario silencioso - Fin
              </label>
              <input
                type="time"
                value={config?.notification_config?.quiet_hours_end || '08:00'}
                onChange={(e) => updateNotificationConfig('quiet_hours_end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">Configuración de Firebase</h3>
                <p className="text-sm text-blue-800">
                  Para enviar notificaciones push, necesitas configurar Firebase Cloud Messaging. 
                  La clave del servidor la puedes obtener en la consola de Firebase.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}