const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// Get all posts (public) with filters - public read, admin gets drafts too
router.get('/', optionalAuth, (req, res) => {
  const { page = 1, limit = 10, search = '', status = 'published', category = '', tag = '' } = req.query;
  const isAdmin = req.user && req.user.role === 'admin';
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM posts WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM posts WHERE 1=1';
  const params = [];
  
  // For non-admins, only show published posts
  if (!isAdmin) {
    query += ' AND status = "published"';
    countQuery += ' AND status = "published"';
  }
  
  // Search
  if (search) {
    query += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ? OR category LIKE ?)';
    countQuery += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ? OR category LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }
  
  // Status filter (admin only - can filter by draft/published)
  if (isAdmin && status !== 'published' && status !== 'all') {
    query += ' AND status = ?';
    countQuery += ' AND status = ?';
    params.push(status);
  }
  
  // Category filter
  if (category) {
    query += ' AND category = ?';
    countQuery += ' AND category = ?';
    params.push(category);
  }
  
  // Tag filter
  if (tag) {
    query += ' AND tags LIKE ?';
    countQuery += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.get(countQuery, params.slice(0, -2), (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ 
        posts: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// Get post statistics - public read
router.get('/stats', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM posts',
    "SELECT COUNT(*) as published FROM posts WHERE status = 'published'",
    "SELECT COUNT(*) as drafts FROM posts WHERE status = 'draft'",
    "SELECT COALESCE(SUM(view_count), 0) as views FROM posts"
  ];
  
  Promise.all([
    new Promise((resolve, reject) => db.get(queries[0], (err, row) => err ? reject(err) : resolve(row))),
    new Promise((resolve, reject) => db.get(queries[1], (err, row) => err ? reject(err) : resolve(row))),
    new Promise((resolve, reject) => db.get(queries[2], (err, row) => err ? reject(err) : resolve(row))),
    new Promise((resolve, reject) => db.get(queries[3], (err, row) => err ? reject(err) : resolve(row)))
  ]).then(([total, published, drafts, views]) => {
    res.json({
      total: total.total,
      published: published.published,
      drafts: drafts.drafts,
      views: views.views
    });
  }).catch(err => {
    console.error('Stats query error:', err);
    res.status(500).json({ error: err.message });
  });
});

// Get all categories - public read
router.get('/categories', (req, res) => {
  db.all("SELECT DISTINCT category, COUNT(*) as count FROM posts WHERE category != '' AND status = 'published' GROUP BY category ORDER BY count DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ categories: rows || [] });
  });
});

// Get all tags - public read
router.get('/tags', (req, res) => {
  db.all("SELECT tags FROM posts WHERE status = 'published' AND tags != ''", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const tagMap = {};
    rows.forEach(row => {
      if (row.tags) {
        // 同时支持中英文逗号分隔（正则表达式：[,] 或 [，]）
        row.tags.split(/[,，]/).forEach(tag => {
          const trimmed = tag.trim();
          if (trimmed) {
            tagMap[trimmed] = (tagMap[trimmed] || 0) + 1;
          }
        });
      }
    });
    
    const tags = Object.entries(tagMap).map(([name, count]) => ({ tag: name, count }));
    tags.sort((a, b) => b.count - a.count);
    
    res.json({ tags });
  });
});

// Get post by ID - public read (returns all posts including drafts for admins)
router.get('/:id', optionalAuth, (req, res) => {
  const isAdmin = req.user && req.user.role === 'admin';
  const query = isAdmin 
    ? 'SELECT * FROM posts WHERE id = ?'
    : "SELECT * FROM posts WHERE id = ? AND status = 'published'";
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Post not found' });
    
    // 记录浏览日志
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let user_id = null;
    let username = '匿名用户';
    
    if (token) {
      try {
        const { verifyToken } = require('../middleware/auth');
        const payload = verifyToken(token);
        if (payload) {
          user_id = payload.id;
          username = payload.username;
        }
      } catch (e) {}
    }
    
    const ip_address = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress;
    
    db.run(`INSERT INTO article_logs (article_id, user_id, username, action, action_type, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, user_id, username, '查看文章', 'view', '浏览文章详情', ip_address]);
    
    res.json({ post: row });
  });
});

// Create new post - requires auth
router.post('/', authenticateToken, (req, res) => {
  const { title, content, content_format, author, tags, category, status } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  const stmt = db.prepare('INSERT INTO posts (title, content, content_format, author, tags, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(title, content, content_format || 'markdown', author || req.user.username || 'Admin', tags || '', category || '', status || 'published', function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: 'Post created successfully' });
  });
  stmt.finalize();
});

// Update post - requires auth
router.put('/:id', authenticateToken, (req, res) => {
  const { title, content, content_format, author, tags, category, status } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  const stmt = db.prepare('UPDATE posts SET title = ?, content = ?, content_format = ?, author = ?, tags = ?, category = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(title, content, content_format || 'markdown', author || req.user.username || 'Admin', tags || '', category || '', status || 'published', req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Post not found' });
    
    // 记录修改日志
    const ip_address = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress;
    db.run(`INSERT INTO article_logs (article_id, user_id, username, action, action_type, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, req.user.id, req.user.username, '修改文章', 'update', `更新文章：${title}`, ip_address]);
    
    res.json({ message: 'Post updated successfully' });
  });
  stmt.finalize();
});

// Delete post - requires auth
router.delete('/:id', authenticateToken, (req, res) => {
  const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
  stmt.run(req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Post not found' });
    
    // 记录删除日志
    const ip_address = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress;
    db.run(`INSERT INTO article_logs (article_id, user_id, username, action, action_type, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, req.user.id, req.user.username, '删除文章', 'delete', '删除文章', ip_address]);
    
    res.json({ message: 'Post deleted successfully' });
  });
  stmt.finalize();
});

// Batch delete posts - requires auth
router.delete('/batch', authenticateToken, (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid IDs array' });
  }
  
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM posts WHERE id IN (${placeholders})`);
  stmt.run(ids, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `${this.changes} posts deleted successfully` });
  });
  stmt.finalize();
});

module.exports = router;
