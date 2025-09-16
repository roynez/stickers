import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Key, 
  Save,
  Eye,
  EyeOff,
  Shield,
  Users,
  UserPlus,
  Edit2,
  AlertCircle
} from 'lucide-react';

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [adminList, setAdminList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, adminListRes] = await Promise.all([
        axios.get('/admin/profile'),
        axios.get('/admin/list')
      ]);
      
      setProfile(profileRes.data);
      setProfileForm({
        name: profileRes.data.name,
        email: profileRes.data.email
      });
      setAdminList(adminListRes.data);
    } catch (error) {
      toast.error('Error al cargar datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put('/admin/profile', profileForm);
      toast.success('Perfil actualizado correctamente');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSaving(true);

    try {
      await axios.post('/admin/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      
      toast.success('Contraseña cambiada correctamente');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (newAdminForm.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSaving(true);

    try {
      await axios.post('/admin/create', newAdminForm);
      toast.success('Administrador creado correctamente');
      setNewAdminForm({
        name: '',
        email: '',
        password: '',
        is_active: true
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear administrador');
    } finally {
      setSaving(false);
    }
  };

  const togglePassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Administradores</h1>
          <p className="text-gray-600 mt-1">Administra tu perfil y otros usuarios administradores</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
          <Shield className="h-5 w-5" />
          <span className="text-sm font-medium">Panel Administrativo</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', label: 'Mi Perfil', icon: User },
            { id: 'password', label: 'Cambiar Contraseña', icon: Key },
            { id: 'admins', label: 'Administradores', icon: Users }
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

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Información del Perfil</h2>
              <p className="text-sm text-gray-600">Actualiza tu información personal</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {profile && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Información Adicional</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID de Usuario:</span>
                    <p className="font-mono text-xs text-gray-800">{profile.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Último Login:</span>
                    <p className="text-gray-800">
                      {profile.last_login ? new Date(profile.last_login).toLocaleString('es-MX') : 'Nunca'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Cuenta Creada:</span>
                    <p className="text-gray-800">
                      {new Date(profile.created_date).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                {saving ? 'Guardando...' : 'Actualizar Perfil'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Key className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Cambiar Contraseña</h2>
              <p className="text-sm text-gray-600">Actualiza tu contraseña de acceso</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePassword('current')}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => togglePassword('new')}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => togglePassword('confirm')}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-900 mb-1">Requisitos de Contraseña</h3>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Mínimo 6 caracteres</li>
                    <li>• Se recomienda incluir números y caracteres especiales</li>
                    <li>• Evita usar información personal</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Key className="h-5 w-5" />
                )}
                {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins Tab */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          {/* Create New Admin */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Administrador</h2>
                <p className="text-sm text-gray-600">Añadir un nuevo usuario con permisos administrativos</p>
              </div>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={newAdminForm.name}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={newAdminForm.password}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAdminForm.is_active}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Cuenta activa</span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <UserPlus className="h-5 w-5" />
                  )}
                  {saving ? 'Creando...' : 'Crear Administrador'}
                </button>
              </div>
            </form>
          </div>

          {/* Admin List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Lista de Administradores</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminList.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {admin.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {admin.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {admin.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          admin.is_active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.last_login ? 
                          new Date(admin.last_login).toLocaleDateString('es-MX') : 
                          'Nunca'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(admin.created_date).toLocaleDateString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}