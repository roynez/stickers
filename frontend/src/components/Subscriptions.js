import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Heart,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Gift,
  Crown,
  Star,
  Zap,
  Shield,
  Clock,
  Award,
  Eye,
  EyeOff,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';

export default function Subscriptions() {
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, plansRes, subscribersRes] = await Promise.all([
        axios.get('/subscriptions/stats'),
        axios.get('/subscriptions/plans'),
        axios.get('/subscriptions/users?limit=20')
      ]);
      
      setStats(statsRes.data);
      setPlans(plansRes.data);
      setSubscribers(subscribersRes.data);
    } catch (error) {
      toast.error('Error al cargar datos de suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const initializePlans = async () => {
    try {
      await axios.post('/subscriptions/init-plans');
      toast.success('Planes de suscripción inicializados');
      fetchData();
    } catch (error) {
      toast.error('Error al inicializar planes');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Suscripciones</h1>
          <p className="text-gray-600 mt-1">Panel de apoyo al creador - Gestiona suscripciones premium</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg">
          <Heart className="h-5 w-5" />
          <span className="font-medium">Apoyo al Creador</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: TrendingUp },
            { id: 'plans', label: 'Planes', icon: Crown },
            { id: 'subscribers', label: 'Suscriptores', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suscriptores Activos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_active_subscribers || 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(stats?.monthly_revenue || 0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.conversion_rate || 0}%</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ARPU</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{formatCurrency(stats?.avg_revenue_per_user || 0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-50">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Plans Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Plan Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Plan Mensual</h3>
                    <p className="text-sm text-gray-600">$50 MXN/mes</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Suscriptores Activos</span>
                  <span className="font-semibold text-gray-900">{stats?.monthly_subscribers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ingresos Mensuales</span>
                  <span className="font-semibold text-green-600">{formatCurrency((stats?.monthly_subscribers || 0) * 50)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: stats?.total_active_subscribers > 0 
                        ? `${((stats?.monthly_subscribers || 0) / stats.total_active_subscribers) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Yearly Plan Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Gift className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Plan Anual</h3>
                    <p className="text-sm text-gray-600">$400 MXN/año (33% descuento)</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Suscriptores Activos</span>
                  <span className="font-semibold text-gray-900">{stats?.yearly_subscribers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ingresos Anuales</span>
                  <span className="font-semibold text-green-600">{formatCurrency((stats?.yearly_subscribers || 0) * 400)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: stats?.total_active_subscribers > 0 
                        ? `${((stats?.yearly_subscribers || 0) / stats.total_active_subscribers) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos Totales</h3>
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                <span className="text-2xl font-bold text-green-600">{formatCurrency(stats?.total_revenue || 0)}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">Ingresos totales generados</p>
            </div>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <Crown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay planes configurados</h3>
              <p className="text-gray-600 mb-6">Inicializa los planes por defecto para comenzar</p>
              <button
                onClick={initializePlans}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Inicializar Planes por Defecto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {plan.discount_percentage && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2">
                      <span className="font-medium">¡{plan.discount_percentage}% de descuento!</span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                      <div className="flex items-center gap-2">
                        {plan.duration === 'monthly' ? (
                          <Calendar className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Gift className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price_mxn)}</span>
                      <span className="text-gray-600">/{plan.duration === 'monthly' ? 'mes' : 'año'}</span>
                      {plan.duration === 'yearly' && (
                        <p className="text-sm text-green-600 mt-1">
                          Equivale a ${Math.round(plan.price_mxn / 12)} MXN/mes
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium text-gray-900">Beneficios incluidos:</h4>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          {feature === 'no_ads' && <Eye className="h-4 w-4 text-green-600" />}
                          {feature === 'support_creator' && <Heart className="h-4 w-4 text-red-600" />}
                          {feature === 'premium_badge' && <Star className="h-4 w-4 text-yellow-600" />}
                          {feature === 'priority_support' && <Zap className="h-4 w-4 text-blue-600" />}
                          {feature === 'exclusive_content' && <Crown className="h-4 w-4 text-purple-600" />}
                          {feature === 'early_access' && <Clock className="h-4 w-4 text-orange-600" />}
                          
                          <span>
                            {feature === 'no_ads' && 'Sin anuncios'}
                            {feature === 'support_creator' && 'Apoyo al creador'}
                            {feature === 'premium_badge' && 'Insignia premium'}
                            {feature === 'priority_support' && 'Soporte prioritario'}
                            {feature === 'exclusive_content' && 'Contenido exclusivo'}
                            {feature === 'early_access' && 'Acceso anticipado'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        {plan.is_active ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">Activo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400">
                            <EyeOff className="h-4 w-4" />
                            <span className="text-sm">Inactivo</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">ID: {plan.duration === 'monthly' ? 'Mensual' : 'Anual'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Suscriptores Recientes</h3>
            </div>
            
            {subscribers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay suscriptores aún</h3>
                <p className="text-gray-600">Los suscriptores aparecerán aquí cuando se registren</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plataforma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expira
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de Suscripción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {subscriber.user_id.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {subscriber.user_id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {subscriber.plan_id === 'support_monthly' ? (
                              <Calendar className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Gift className="h-4 w-4 text-purple-600" />
                            )}
                            <span className="text-sm text-gray-900">
                              {subscriber.plan_id === 'support_monthly' ? 'Mensual' : 'Anual'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            subscriber.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : subscriber.status === 'trial'
                              ? 'bg-blue-100 text-blue-800'
                              : subscriber.status === 'cancelled'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {subscriber.status === 'active' && 'Activo'}
                            {subscriber.status === 'trial' && 'Prueba'}
                            {subscriber.status === 'cancelled' && 'Cancelado'}
                            {subscriber.status === 'expired' && 'Expirado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="capitalize">{subscriber.platform}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(subscriber.expires_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(subscriber.created_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}