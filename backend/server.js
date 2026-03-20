const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');

const app = express(); // 这行之前缺失了！
const PORT = process.env.PORT || 3000;

// Initialize database
const db = new sqlite3.Database('./blog.db');

// Create tables if they don't exist
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    avatar TEXT,
    bio TEXT,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Posts table
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT DEFAULT 'Admin',
    tags TEXT,
    category TEXT,
    status TEXT DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME
  )`);

  // Media table
  db.run(`CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
  )`);

  // Comments table
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'approved',
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
  )`);

  // Settings table (replaces config)
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Checkins table
  db.run(`CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    streak INTEGER DEFAULT 1,
    points INTEGER DEFAULT 10,
    note TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Wallet tables
  db.run(`CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    balance REAL DEFAULT 0,
    points REAL DEFAULT 0,
    frozen_balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    balance_before REAL NOT NULL,
    balance_after REAL NOT NULL,
    points_before REAL NOT NULL,
    points_after REAL NOT NULL,
    description TEXT,
    reference_type TEXT,
    reference_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS recharge_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_no TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    points REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS wallet_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default wallet config
  db.get('SELECT COUNT(*) as count FROM wallet_config', (err, row) => {
    if (!row || row.count === 0) {
      const stmt = db.prepare('INSERT OR IGNORE INTO wallet_config (key, value, description) VALUES (?, ?, ?)');
      stmt.run('recharge_enabled', 'true', '是否启用充值');
      stmt.run('withdraw_enabled', 'false', '是否启用提现');
      stmt.run('min_recharge', '1', '最低充值金额');
      stmt.run('max_recharge', '10000', '最高充值金额');
      stmt.run('points_rate', '1', '积分兑换比例');
      stmt.run('recharge_bonus_rate', '0', '充值赠送比例');
      stmt.finalize();
    }
  });

  // Insert default admin user if not exists (password: admin123)
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (row.count === 0) {
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('admin123', 10);
      const stmt = db.prepare('INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)');
      stmt.run('admin', hash, 'admin@sqlboy.top', 'admin');
      stmt.finalize();
      console.log('Default admin user created: username=admin, password=admin123');
    }
  });

  // Insert default settings if not exists
  db.get('SELECT COUNT(*) as count FROM settings WHERE key = "site_title"', (err, row) => {
    if (!row || row.count === 0) {
      const stmt = db.prepare('INSERT OR IGNORE INTO settings (key, value, description) VALUES (?, ?, ?)');
      stmt.run('site_title', 'blog.sqlboy.top', '博客标题');
      stmt.run('site_description', '一个现代化的个人博客平台', '博客描述');
      stmt.run('admin_email', 'admin@sqlboy.top', '管理员邮箱');
      stmt.finalize();
    }
  });
});

// Make database available to routes
app.set('db', db);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Serve static files
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(frontendDistPath));

// API Routes - Load route files
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const mediaRoutes = require('./routes/media');
const commentsRoutes = require('./routes/comments');
const settingsRoutes = require('./routes/settings');
const publicPostsRoutes = require('./routes/public-posts');
const rssRoutes = require('./routes/rss');
const changelogRoutes = require('./routes/changelog');
const likesRoutes = require('./routes/likes');
const projectsRoutes = require('./routes/projects');
const articleLogsRoutes = require('./routes/article-logs');
const checkinRoutes = require('./routes/checkin');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const discoverRoutes = require('./routes/discover');
const messagesRoutes = require('./routes/messages');
const searchRoutes = require('./routes/search');
const usersRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/article-logs', articleLogsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/changelog', changelogRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/checkin', checkinRoutes.router);
app.use('/api/wallet', walletRoutes.router);
app.use('/api/admin', adminRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', usersRoutes);

// Public posts API (no auth required)
app.use('/api/posts', publicPostsRoutes);

// RSS and Sitemap
app.use('/rss', rssRoutes);
app.get('/sitemap.xml', (req, res) => {
  res.redirect('/rss/sitemap.xml');
});
app.get('/feed.xml', (req, res) => {
  res.redirect('/rss/feed.xml');
});

// Admin posts API (with auth)
app.use('/api/admin/posts', postsRoutes);

// Admin routes - Serve Vue 3 frontend for /admin paths
// The Vue app handles all admin sub-routes via Vue Router
function serveAdminVue(req, res) {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Serve Vue frontend index.html for all /admin routes
  // Vue Router will handle the client-side routing
  const indexPath = path.resolve(frontendDistPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(content);
  }
  
  res.status(404).json({ error: 'Frontend not found. Please run npm run build in frontend directory.' });
}

// All admin routes - Vue Router handles sub-routes
app.all('/admin', serveAdminVue);
app.use('/admin', serveAdminVue);

// 注意：/api/posts 路由已移至 routes/posts.js 统一管理

// Public config endpoint (no auth required)
app.get('/api/config/public', (req, res) => {
  db.all('SELECT * FROM settings', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const config = {};
    (rows || []).forEach(row => {
      config[row.key] = row.value;
    });
    // 优先使用 site_logo，兼容旧的 blog_logo
    const logo = config.site_logo || config.blog_logo || '';
    res.json({ 
      blog_title: config.blog_title || config.site_title || 'My Blog',
      blog_description: config.blog_description || config.site_description || 'A personal blog',
      blog_logo: logo
    });
  });
});

// Article detail page
app.get('/post/:id', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'post.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error loading page');
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Frontend SPA fallback - serve index.html for non-API routes
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.startsWith('/rss/') || req.path.startsWith('/admin/')) {
    return next();
  }
  
  // For other routes, serve frontend index.html (Vue Router handles client-side routing)
  const frontendDistPath = path.join(__dirname, '../frontend/dist');
  const indexPath = path.join(frontendDistPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.sendFile(indexPath);
  }
  
  // If index.html doesn't exist, return 404
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Blog backend server running on port ${PORT}`);
});
// 安全头
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next()
})
