const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// 创建点赞表（如果不存在）
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER,
    username TEXT,
    device_id TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating likes table:', err);
    } else {
      console.log('Likes table initialized');
    }
  });

  // 创建唯一索引，防止重复点赞（同一用户或设备对同一篇文章）
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique ON likes(post_id, user_id, device_id)`, (err) => {
    if (err) {
      console.error('Error creating index:', err);
    }
  });
});

// 获取文章点赞数
router.get('/post/:postId', (req, res) => {
  const postId = req.params.postId;
  
  db.get('SELECT COUNT(*) as count FROM likes WHERE post_id = ?', [postId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ count: row.count });
  });
});

// 获取文章点赞列表（公开信息）
router.get('/post/:postId/list', (req, res) => {
  const postId = req.params.postId;
  const { limit = 10 } = req.query;
  
  db.all(
    `SELECT username, created_at FROM likes 
     WHERE post_id = ? AND username IS NOT NULL 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [postId, parseInt(limit)],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ likes: rows });
    }
  );
});

// 点赞文章
router.post('/post/:postId', (req, res) => {
  const postId = req.params.postId;
  const { device_id, device_name } = req.body;
  
  // 检查文章是否存在
  db.get('SELECT id FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!post) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 获取用户 IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
               req.headers['x-real-ip'] || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress ||
               'unknown';
    
    // 检查是否已登录
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      // 尝试验证 token
      try {
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'blog-secret-key-2024');
        
        // 已登录用户点赞
        db.get(
          'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
          [postId, payload.id],
          (err, existing) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            if (existing) {
              return res.status(400).json({ error: '您已经赞过这篇文章了' });
            }
            
            // 插入点赞记录
            db.run(
              'INSERT INTO likes (post_id, user_id, username, ip_address) VALUES (?, ?, ?, ?)',
              [postId, payload.id, payload.username, ip],
              function(err) {
                if (err) {
                  if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: '您已经赞过这篇文章了' });
                  }
                  return res.status(500).json({ error: err.message });
                }
                
                // 返回点赞数
                db.get('SELECT COUNT(*) as count FROM likes WHERE post_id = ?', [postId], (err, row) => {
                  if (err) {
                    return res.status(500).json({ error: err.message });
                  }
                  res.json({ 
                    success: true, 
                    count: row.count,
                    message: '点赞成功'
                  });
                });
              }
            );
          }
        );
        return;
      } catch (e) {
        // Token 无效，继续作为未登录用户处理
      }
    }
    
    // 未登录用户点赞
    if (!device_id) {
      return res.status(400).json({ error: '设备信息缺失' });
    }
    
    const deviceId = device_id;
    const deviceName = device_name || '未知设备';
    
    db.get(
      'SELECT id FROM likes WHERE post_id = ? AND device_id = ?',
      [postId, deviceId],
      (err, existing) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (existing) {
          return res.status(400).json({ error: '您已经赞过这篇文章了' });
        }
        
        // 插入点赞记录
        db.run(
          'INSERT INTO likes (post_id, device_id, username, ip_address) VALUES (?, ?, ?, ?)',
          [postId, deviceId, deviceName, ip],
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: '您已经赞过这篇文章了' });
              }
              return res.status(500).json({ error: err.message });
            }
            
            // 返回点赞数
            db.get('SELECT COUNT(*) as count FROM likes WHERE post_id = ?', [postId], (err, row) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              res.json({ 
                success: true, 
                count: row.count,
                message: '点赞成功'
              });
            });
          }
        );
      }
    );
  });
});

// 取消点赞（需要登录）
router.delete('/post/:postId', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  
  db.run(
    'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
    [postId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: '未找到点赞记录' });
      }
      
      // 返回点赞数
      db.get('SELECT COUNT(*) as count FROM likes WHERE post_id = ?', [postId], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ 
          success: true, 
          count: row.count,
          message: '已取消点赞'
        });
      });
    }
  );
});

// 检查用户是否已点赞
router.get('/post/:postId/check', (req, res) => {
  const postId = req.params.postId;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const deviceId = req.headers['x-device-id'];
  
  let liked = false;
  
  const checkLike = (callback) => {
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'blog-secret-key-2024');
        
        db.get(
          'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
          [postId, payload.id],
          (err, row) => {
            if (!err && row) {
              callback(true);
            } else {
              callback(false);
            }
          }
        );
        return;
      } catch (e) {
        // Token 无效
      }
    }
    
    if (deviceId) {
      db.get(
        'SELECT id FROM likes WHERE post_id = ? AND device_id = ?',
        [postId, deviceId],
        (err, row) => {
          if (!err && row) {
            callback(true);
          } else {
            callback(false);
          }
        }
      );
      return;
    }
    
    callback(false);
  };
  
  checkLike((isLiked) => {
    res.json({ liked: isLiked });
  });
});

module.exports = router;
