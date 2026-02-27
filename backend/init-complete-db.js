const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./blog.db');

// Create all necessary tables
db.serialize(() => {
  // Users table (single admin)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
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
    status TEXT DEFAULT 'published', -- 'published', 'draft'
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
    status TEXT DEFAULT 'approved', -- 'approved', 'pending', 'spam'
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
  )`);

  // Settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default admin user (password: admin123)
  const adminPasswordHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // bcrypt hash of 'password'
  db.run(`INSERT OR IGNORE INTO users (username, password_hash, email) VALUES (?, ?, ?)`, 
    ['admin', adminPasswordHash, 'admin@sqlboy.top']);

  // Insert default settings
  db.run(`INSERT OR IGNORE INTO settings (key, value, description) VALUES (?, ?, ?)`, 
    ['site_title', 'blog.sqlboy.top', '博客标题']);
  db.run(`INSERT OR IGNORE INTO settings (key, value, description) VALUES (?, ?, ?)`, 
    ['site_description', '一个现代化的个人博客平台', '博客描述']);
  db.run(`INSERT OR IGNORE INTO settings (key, value, description) VALUES (?, ?, ?)`, 
    ['admin_email', 'admin@sqlboy.top', '管理员邮箱']);

  // Check if sample posts exist
  db.get('SELECT COUNT(*) as count FROM posts', (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare(`INSERT INTO posts (title, content, author, tags, category, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      
      stmt.run(
        '欢迎来到我的博客', 
        '这是第一篇博客文章！在这里，我将分享技术心得、生活感悟和各种有趣的内容。感谢您的访问！', 
        '黄强', 
        '欢迎,博客', 
        '公告', 
        'published',
        new Date().toISOString()
      );
      
      stmt.run(
        'Vue3 + Tailwind CSS 开发体验', 
        '最近使用Vue3和Tailwind CSS开发了一个现代化的博客前端，体验非常棒！组合式API让代码更清晰，Tailwind的实用类让样式开发变得高效。', 
        '黄强', 
        'Vue3,Tailwind,CSS,前端', 
        '技术', 
        'published',
        new Date().toISOString()
      );
      
      stmt.run(
        'Nginx配置最佳实践', 
        '在部署Web应用时，Nginx的配置至关重要。本文分享了一些Nginx配置的最佳实践，包括HTTPS强制跳转、安全头设置、缓存策略等。', 
        '黄强', 
        'Nginx,服务器,HTTPS,安全', 
        '运维', 
        'published',
        new Date().toISOString()
      );
      
      stmt.run(
        'Let\'s Encrypt免费SSL证书', 
        '为网站启用HTTPS从未如此简单！通过Let\'s Encrypt可以免费获得SSL证书，并且支持自动续期。本文详细介绍了配置过程。', 
        '黄强', 
        'SSL,HTTPS,Let\'s Encrypt,安全', 
        '安全', 
        'published',
        new Date().toISOString()
      );
      
      stmt.finalize();
      console.log('Sample data inserted!');
    }
  });
});

db.close();
console.log('Database initialization completed!');