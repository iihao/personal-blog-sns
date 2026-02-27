const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// Get all posts (admin)
router.get('/', (req, res) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM posts';
  let countQuery = 'SELECT COUNT(*) as total FROM posts';
  const params = [];
  
  // Add search condition
  if (search) {
    query += ' WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?';
    countQuery += ' WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }
  
  // Add status filter
  if (status !== 'all') {
    const statusCondition = status === 'published' ? 'published = 1' : 'published = 0';
    if (search) {
      query += ` AND ${statusCondition}`;
      countQuery += ` AND ${statusCondition}`;
    } else {
      query += ` WHERE ${statusCondition}`;
      countQuery += ` WHERE ${statusCondition}`;
    }
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  // Get total count
  db.get(countQuery, params.slice(0, -2), (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Get posts
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

// Get post statistics (must be before /:id route)
router.get('/stats', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM posts', (err, totalResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT COUNT(*) as published FROM posts WHERE published = 1', (err, publishedResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      db.get('SELECT COUNT(*) as drafts FROM posts WHERE published = 0', (err, draftResult) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.json({
          total: totalResult.total,
          published: publishedResult.published,
          drafts: draftResult.drafts
        });
      });
    });
  });
});

// Get post by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post: row });
  });
});

// Create new post
router.post('/', (req, res) => {
  const { title, content, author, tags, category, published } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  const stmt = db.prepare('INSERT INTO posts (title, content, author, tags, category, published) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(
    title, 
    content, 
    author || 'Admin', 
    tags || '', 
    category || '', 
    published !== undefined ? published : 0,
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Post created successfully' });
    }
  );
  stmt.finalize();
});

// Update post
router.put('/:id', (req, res) => {
  const { title, content, author, tags, category, published } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  const stmt = db.prepare('UPDATE posts SET title = ?, content = ?, author = ?, tags = ?, category = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(
    title, 
    content, 
    author || 'Admin', 
    tags || '', 
    category || '', 
    published !== undefined ? published : 0,
    req.params.id,
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json({ message: 'Post updated successfully' });
    }
  );
  stmt.finalize();
});

// Delete post
router.delete('/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
  stmt.run(req.params.id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  });
  stmt.finalize();
});

// Batch delete posts
router.delete('/batch', (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid IDs array' });
  }
  
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM posts WHERE id IN (${placeholders})`);
  stmt.run(ids, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: `${this.changes} posts deleted successfully` });
  });
  stmt.finalize();
});

module.exports = router;