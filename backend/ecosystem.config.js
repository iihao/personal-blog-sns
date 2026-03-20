module.exports = {
  apps: [{
    name: 'blog-backend',
    script: './server.js',
    cwd: '/home/admin/.openclaw/workspace/blog-project/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/admin/.openclaw/workspace/blog-project/backend/pm2-error.log',
    out_file: '/home/admin/.openclaw/workspace/blog-project/backend/pm2-out.log',
    log_file: '/home/admin/.openclaw/workspace/blog-project/backend/pm2-combined.log',
    time: true,
    merge_logs: true
  }]
};
