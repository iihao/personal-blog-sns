const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();

// Get all comments (with filters)
router.get('/', (req, res) => {
  const db = new sqlite3.Database('./blog.db');
  const { post_id, approved } = req.query;
  
  let query = 'SELECT c.*, p.title as post_title FROM comments c LEFT JOIN posts p ON c.post_id = p.id WHERE 1=1';
  const params = [];
  
  // Filter by post_id
  if (post_id) {
    query += ' AND c.post_id = ?';
    params.push(post_id);
  }
  
  // Filter by approved status (support both 'approved' status field and boolean approved param)
  if (approved !== undefined) {
    if (approved === 'true' || approved === '1') {
      query += " AND (c.status = 'approved' OR c.status = 'pending')";
    } else if (approved === 'false' || approved === '0') {
      query += " AND c.status = 'pending'";
    }
  }
  
  query += ' ORDER BY c.created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    db.close();
    res.json({ comments: rows || [] });
  });
});

// Get comments for a specific post (legacy endpoint)
router.get('/post/:postId', (req, res) => {
  const db = new sqlite3.Database('./blog.db');
  const postId = req.params.postId;
  
  db.all("SELECT * FROM comments WHERE post_id = ? AND status = 'approved' ORDER BY created_at DESC", [postId], (err, rows) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    db.close();
    res.json({ comments: rows || [] });
  });
});

// Create new comment
router.post('/', (req, res) => {
  const db = new sqlite3.Database('./blog.db');
  const { post_id, author_name, author_email, content } = req.body;
  
  if (!post_id || !author_name || !content) {
    db.close();
    return res.status(400).json({ error: '缺少必填字段' });
  }
  
  const stmt = db.prepare('INSERT INTO comments (post_id, author_name, author_email, content, status) VALUES (?, ?, ?, ?, ?)');
  stmt.run(post_id, author_name, author_email || '', content, 'pending', function(err) {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    db.close();
    res.json({ 
      id: this.lastID, 
      message: '评论提交成功，等待审核',
      success: true
    });
  });
  stmt.finalize();
});

// Approve comment
router.put('/:id', (req, res) => {
  const db = new sqlite3.Database('./blog.db');
  const { approved } = req.body;
  const commentId = req.params.id;
  
  const status = approved ? 'approved' : 'pending';
  const stmt = db.prepare("UPDATE comments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
  stmt.run(status, commentId, function(err) {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      db.close();
      return res.status(404).json({ error: '评论不存在' });
    }
    db.close();
    res.json({ 
      message: '状态更新成功',
      success: true,
      status: status
    });
  });
  stmt.finalize();
});

// Delete comment
router.delete('/:id', (req, res) => {
  const db = new sqlite3.Database('./blog.db');
  const commentId = req.params.id;
  
  const stmt = db.prepare('DELETE FROM comments WHERE id = ?');
  stmt.run(commentId, function(err) {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      db.close();
      return res.status(404).json({ error: '评论不存在' });
    }
    db.close();
    res.json({ 
      message: '评论删除成功',
      success: true
    });
  });
  stmt.finalize();
});

// Update comment status (legacy endpoint)
router.patch('/:id/status', (req, res) => {
  const db = new sqlite3.Database('./blog.db');
  const { approved } = req.body;
  const commentId = req.params.id;
  
  const status = approved ? 'approved' : 'pending';
  const stmt = db.prepare("UPDATE comments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
  stmt.run(status, commentId, function(err) {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      db.close();
      return res.status(404).json({ error: '评论不存在' });
    }
    db.close();
    res.json({ 
      message: '状态更新成功',
      success: true,
      status: status
    });
  });
  stmt.finalize();
});

module.exports = router;
