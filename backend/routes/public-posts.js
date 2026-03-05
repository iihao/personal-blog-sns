const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// 添加阅读数字段到 posts 表（如果不存在）
db.run(`ALTER TABLE posts ADD COLUMN view_count INTEGER DEFAULT 0`, (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.error('Error adding view_count column:', err);
  } else if (!err) {
    console.log('Added view_count column to posts table');
  }
});

// 获取文章列表（带阅读量）
router.get('/', (req, res) => {
  const { page = 1, limit = 10, category = '', tag = '' } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `SELECT * FROM posts WHERE status = 'published'`;
  let countQuery = `SELECT COUNT(*) as total FROM posts WHERE status = 'published'`;
  const params = [];
  
  if (category) {
    query += ' AND category = ?';
    countQuery += ' AND category = ?';
    params.push(category);
  }
  
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

// 获取统计信息（管理后台仪表盘用）- 必须在 /:id 之前
router.get('/stats', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM posts',
    "SELECT COUNT(*) as published FROM posts WHERE status = 'published'",
    "SELECT COUNT(*) as drafts FROM posts WHERE status = 'draft'"
  ];
  
  Promise.all([
    new Promise((resolve, reject) => db.get(queries[0], (err, row) => err ? reject(err) : resolve(row))),
    new Promise((resolve, reject) => db.get(queries[1], (err, row) => err ? reject(err) : resolve(row))),
    new Promise((resolve, reject) => db.get(queries[2], (err, row) => err ? reject(err) : resolve(row)))
  ]).then(([total, published, drafts]) => {
    res.json({
      total: total.total,
      published: published.published,
      drafts: drafts.drafts
    });
  }).catch(err => {
    console.error('Stats query error:', err);
    res.status(500).json({ error: err.message });
  });
});

// 获取所有分类 - public read
router.get('/categories', (req, res) => {
  db.all("SELECT DISTINCT category, COUNT(*) as count FROM posts WHERE category != '' AND status = 'published' GROUP BY category ORDER BY count DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ categories: rows || [] });
  });
});

// 获取所有标签 - public read
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

// 获取热门文章（按阅读量排序）
router.get('/stats/popular', (req, res) => {
  const { limit = 5 } = req.query;
  
  db.all(
    "SELECT id, title, view_count, created_at FROM posts WHERE status = 'published' ORDER BY view_count DESC LIMIT ?",
    [parseInt(limit)],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ popularPosts: rows });
    }
  );
});

// 获取单篇文章（增加阅读量）- 必须在 /stats 之后
router.get('/:id', (req, res) => {
  const postId = req.params.id;
  
  // 先获取文章
  db.get("SELECT * FROM posts WHERE id = ? AND status = 'published'", [postId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 增加阅读量
    db.run('UPDATE posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?', [postId], (err) => {
      if (err) {
        console.error('Error updating view count:', err);
      }
    });
    
    // 获取上一篇和下一篇文章
    db.get("SELECT id, title FROM posts WHERE id < ? AND status = 'published' ORDER BY id DESC LIMIT 1", [postId], (err, prev) => {
      db.get("SELECT id, title FROM posts WHERE id > ? AND status = 'published' ORDER BY id ASC LIMIT 1", [postId], (err, next) => {
        res.json({ 
          post: row,
          prevPost: prev,
          nextPost: next,
          viewCount: (row.view_count || 0) + 1
        });
      });
    });
  });
});

module.exports = router;
