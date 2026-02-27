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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes - Load route files
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const mediaRoutes = require('./routes/media');
const commentsRoutes = require('./routes/comments');
const configRoutes = require('./routes/config');

app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/posts', postsRoutes);

// Admin routes - Express 5.x compatible (direct file serving)
const adminPublicPath = path.join(__dirname, 'public');

// Helper to serve admin HTML files directly
function serveAdminHTML(req, res) {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const relativePath = req.path.replace(/^\/admin\/?/, '');
  console.log('[Admin Route] path:', req.path, 'relative:', relativePath);
  
  // Root or empty path -> index.html
  if (!relativePath || relativePath === '') {
    const content = fs.readFileSync(path.join(adminPublicPath, 'index.html'), 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(content);
  }
  
  // No extension -> try .html file, fallback to index.html
  if (!relativePath.includes('.')) {
    const htmlPath = path.join(adminPublicPath, relativePath + '.html');
    if (fs.existsSync(htmlPath)) {
      const content = fs.readFileSync(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(content);
    }
    const content = fs.readFileSync(path.join(adminPublicPath, 'index.html'), 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(content);
  }
  
  // With extension -> serve directly or 404
  const fullPath = path.join(adminPublicPath, relativePath);
  if (fs.existsSync(fullPath)) {
    const ext = path.extname(fullPath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    return res.sendFile(fullPath);
  }
  
  res.status(404).json({ error: 'Not found' });
}

// All admin routes - Express 5.x compatible (no optional params)
app.all('/admin', serveAdminHTML);
app.all('/admin/:page', serveAdminHTML);
app.all('/admin/:page/:subpage', serveAdminHTML);
app.all('/admin/:page/:subpage/:third', serveAdminHTML);

// Public posts endpoints (no auth required) - MUST be before postsRoutes
app.get('/api/posts/stats', (req, res) => {
  db.all("SELECT COUNT(*) as total FROM posts", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const total = rows[0]?.total || 0;
    
    db.all("SELECT COUNT(*) as count FROM posts WHERE status = 'published'", (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const published = rows[0]?.count || 0;
      
      db.all("SELECT COUNT(*) as count FROM posts WHERE status = 'draft'", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const drafts = rows[0]?.count || 0;
        
        res.json({ total, published, drafts });
      });
    });
  });
});

app.get('/api/posts', (req, res) => {
  db.all("SELECT * FROM posts ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ posts: rows || [] });
  });
});

app.get('/api/posts/:id', (req, res) => {
  db.get("SELECT * FROM posts WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post: row });
  });
});

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
    res.json({ 
      blog_title: config.site_title || 'My Blog',
      blog_description: config.site_description || 'A personal blog'
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

// Fallback for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Blog backend server running on port ${PORT}`);
});