import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Settings as SettingsIcon, 
  Smartphone, 
  Monitor, 
  Save,
  AlertCircle,
  DollarSign,
  Eye,
  Zap
} from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    ios: {
      admob_banner: '',
      admob_interstitial: '',
      facebook_banner: '',
      facebook_interstitial: ''
    },
    android: {
      admob_banner: '',
      admob_interstitial: '',
      facebook_banner: '',
      facebook_interstitial: ''
    },
    app_version: '1.0.0',
    maintenance_mode: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/settings');
      setSettings(response.data);
      setFormData({
        ios: response.data.ios || {
          admob_banner: '',
          admob_interstitial: '',
          facebook_banner: '',
          facebook_interstitial: ''
        },
        android: response.data.android || {
          admob_banner: '',
          admob_interstitial: '',
          facebook_banner: '',
          facebook_interstitial: ''
        },
        app_version: response.data.app_version || '1.0.0',
        maintenance_mode: response.data.maintenance_mode || false
      });
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put('/settings', formData);
      toast.success('Configuración guardada correctamente');
      fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handlePlatformChange = (platform, field, value) => {
    setFormData({
      ...formData,
      [platform]: {
        ...formData[platform],
        [field]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">Gestiona la configuración de anuncios y aplicación</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
          <SettingsIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Panel Unificado</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* iOS Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">iOS Configuration</h2>
              <p className="text-sm text-gray-600">Configuración de anuncios para la aplicación iOS</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AdMob iOS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">AdMob</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Ad Unit ID
                </label>
                <input
                  type="text"
                  value={formData.ios.admob_banner}
                  onChange={(e) => handlePlatformChange('ios', 'admob_banner', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ca-app-pub-xxxxxxxxxx/xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interstitial Ad Unit ID
                </label>
                <input
                  type="text"
                  value={formData.ios.admob_interstitial}
                  onChange={(e) => handlePlatformChange('ios', 'admob_interstitial', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ca-app-pub-xxxxxxxxxx/xxxxxxxxxx"
                />
              </div>
            </div>

            {/* Facebook iOS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Facebook Ads</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Placement ID
                </label>
                <input
                  type="text"
                  value={formData.ios.facebook_banner}
                  onChange={(e) => handlePlatformChange('ios', 'facebook_banner', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="XXXXXXXXX_XXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interstitial Placement ID
                </label>
                <input
                  type="text"
                  value={formData.ios.facebook_interstitial}
                  onChange={(e) => handlePlatformChange('ios', 'facebook_interstitial', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="XXXXXXXXX_XXXXXXXXX"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Android Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Monitor className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Android Configuration</h2>
              <p className="text-sm text-gray-600">Configuración de anuncios para la aplicación Android</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AdMob Android */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">AdMob</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Ad Unit ID
                </label>
                <input
                  type="text"
                  value={formData.android.admob_banner}
                  onChange={(e) => handlePlatformChange('android', 'admob_banner', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="ca-app-pub-xxxxxxxxxx/xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interstitial Ad Unit ID
                </label>
                <input
                  type="text"
                  value={formData.android.admob_interstitial}
                  onChange={(e) => handlePlatformChange('android', 'admob_interstitial', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="ca-app-pub-xxxxxxxxxx/xxxxxxxxxx"
                />
              </div>
            </div>

            {/* Facebook Android */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Facebook Ads</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Placement ID
                </label>
                <input
                  type="text"
                  value={formData.android.facebook_banner}
                  onChange={(e) => handlePlatformChange('android', 'facebook_banner', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="XXXXXXXXX_XXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interstitial Placement ID
                </label>
                <input
                  type="text"
                  value={formData.android.facebook_interstitial}
                  onChange={(e) => handlePlatformChange('android', 'facebook_interstitial', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="XXXXXXXXX_XXXXXXXXX"
                />
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
              <p className="text-sm text-gray-600">Configuración general de la aplicación</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Versión de la Aplicación
              </label>
              <input
                type="text"
                value={formData.app_version}
                onChange={(e) => setFormData({ ...formData, app_version: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="1.0.0"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.maintenance_mode}
                  onChange={(e) => setFormData({ ...formData, maintenance_mode: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Modo Mantenimiento</span>
                  <p className="text-xs text-gray-500">Activar para deshabilitar la aplicación temporalmente</p>
                </span>
              </label>
            </div>
          </div>

          {formData.maintenance_mode && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  <strong>Modo Mantenimiento Activo:</strong> Las aplicaciones móviles mostrarán un mensaje de mantenimiento.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="h-5 w-5" />
            )}
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">Información Importante</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los cambios en la configuración de anuncios pueden tardar hasta 24 horas en aplicarse.</li>
              <li>• Asegúrate de que los Ad Unit IDs sean válidos para evitar errores en la aplicación.</li>
              <li>• El modo mantenimiento afectará a todas las plataformas (iOS y Android).</li>
              <li>• Contacta al soporte técnico si necesitas ayuda con la configuración de anuncios.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}