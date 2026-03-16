module.exports = {
  apps: [
    {
      name: 'frotapro-backend',
      script: './backend/src/server.js',
      cwd: '/var/www/gestao-frotas',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
