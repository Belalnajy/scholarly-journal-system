module.exports = {
  apps: [
    {
      name: 'upafa-backend',
      cwd: '/var/www/upafa-journal/apps/backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/www/upafa-journal/logs/backend-error.log',
      out_file: '/var/www/upafa-journal/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
