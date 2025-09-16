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
  Zap,
  Gift,
  Play,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
  Globe,
  Shield,
  Mail,
  Gamepad2,
  Video,
  Star
} from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    ios_admob: true,
    ios_facebook: false,
    ios_unity: false,
    ios_ironsource: false,
    ios_applovin: false,
    android_admob: true,
    android_facebook: false,
    android_unity: false,
    android_ironsource: false,
    android_applovin: false
  });

  const [formData, setFormData] = useState({
    ios: {
      admob: {
        banner: '',
        interstitial: '',
        rewarded_interstitial: '',
        rewarded: '',
        native_advanced: '',
        app_open: ''
      },
      facebook: {
        banner: '',
        interstitial: '',
        rewarded_video: '',
        native: ''
      },
      unity: {
        game_id: '',
        banner: '',
        interstitial: '',
        rewarded_video: ''
      },
      ironsource: {
        app_key: '',
        banner: '',
        interstitial: '',
        rewarded_video: ''
      },
      applovin: {
        sdk_key: '',
        banner: '',
        interstitial: '',
        rewarded: '',
        native: ''
      }
    },
    android: {
      admob: {
        banner: '',
        interstitial: '',
        rewarded_interstitial: '',
        rewarded: '',
        native_advanced: '',
        app_open: ''
      },
      facebook: {
        banner: '',
        interstitial: '',
        rewarded_video: '',
        native: ''
      },
      unity: {
        game_id: '',
        banner: '',
        interstitial: '',
        rewarded_video: ''
      },
      ironsource: {
        app_key: '',
        banner: '',
        interstitial: '',
        rewarded_video: ''
      },
      applovin: {
        sdk_key: '',
        banner: '',
        interstitial: '',
        rewarded: '',
        native: ''
      }
    },
    monetization: {
      ad_frequency: 3,
      reward_amount: 10,
      banner_refresh_rate: 30,
      interstitial_min_interval: 60,
      enable_test_ads: false
    },
    app_version: '1.0.0',
    maintenance_mode: false,
    privacy_policy_url: '',
    terms_of_service_url: '',
    support_email: ''
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
          admob: {},
          facebook: {},
          unity: {},
          ironsource: {},
          applovin: {}
        },
        android: response.data.android || {
          admob: {},
          facebook: {},
          unity: {},
          ironsource: {},
          applovin: {}
        },
        monetization: response.data.monetization || {
          ad_frequency: 3,
          reward_amount: 10,
          banner_refresh_rate: 30,
          interstitial_min_interval: 60,
          enable_test_ads: false
        },
        app_version: response.data.app_version || '1.0.0',
        maintenance_mode: response.data.maintenance_mode || false,
        privacy_policy_url: response.data.privacy_policy_url || '',
        terms_of_service_url: response.data.terms_of_service_url || '',
        support_email: response.data.support_email || ''
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

  const handleAdNetworkChange = (platform, network, field, value) => {
    setFormData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [network]: {
          ...prev[platform][network],
          [field]: value
        }
      }
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const AdNetworkSection = ({ platform, network, config, title, icon: Icon, color, description }) => {
    const sectionKey = `${platform}_${network}`;
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">{title}</h4>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </button>
        
        {isExpanded && (
          <div className="p-6 space-y-4">
            {network === 'admob' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Target className="inline h-4 w-4 mr-1" />
                      Banner Ad Unit ID
                    </label>
                    <input
                      type="text"
                      value={config.banner || ''}
                      onChange={(e) => handleAdNetworkChange(platform, network, 'banner', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="ca-app-pub-xxxxxxxxxx/xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Eye className="inline h-4 w-4 mr-1" />
                      Intersticial Ad Unit ID
                    </label>
                    <input
                      type="text"
                      value={config.interstitial || ''}
                      onChange={(e) => handleAdNetworkChange(platform, network, 'interstitial', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="ca-app-pub-xxxxxxxxxx/xxxxxxxxxx"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Gift className="inline h-4 w-4 mr-1" />
                      Intersticial Bonificado (BETA)
                    </label>
                    <input
                      type="text"
                      value={config.rewarded_interstitial || ''}
                      onChange={(e) => handleAdNetworkChange(platform, network, 'rewarded_interstitial', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="ca-app-pub-xxxxxxxxxx/xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Star className="inline h-4 w-4 mr-1" />
                      Bonificado (Rewarded)
                    </label>
                    <input
                      type="text"
                      value={config.rewarded || ''}
                      onChange={(e) => handleAdNetworkChange(platform, network, 'rewarded', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="ca-app-pub-xxxxxxxxxx/xxxxxxxxxx"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Layers className="inline h-4 w-4 mr-1" />
                      Nativo Avanzado
                    </label>
                    <input
                      type="text"
                      value={config.native_advanced || ''}
                      onChange={(e) => handleAdNetworkChange(platform, network, 'native_advanced', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="ca-app-pub-xxxxxxxxxx/xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Play className="inline h-4 w-4 mr-1" />
                      Carga de Aplicación
                    </label>
                    <input
                      type="text"
                      value={config.app_open || ''}
                      onChange={(e) => handleAdNetworkChange(platform, network, 'app_open', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="ca-app-pub-xxxxxxxxxx/xxxxxxxxxx"
                    />
                  </div>
                </div>
              </>
            )}
            
            {network === 'facebook' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner Placement ID</label>
                  <input
                    type="text"
                    value={config.banner || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'banner', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="XXXXXXXXX_XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intersticial Placement ID</label>
                  <input
                    type="text"
                    value={config.interstitial || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'interstitial', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="XXXXXXXXX_XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rewarded Video Placement ID</label>
                  <input
                    type="text"
                    value={config.rewarded_video || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'rewarded_video', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="XXXXXXXXX_XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Native Placement ID</label>
                  <input
                    type="text"
                    value={config.native || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'native', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="XXXXXXXXX_XXXXXXXXX"
                  />
                </div>
              </div>
            )}

            {network === 'unity' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unity Game ID</label>
                  <input
                    type="text"
                    value={config.game_id || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'game_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner Placement</label>
                  <input
                    type="text"
                    value={config.banner || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'banner', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="banner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interstitial Placement</label>
                  <input
                    type="text"
                    value={config.interstitial || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'interstitial', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="video"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rewarded Video Placement</label>
                  <input
                    type="text"
                    value={config.rewarded_video || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'rewarded_video', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="rewardedVideo"
                  />
                </div>
              </div>
            )}

            {network === 'ironsource' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">IronSource App Key</label>
                  <input
                    type="text"
                    value={config.app_key || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'app_key', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="85460dcd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner Instance</label>
                  <input
                    type="text"
                    value={config.banner || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'banner', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="DefaultBanner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interstitial Instance</label>
                  <input
                    type="text"
                    value={config.interstitial || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'interstitial', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="DefaultInterstitial"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rewarded Video Instance</label>
                  <input
                    type="text"
                    value={config.rewarded_video || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'rewarded_video', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="DefaultRewardedVideo"
                  />
                </div>
              </div>
            )}

            {network === 'applovin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">AppLovin SDK Key</label>
                  <input
                    type="text"
                    value={config.sdk_key || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'sdk_key', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="YOUR_SDK_KEY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner Ad Unit</label>
                  <input
                    type="text"
                    value={config.banner || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'banner', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="BANNER_AD_UNIT_ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interstitial Ad Unit</label>
                  <input
                    type="text"
                    value={config.interstitial || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'interstitial', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="INTERSTITIAL_AD_UNIT_ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rewarded Ad Unit</label>
                  <input
                    type="text"
                    value={config.rewarded || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'rewarded', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="REWARDED_AD_UNIT_ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Native Ad Unit</label>
                  <input
                    type="text"
                    value={config.native || ''}
                    onChange={(e) => handleAdNetworkChange(platform, network, 'native', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="NATIVE_AD_UNIT_ID"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración Avanzada</h1>
          <p className="text-gray-600 mt-1">Panel completo de monetización para ambas plataformas</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
          <DollarSign className="h-5 w-5" />
          <span className="text-sm font-medium">Monetización Completa</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* iOS Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">iOS - Configuración de Anuncios</h2>
              <p className="text-sm text-gray-600">Todas las redes publicitarias disponibles para iOS</p>
            </div>
          </div>

          <div className="space-y-4">
            <AdNetworkSection
              platform="ios"
              network="admob"
              config={formData.ios.admob || {}}
              title="Google AdMob"
              icon={DollarSign}
              color="bg-green-600"
              description="La red publicitaria más popular - Banner, Intersticial, Bonificado, Nativo, App Open"
            />
            <AdNetworkSection
              platform="ios"
              network="facebook"
              config={formData.ios.facebook || {}}
              title="Facebook Audience Network"
              icon={Eye}
              color="bg-blue-600"
              description="Red publicitaria de Meta - Banner, Intersticial, Video, Nativo"
            />
            <AdNetworkSection
              platform="ios"
              network="unity"
              config={formData.ios.unity || {}}
              title="Unity Ads"
              icon={Gamepad2}
              color="bg-purple-600"
              description="Especializada en gaming - Banner, Intersticial, Video bonificado"
            />
            <AdNetworkSection
              platform="ios"
              network="ironsource"
              config={formData.ios.ironsource || {}}
              title="IronSource"
              icon={Target}
              color="bg-orange-600"
              description="Mediación avanzada - Banner, Intersticial, Video bonificado"
            />
            <AdNetworkSection
              platform="ios"
              network="applovin"
              config={formData.ios.applovin || {}}
              title="AppLovin MAX"
              icon={Zap}
              color="bg-indigo-600"
              description="Plataforma de crecimiento - Banner, Intersticial, Bonificado, Nativo"
            />
          </div>
        </div>

        {/* Android Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <Monitor className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Android - Configuración de Anuncios</h2>
              <p className="text-sm text-gray-600">Todas las redes publicitarias disponibles para Android</p>
            </div>
          </div>

          <div className="space-y-4">
            <AdNetworkSection
              platform="android"
              network="admob"
              config={formData.android.admob || {}}
              title="Google AdMob"
              icon={DollarSign}
              color="bg-green-600"
              description="La red publicitaria más popular - Banner, Intersticial, Bonificado, Nativo, App Open"
            />
            <AdNetworkSection
              platform="android"
              network="facebook"
              config={formData.android.facebook || {}}
              title="Facebook Audience Network"
              icon={Eye}
              color="bg-blue-600"
              description="Red publicitaria de Meta - Banner, Intersticial, Video, Nativo"
            />
            <AdNetworkSection
              platform="android"
              network="unity"
              config={formData.android.unity || {}}
              title="Unity Ads"
              icon={Gamepad2}
              color="bg-purple-600"
              description="Especializada en gaming - Banner, Intersticial, Video bonificado"
            />
            <AdNetworkSection
              platform="android"
              network="ironsource"
              config={formData.android.ironsource || {}}
              title="IronSource"
              icon={Target}
              color="bg-orange-600"
              description="Mediación avanzada - Banner, Intersticial, Video bonificado"
            />
            <AdNetworkSection
              platform="android"
              network="applovin"
              config={formData.android.applovin || {}}
              title="AppLovin MAX"
              icon={Zap}
              color="bg-indigo-600"
              description="Plataforma de crecimiento - Banner, Intersticial, Bonificado, Nativo"
            />
          </div>
        </div>

        {/* Monetization Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <SettingsIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Configuración de Monetización</h2>
              <p className="text-sm text-gray-600">Ajustes generales para optimizar ingresos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia de Anuncios
              </label>
              <select
                value={formData.monetization.ad_frequency}
                onChange={(e) => setFormData({
                  ...formData,
                  monetization: { ...formData.monetization, ad_frequency: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={1}>Cada 1 sticker</option>
                <option value={2}>Cada 2 stickers</option>
                <option value={3}>Cada 3 stickers</option>
                <option value={5}>Cada 5 stickers</option>
                <option value={10}>Cada 10 stickers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recompensa por Video (puntos)
              </label>
              <input
                type="number"
                value={formData.monetization.reward_amount}
                onChange={(e) => setFormData({
                  ...formData,
                  monetization: { ...formData.monetization, reward_amount: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="10"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo Banner (segundos)
              </label>
              <select
                value={formData.monetization.banner_refresh_rate}
                onChange={(e) => setFormData({
                  ...formData,
                  monetization: { ...formData.monetization, banner_refresh_rate: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={15}>15 segundos</option>
                <option value={30}>30 segundos</option>
                <option value={60}>60 segundos</option>
                <option value={120}>2 minutos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo Intersticial (segundos)
              </label>
              <select
                value={formData.monetization.interstitial_min_interval}
                onChange={(e) => setFormData({
                  ...formData,
                  monetization: { ...formData.monetization, interstitial_min_interval: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={30}>30 segundos</option>
                <option value={60}>1 minuto</option>
                <option value={120}>2 minutos</option>
                <option value={300}>5 minutos</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.monetization.enable_test_ads}
                  onChange={(e) => setFormData({
                    ...formData,
                    monetization: { ...formData.monetization, enable_test_ads: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Anuncios de Prueba</span>
                  <p className="text-xs text-gray-500">Activar para desarrollo</p>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Globe className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Configuración General</h2>
              <p className="text-sm text-gray-600">Ajustes generales de la aplicación</p>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="1.0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Soporte
              </label>
              <input
                type="email"
                value={formData.support_email}
                onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="support@yourapp.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Política de Privacidad
              </label>
              <input
                type="url"
                value={formData.privacy_policy_url}
                onChange={(e) => setFormData({ ...formData, privacy_policy_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="https://yourapp.com/privacy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Términos de Servicio
              </label>
              <input
                type="url"
                value={formData.terms_of_service_url}
                onChange={(e) => setFormData({ ...formData, terms_of_service_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="https://yourapp.com/terms"
              />
            </div>

            <div className="md:col-span-2 flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.maintenance_mode}
                  onChange={(e) => setFormData({ ...formData, maintenance_mode: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Modo Mantenimiento</span>
                  <p className="text-xs text-gray-500">Deshabilitar aplicaciones temporalmente</p>
                </span>
              </label>
            </div>
          </div>

          {formData.maintenance_mode && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">
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
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg"
          >
            {saving ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="h-6 w-6" />
            )}
            {saving ? 'Guardando Configuración...' : 'Guardar Configuración Completa'}
          </button>
        </div>
      </form>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Información sobre Monetización</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>AdMob:</strong> La red más popular, incluye todos los formatos (Banner, Intersticial, Bonificado, Nativo, App Open)</li>
              <li>• <strong>Facebook:</strong> Buena para apps con audiencia internacional, especialmente efectiva para contenido social</li>
              <li>• <strong>Unity:</strong> Excelente para aplicaciones con elementos de gamificación o recompensas</li>
              <li>• <strong>IronSource:</strong> Plataforma de mediación avanzada, ideal para maximizar eCPM</li>
              <li>• <strong>AppLovin:</strong> Gran para user acquisition y monetización combinada</li>
              <li>• Los cambios pueden tardar hasta 24 horas en aplicarse en las aplicaciones móviles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}