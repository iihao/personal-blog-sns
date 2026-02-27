const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./blog.db');

// Create posts table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT DEFAULT 'Admin',
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN DEFAULT 1
  )`);

  // Insert sample data
  const stmt = db.prepare(`INSERT INTO posts (title, content, author, tags) VALUES (?, ?, ?, ?)`);
  
  stmt.run('欢迎来到我的博客', '这是第一篇博客文章！在这里，我将分享技术心得、生活感悟和各种有趣的内容。感谢您的访问！', '黄强', '欢迎,博客');
  stmt.run('Vue3 + Tailwind CSS 开发体验', '最近使用Vue3和Tailwind CSS开发了一个现代化的博客前端，体验非常棒！组合式API让代码更清晰，Tailwind的实用类让样式开发变得高效。', '黄强', 'Vue3,Tailwind,CSS,前端');
  stmt.run('Nginx配置最佳实践', '在部署Web应用时，Nginx的配置至关重要。本文分享了一些Nginx配置的最佳实践，包括HTTPS强制跳转、安全头设置、缓存策略等。', '黄强', 'Nginx,服务器,HTTPS,安全');
  stmt.run('Let\'s Encrypt免费SSL证书', '为网站启用HTTPS从未如此简单！通过Let\'s Encrypt可以免费获得SSL证书，并且支持自动续期。本文详细介绍了配置过程。', '黄强', 'SSL,HTTPS,Let\'s Encrypt,安全');
  
  stmt.finalize();
  
  console.log('Database initialized with sample data!');
});

db.close();