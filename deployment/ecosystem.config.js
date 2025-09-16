// PM2 Configuration for WhatsApp Stickers Backend
// Ubicación: /var/www/sticker-app/backend/ecosystem.config.js

module.exports = {
  apps: [{
    name: 'sticker-backend',
    script: 'venv/bin/python',
    args: '-m uvicorn server:app --host 0.0.0.0 --port 8001 --workers 2',
    cwd: '/var/www/sticker-app/backend',
    instances: 1,
    exec_mode: 'fork',
    
    // Auto restart
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // Logs
    log_file: '/var/log/pm2/sticker-backend.log',
    out_file: '/var/log/pm2/sticker-backend-out.log',
    error_file: '/var/log/pm2/sticker-backend-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PYTHONPATH: '/var/www/sticker-app/backend',
      TZ: 'UTC'
    },
    
    // Advanced settings
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Monitoring
    monitoring: false,
    pmx: false
  }],

  // Deployment configuration
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'tu-servidor-ip',
      ref: 'origin/main',
      repo: 'git@github.com:tu-usuario/sticker-app.git',
      path: '/var/www/sticker-app',
      'post-deploy': 'cd backend && source venv/bin/activate && pip install -r requirements.txt && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    }
  }
}