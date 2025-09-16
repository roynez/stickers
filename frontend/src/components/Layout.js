import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Sticker, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Smartphone,
  Monitor,
  Crown,
  Heart,
  Banknote,
  Bell,
  Cog,
  User,
  Users
} from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Categorías', href: '/categories', icon: FolderOpen },
    { name: 'Paquetes', href: '/packages', icon: Sticker, badge: 'Nuevo' },
    { name: 'Suscripciones', href: '/subscriptions', icon: Crown, badge: 'Premium' },
    { name: 'Banners', href: '/banners', icon: Banknote, badge: 'Promo' },
    { name: 'Notificaciones', href: '/notifications', icon: Bell, badge: 'Push' },
    { name: 'Redes Sociales', href: '/social-media', icon: Users, badge: 'Social' },
    { name: 'Sistema', href: '/system-config', icon: Cog, badge: 'Config' },
    { name: 'Configuración', href: '/settings', icon: Settings },
    { name: 'Perfil Admin', href: '/admin-profile', icon: User, badge: 'Admin' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} location={location} admin={admin} onLogout={handleLogout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent navigation={navigation} location={location} admin={admin} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white shadow-sm">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navigation, location, admin, onLogout }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">+</span>
            <div className="p-2 bg-green-600 rounded-lg">
              <Monitor className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">Panel Avanzado</h1>
            <p className="text-xs text-gray-500">iOS & Android</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.badge === 'Premium' ? 'bg-pink-100 text-pink-800' :
                    item.badge === 'Nuevo' ? 'bg-green-100 text-green-800' :
                    item.badge === 'Push' ? 'bg-blue-100 text-blue-800' :
                    item.badge === 'Config' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Support Creator Section */}
        <div className="px-4 py-3 mb-4 mx-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-pink-600" />
            <span className="text-sm font-medium text-pink-900">Apoyo al Creador</span>
          </div>
          <p className="text-xs text-pink-700">
            Las suscripciones ayudan directamente al creador de estos increíbles stickers
          </p>
        </div>
      </div>

      {/* User info */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {admin?.name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-700">{admin?.name}</p>
            <p className="text-xs text-gray-500">{admin?.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}