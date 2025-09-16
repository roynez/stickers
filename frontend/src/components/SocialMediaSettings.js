import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Save,
  ExternalLink,
  Eye,
  EyeOff,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Users,
  Link as LinkIcon,
  Share2,
  Globe,
  Settings
} from 'lucide-react';

// Custom TikTok icon (Lucide doesn't have one)
const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-6.274 6.496v.003a6.323 6.323 0 0010.274 4.997V10.3a8.46 8.46 0 004.888 1.516V8.34a4.801 4.801 0 01-.655-.047z"/>
  </svg>
);

export default function SocialMediaSettings() {
  const [socialLinks, setSocialLinks] = useState({
    tiktok: '',
    instagram: '',
    facebook: '',
    twitter_x: '',
    whatsapp_channel: '',
    show_in_app: true,
    show_in_footer: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const response = await axios.get('/social-media');
      setSocialLinks(response.data);
    } catch (error) {
      toast.error('Error al cargar redes sociales');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put('/social-media', socialLinks);
      toast.success('Redes sociales actualizadas correctamente');
    } catch (error) {
      toast.error('Error al actualizar redes sociales');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (platform, value) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const validateUrl = (url, platform) => {
    if (!url) return true; // Empty is valid
    
    const platformDomains = {
      tiktok: ['tiktok.com', 'vm.tiktok.com'],
      instagram: ['instagram.com', 'instagr.am'],
      facebook: ['facebook.com', 'fb.com'],
      twitter_x: ['twitter.com', 'x.com'],
      whatsapp_channel: ['whatsapp.com', 'wa.me', 'chat.whatsapp.com']
    };

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlObj.hostname.replace('www.', '');
      return platformDomains[platform]?.some(validDomain => domain.includes(validDomain));
    } catch {
      return false;
    }
  };

  const formatUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const getActiveLinksCount = () => {
    return Object.entries(socialLinks)
      .filter(([key, value]) => 
        key !== 'show_in_app' && 
        key !== 'show_in_footer' && 
        value && 
        value.trim() !== ''
      ).length;
  };

  const socialPlatforms = [
    {
      key: 'tiktok',
      name: 'TikTok',
      icon: TikTokIcon,
      placeholder: 'https://tiktok.com/@tuusuario',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      key: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      placeholder: 'https://instagram.com/tuusuario',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      key: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      placeholder: 'https://facebook.com/tupagina',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      key: 'twitter_x',
      name: 'X (Twitter)',
      icon: Twitter,
      placeholder: 'https://x.com/tuusuario',
      color: 'text-gray-800',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      key: 'whatsapp_channel',
      name: 'Canal WhatsApp',
      icon: MessageCircle,
      placeholder: 'https://whatsapp.com/channel/tucanal',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">📱 Redes Sociales</h1>
          <p className="text-gray-600 mt-1">Configura tus redes sociales para mostrar en la aplicación</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">{getActiveLinksCount()} activas</span>
          </div>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              previewMode 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {previewMode ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            <span className="text-sm font-medium">
              {previewMode ? 'Vista previa ON' : 'Vista previa'}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enlaces Configurados</p>
              <p className="text-2xl font-bold text-blue-600">{getActiveLinksCount()}</p>
            </div>
            <LinkIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mostrar en App</p>
              <p className="text-2xl font-bold text-green-600">
                {socialLinks.show_in_app ? 'SÍ' : 'NO'}
              </p>
            </div>
            <Globe className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Footer</p>
              <p className="text-2xl font-bold text-purple-600">
                {socialLinks.show_in_footer ? 'SÍ' : 'NO'}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {previewMode && getActiveLinksCount() > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Vista Previa - Como se ve en la App</h3>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Síguenos en nuestras redes:</h4>
            <div className="flex flex-wrap gap-3">
              {socialPlatforms.map(platform => {
                const link = socialLinks[platform.key];
                if (!link || !link.trim()) return null;
                
                return (
                  <a
                    key={platform.key}
                    href={formatUrl(link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-2 ${platform.bgColor} ${platform.color} rounded-lg hover:opacity-80 transition-opacity`}
                  >
                    <platform.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{platform.name}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Configuration Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configuración de Enlaces</h2>
            <p className="text-sm text-gray-600">Agrega tus enlaces de redes sociales</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Social Media Links */}
          <div className="space-y-4">
            {socialPlatforms.map(platform => (
              <div key={platform.key} className={`border ${platform.borderColor} rounded-lg p-4 ${platform.bgColor}`}>
                <div className="flex items-center gap-3 mb-3">
                  <platform.icon className={`h-6 w-6 ${platform.color}`} />
                  <h3 className="text-lg font-medium text-gray-900">{platform.name}</h3>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="url"
                    value={socialLinks[platform.key] || ''}
                    onChange={(e) => handleInputChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                  
                  {socialLinks[platform.key] && !validateUrl(socialLinks[platform.key], platform.key) && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <ExternalLink className="h-4 w-4" />
                      URL no válida para {platform.name}
                    </p>
                  )}
                  
                  {socialLinks[platform.key] && validateUrl(socialLinks[platform.key], platform.key) && (
                    <div className="flex items-center gap-2">
                      <p className="text-green-600 text-sm flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        Enlace válido
                      </p>
                      <a
                        href={formatUrl(socialLinks[platform.key])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        Probar enlace
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Display Settings */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Configuración de Visualización</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={socialLinks.show_in_app}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, show_in_app: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="ml-3 text-sm text-gray-700">
                  <span className="font-medium">Mostrar en la aplicación</span>
                  <span className="block text-gray-500">Los usuarios verán estos enlaces en la app móvil</span>
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={socialLinks.show_in_footer}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, show_in_footer: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="ml-3 text-sm text-gray-700">
                  <span className="font-medium">Mostrar en footer</span>
                  <span className="block text-gray-500">Aparecerán en la parte inferior de la aplicación</span>
                </span>
              </label>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Consejos de Uso</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Usa URLs completas (incluye https://)</li>
              <li>• Verifica que los enlaces funcionen antes de guardar</li>
              <li>• Los canales de WhatsApp deben ser enlaces de invitación válidos</li>
              <li>• Puedes dejar campos vacíos si no tienes esa red social</li>
              <li>• Los cambios se reflejan inmediatamente en la aplicación móvil</li>
            </ul>
          </div>

          {/* Submit Button */}
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
      </div>

      {/* Integration Guide */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Guía de Integración</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Para Desarrolladores Mobile:</h4>
            <p className="text-sm text-gray-600 mb-2">
              Usa el endpoint público para obtener los enlaces:
            </p>
            <code className="block bg-gray-100 p-2 rounded text-xs font-mono">
              GET /api/public/social-media
            </code>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Estructura de Respuesta:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`{
  "links": {
    "instagram": "https://...",
    "tiktok": "https://..."
  },
  "show_in_app": true
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}