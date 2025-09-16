#!/bin/bash

# ========================================
# SCRIPT DE DEPLOYMENT AUTOMATIZADO
# WhatsApp Stickers - Producción
# ========================================

set -e  # Salir si algún comando falla

echo "🚀 Iniciando deployment a producción..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/var/www/sticker-app"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
NGINX_SITE="/etc/nginx/sites-available/sticker-app"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ========================================
# PASO 1: VERIFICAR PRERREQUISITOS
# ========================================

print_status "Verificando prerrequisitos..."

# Verificar que estemos corriendo como root o con sudo
if [[ $EUID -eq 0 ]]; then
   print_warning "Corriendo como root. Recomendamos usar sudo en su lugar."
fi

# Verificar comandos necesarios
commands=("python3" "node" "npm" "nginx" "mongod" "pm2")
for cmd in "${commands[@]}"; do
    if ! command -v $cmd &> /dev/null; then
        print_error "$cmd no está instalado. Por favor instala las dependencias primero."
        exit 1
    fi
done

print_success "Prerrequisitos verificados ✓"

# ========================================
# PASO 2: CREAR ESTRUCTURA DE DIRECTORIOS
# ========================================

print_status "Creando estructura de directorios..."

sudo mkdir -p $PROJECT_DIR
sudo mkdir -p $BACKEND_DIR/uploads/banners
sudo mkdir -p $BACKEND_DIR/uploads/categories
sudo mkdir -p /var/log/pm2

# Establecer permisos
sudo chown -R $USER:$USER $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR

print_success "Estructura de directorios creada ✓"

# ========================================
# PASO 3: CONFIGURAR BACKEND
# ========================================

print_status "Configurando backend..."

cd $BACKEND_DIR

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Entorno virtual creado ✓"
fi

# Activar entorno virtual e instalar dependencias
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

print_success "Backend configurado ✓"

# ========================================
# PASO 4: CONFIGURAR FRONTEND
# ========================================

print_status "Configurando frontend..."

cd $FRONTEND_DIR

# Instalar dependencias
npm install

# Build para producción
npm run build

print_success "Frontend configurado ✓"

# ========================================
# PASO 5: CONFIGURAR MONGODB
# ========================================

print_status "Configurando MongoDB..."

# Iniciar MongoDB si no está corriendo
sudo systemctl start mongod
sudo systemctl enable mongod

# Esperar a que MongoDB inicie
sleep 5

# Verificar que MongoDB esté corriendo
if ! sudo systemctl is-active --quiet mongod; then
    print_error "MongoDB no pudo iniciarse"
    exit 1
fi

print_success "MongoDB configurado ✓"

# ========================================
# PASO 6: CONFIGURAR NGINX
# ========================================

print_status "Configurando Nginx..."

# Verificar si el archivo de configuración existe
if [ ! -f "/app/deployment/nginx.conf" ]; then
    print_error "Archivo de configuración de Nginx no encontrado"
    exit 1
fi

# Copiar configuración de Nginx
sudo cp /app/deployment/nginx.conf $NGINX_SITE

# Habilitar sitio
sudo ln -sf $NGINX_SITE /etc/nginx/sites-enabled/sticker-app

# Remover sitio por defecto si existe
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
sudo nginx -t

if [ $? -eq 0 ]; then
    print_success "Configuración de Nginx válida ✓"
    sudo systemctl restart nginx
else
    print_error "Error en configuración de Nginx"
    exit 1
fi

print_success "Nginx configurado ✓"

# ========================================
# PASO 7: CONFIGURAR PM2
# ========================================

print_status "Configurando PM2..."

cd $BACKEND_DIR

# Copiar configuración de PM2
cp /app/deployment/ecosystem.config.js .

# Iniciar aplicación con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

print_success "PM2 configurado ✓"

# ========================================
# PASO 8: INICIALIZAR ADMIN
# ========================================

print_status "Inicializando admin por defecto..."

# Esperar a que el backend inicie
sleep 10

# Crear admin por defecto
curl -X POST http://localhost:8001/api/init-admin || print_warning "Admin ya existe o error al crear"

print_success "Admin inicializado ✓"

# ========================================
# PASO 9: VERIFICACIONES FINALES
# ========================================

print_status "Ejecutando verificaciones finales..."

# Verificar servicios
services=("mongod" "nginx")
for service in "${services[@]}"; do
    if sudo systemctl is-active --quiet $service; then
        print_success "$service está corriendo ✓"
    else
        print_error "$service no está corriendo"
    fi
done

# Verificar PM2
if pm2 list | grep -q "sticker-backend"; then
    print_success "Backend PM2 está corriendo ✓"
else
    print_error "Backend PM2 no está corriendo"
fi

# Verificar endpoints
print_status "Verificando endpoints..."

# Health check
if curl -s http://localhost:8001/health > /dev/null; then
    print_success "Backend health check OK ✓"
else
    print_warning "Backend health check falló"
fi

# ========================================
# PASO 10: INSTRUCCIONES FINALES
# ========================================

print_success "🎉 ¡Deployment completado exitosamente!"

echo ""
echo "=========================================="
echo "📋 PRÓXIMOS PASOS:"
echo "=========================================="
echo ""
echo "1. 🌐 CONFIGURAR DOMINIO:"
echo "   - Apuntar DNS de tu dominio a esta IP: $(curl -s ifconfig.me)"
echo "   - Reemplazar 'tudominio.com' en archivos de configuración"
echo ""
echo "2. 🔐 CONFIGURAR SSL:"
echo "   sudo certbot --nginx -d tudominio.com -d www.tudominio.com"
echo ""
echo "3. 🔑 CAMBIAR CREDENCIALES:"
echo "   - Cambiar password de MongoDB"
echo "   - Generar nuevo JWT_SECRET_KEY"
echo "   - Actualizar .env con datos reales"
echo ""
echo "4. 📱 CONFIGURAR APPS MÓVILES:"
echo "   - Cambiar URLs en código iOS/Android"
echo "   - Compilar y publicar en stores"
echo ""
echo "5. 🎨 AGREGAR CONTENIDO:"
echo "   - Login: http://$(curl -s ifconfig.me)/login"
echo "   - Usuario: admin@stickers.com"
echo "   - Password: admin123"
echo ""
echo "=========================================="
echo "📊 ESTADO DE SERVICIOS:"
echo "=========================================="

# Mostrar estado de servicios
sudo systemctl status mongod --no-pager -l
sudo systemctl status nginx --no-pager -l
pm2 status

echo ""
echo "🔗 URLs importantes:"
echo "   Frontend: http://$(curl -s ifconfig.me)"
echo "   Admin: http://$(curl -s ifconfig.me)/login"
echo "   API: http://$(curl -s ifconfig.me)/api/health"
echo ""
echo "📝 Logs importantes:"
echo "   Backend: pm2 logs sticker-backend"
echo "   Nginx: sudo tail -f /var/log/nginx/error.log"
echo "   MongoDB: sudo tail -f /var/log/mongodb/mongod.log"

print_success "¡Tu aplicación está lista para producción! 🚀"