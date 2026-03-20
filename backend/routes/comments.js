const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Shared database connection (avoid creating new connection per request)
const db = new sqlite3.Database('./blog.db');

// 递归获取回复 - 限制最多二级（depth=0 主评论，depth=1 一级回复，depth=2 二级回复）
function getReplies(parentId, depth = 0) {
  return new Promise((resolve, reject) => {
    // 限制：二级回复不能再有回复
    if (depth >= 2) {
      resolve([]);
      return;
    }
    
    db.all('SELECT * FROM comments WHERE parent_id = ? ORDER BY created_at ASC', [parentId], async (err, replies) => {
      if (err) {
        reject(err);
        return;
      }
      
      const repliesWithReplies = await Promise.all(
        replies.map(async (reply) => {
          const nestedReplies = await getReplies(reply.id, depth + 1);
          return { ...reply, replies: nestedReplies };
        })
      );
      
      resolve(repliesWithReplies);
    });
  });
}

// Get all comments (with filters and nested replies) - public read
router.get('/', optionalAuth, (req, res) => {
  const { post_id, approved, parent_id } = req.query;
  const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');
  
  let query = 'SELECT c.*, p.title as post_title FROM comments c LEFT JOIN posts p ON c.post_id = p.id WHERE 1=1';
  const params = [];
  
  if (post_id) {
    query += ' AND c.post_id = ?';
    params.push(post_id);
  }
  
  // For non-admins, only show approved comments
  if (!isAdmin) {
    if (approved === 'all') {
      // Show all comments (for logged-in users to see their own pending comments)
      // No status filter
    } else if (approved === 'pending') {
      // Show only pending (should not happen for non-admins, but handle it)
      query += ' AND c.status = ?';
      params.push('pending');
    } else {
      // Default or approved=true: show only approved comments
      query += ' AND c.status = ?';
      params.push('approved');
    }
  } else {
    // Admin 可以查看所有评论，但如果明确指定 approved=true，也只返回已审核的
    if (approved === 'true' || approved === true) {
      query += ' AND c.status = ?';
      params.push('approved');
    }
  }
  
  if (parent_id !== undefined) {
    query += ' AND c.parent_id = ?';
    params.push(parent_id);
  } else {
    // 默认只获取顶级评论
    query += ' AND (c.parent_id IS NULL OR c.parent_id = 0)';
  }
  
  query += ' ORDER BY c.created_at DESC';
  
  db.all(query, params, async (err, comments) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // 获取每个评论的回复
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await getReplies(comment.id);
        return { ...comment, replies };
      })
    );
    
    res.json({ comments: commentsWithReplies });
  });
});

// Get comments for a specific post (legacy endpoint) - public read
router.get('/post/:postId', optionalAuth, (req, res) => {
  const postId = req.params.postId;
  const isAdmin = req.user && req.user.role === 'admin';
  
  let query = 'SELECT * FROM comments WHERE post_id = ? AND (parent_id IS NULL OR parent_id = 0)';
  if (!isAdmin) {
    query += " AND status = 'approved'";
  }
  query += ' ORDER BY created_at DESC';
  
  db.all(query, [postId], async (err, comments) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await getReplies(comment.id);
        return { ...comment, replies };
      })
    );
    
    res.json({ comments: commentsWithReplies });
  });
});

// Create new comment - public (requires moderation)
router.post('/', (req, res) => {
  const { post_id, author_name, author_email, content, parent_id } = req.body;
  
  if (!post_id || !author_name || !content) {
    return res.status(400).json({ error: '缺少必填字段' });
  }
  
  // 检查回复层级限制（最多二级）
  if (parent_id) {
    const parentStmt = db.prepare('SELECT parent_id FROM comments WHERE id = ?');
    parentStmt.get(parent_id, (err, parent) => {
      if (err) {
        return res.status(500).json({ error: '数据库错误' });
      }
      if (!parent) {
        return res.status(404).json({ error: '父评论不存在' });
      }
      // 如果父评论已经是回复（有 parent_id），则不允许再回复（限制二级）
      if (parent.parent_id !== null && parent.parent_id !== 0) {
        return res.status(400).json({ error: '评论最多只能回复到二级' });
      }
      // 继续创建回复（需要审核）
      createComment(post_id, author_name, author_email, content, parent_id, res, false);
    });
    parentStmt.finalize();
  } else {
    // 创建主评论（需要审核）
    createComment(post_id, author_name, author_email, content, null, res, false);
  }
});

// 创建评论的辅助函数
// isReply: 是否为回复（一级或二级回复），回复不需要审核直接通过
function createComment(post_id, author_name, author_email, content, parent_id, res, isReply = false) {
  // 主评论需要审核，回复（一级和二级）直接通过
  const status = isReply ? 'approved' : 'pending';
  const stmt = db.prepare('INSERT INTO comments (post_id, author_name, author_email, content, parent_id, status) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(post_id, author_name, author_email || '', content, parent_id || null, status, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ 
      id: this.lastID, 
      message: isReply ? '回复成功' : '评论提交成功，等待审核',
      success: true
    });
  });
  stmt.finalize();
}

// Approve comment - requires auth
router.put('/:id', authenticateToken, (req, res) => {
  const { approved } = req.body;
  const commentId = req.params.id;
  
  const status = approved ? 'approved' : 'pending';
  const stmt = db.prepare("UPDATE comments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
  stmt.run(status, commentId, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: '评论不存在' });
    }
    res.json({ 
      message: '状态更新成功',
      success: true,
      status: status
    });
  });
  stmt.finalize();
});

// Delete comment - requires auth
router.delete('/:id', authenticateToken, (req, res) => {
  const commentId = req.params.id;
  
  // 级联删除所有回复
  const deleteReplies = (id, callback) => {
    db.all('SELECT id FROM comments WHERE parent_id = ?', [id], (err, replies) => {
      if (err) {
        callback(err);
        return;
      }
      
      if (replies.length === 0) {
        callback(null);
        return;
      }
      
      let completed = 0;
      replies.forEach((reply) => {
        deleteReplies(reply.id, (err) => {
          if (err) {
            callback(err);
            return;
          }
          db.run('DELETE FROM comments WHERE id = ?', [reply.id], (err) => {
            if (err) {
              callback(err);
              return;
            }
            completed++;
            if (completed === replies.length) {
              callback(null);
            }
          });
        });
      });
    });
  };
  
  deleteReplies(commentId, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const stmt = db.prepare('DELETE FROM comments WHERE id = ?');
    stmt.run(commentId, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: '评论不存在' });
      }
      res.json({ 
        message: '评论删除成功',
        success: true
      });
    });
    stmt.finalize();
  });
});

// Get comment statistics - public read
router.get('/stats', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM comments',
    "SELECT COUNT(*) as pending FROM comments WHERE status = 'pending'",
    "SELECT COUNT(*) as approved FROM comments WHERE status = 'approved'"
  ];
  
  Promise.all([
    new Promise((resolve, reject) => db.get(queries[0], (err, row) => err ? reject(err) : resolve(row))),
    new Promise((resolve, reject) => db.get(queries[1], (err, row) => err ? reject(err) : resolve(row))),
    new Promise((resolve, reject) => db.get(queries[2], (err, row) => err ? reject(err) : resolve(row)))
  ]).then(([total, pending, approved]) => {
    res.json({
      total: total.total,
      pending: pending.pending,
      approved: approved.approved
    });
  }).catch(err => {
    console.error('Stats query error:', err);
    res.status(500).json({ error: err.message });
  });
});

module.exports = router;
