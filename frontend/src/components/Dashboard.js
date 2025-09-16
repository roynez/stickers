import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FolderOpen, 
  Package, 
  TrendingUp, 
  Smartphone, 
  Monitor,
  Heart,
  Download,
  Star,
  Flame,
  Sparkles,
  BarChart3,
  Users,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [popularPackages, setPopularPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, popularRes] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/dashboard/popular-packages?limit=5')
      ]);
      
      setStats(statsRes.data);
      setPopularPackages(popularRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getPopularityIcon = (rank) => {
    if (rank.includes('🔥')) return <Flame className="h-5 w-5 text-red-500" />;
    if (rank.includes('⭐')) return <Star className="h-5 w-5 text-yellow-500" />;
    if (rank.includes('📈')) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (rank.includes('👍')) return <Sparkles className="h-5 w-5 text-blue-500" />;
    return <Package className="h-5 w-5 text-gray-400" />;
  };

  const statCards = [
    {
      title: 'Total Paquetes',
      value: stats?.total_packages || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: `+${stats?.recent_packages || 0} esta semana`
    },
    {
      title: 'Total Categorías',
      value: stats?.total_categories || 0,
      icon: FolderOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'Sin subcategorías'
    },
    {
      title: 'Total Likes',
      value: stats?.total_likes || 0,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: 'Engagement activo'
    },
    {
      title: 'Descargas iOS',
      value: stats?.total_downloads_ios || 0,
      icon: Smartphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: `${stats?.ios_packages || 0} paquetes`
    },
    {
      title: 'Descargas Android',
      value: stats?.total_downloads_android || 0,
      icon: Monitor,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: `${stats?.android_packages || 0} paquetes`
    },
    {
      title: 'Multiplataforma',
      value: stats?.cross_platform_packages || 0,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'iOS + Android'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Panel de control unificado para iOS y Android</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg">
          <Activity className="h-5 w-5" />
          <span className="font-medium">Sistema Activo</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString()}</p>
                {stat.change && (
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Popular Packages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
              <Flame className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">📈 Paquetes Más Populares</h3>
              <p className="text-sm text-gray-600">Ordenados por algoritmo de popularidad</p>
            </div>
          </div>
        </div>

        {popularPackages.length > 0 ? (
          <div className="space-y-4">
            {popularPackages.map((pkg, index) => (
              <div key={pkg.package_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full border-2 border-gray-200 font-bold text-gray-700">
                    #{index + 1}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold text-gray-900">{pkg.package_name}</h4>
                      {getPopularityIcon(pkg.popularity_rank)}
                      <span className="text-sm text-gray-600">{pkg.popularity_rank}</span>
                    </div>
                    <p className="text-sm text-gray-600">{pkg.category_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-red-500">
                      <Heart className="h-4 w-4" />
                      <span className="font-semibold">{pkg.likes_count}</span>
                    </div>
                    <span className="text-gray-500">likes</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-blue-500">
                      <Download className="h-4 w-4" />
                      <span className="font-semibold">{pkg.total_downloads}</span>
                    </div>
                    <span className="text-gray-500">descargas</span>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1 text-green-500">
                      <BarChart3 className="h-4 w-4" />
                      <span className="font-semibold">{pkg.popularity_score}</span>
                    </div>
                    <span className="text-gray-500">score</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No hay paquetes populares aún</p>
          </div>
        )}
      </div>

      {/* Platform Breakdown & Category Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Distribución por Plataforma</h3>
              <p className="text-sm text-gray-600">Paquetes disponibles</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-500" />
                <span className="text-gray-700">Solo iOS</span>
              </div>
              <span className="font-semibold text-blue-600">{stats?.ios_packages || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-green-500" />
                <span className="text-gray-700">Solo Android</span>
              </div>
              <span className="font-semibold text-green-600">{stats?.android_packages || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="text-gray-700">Multiplataforma</span>
              </div>
              <span className="font-semibold text-purple-600">{stats?.cross_platform_packages || 0}</span>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Categorías</h3>
              <p className="text-sm text-gray-600">Por popularidad</p>
            </div>
          </div>
          
          {stats?.top_categories && stats.top_categories.length > 0 ? (
            <div className="space-y-3">
              {stats.top_categories.slice(0, 5).map((category, index) => (
                <div key={category._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">{category.category_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{category.package_count} paquetes</div>
                    <div className="text-xs text-gray-500">{category.total_downloads} descargas</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <FolderOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">No hay categorías disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/packages"
            className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Gestionar Paquetes</h4>
              <p className="text-sm text-gray-600">Crear y editar paquetes</p>
            </div>
          </a>
          
          <a
            href="/categories"
            className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <FolderOpen className="h-8 w-8 text-purple-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Categorías</h4>
              <p className="text-sm text-gray-600">Organizar contenido</p>
            </div>
          </a>
          
          <a
            href="/social-media"
            className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Redes Sociales</h4>
              <p className="text-sm text-gray-600">Configurar enlaces</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}