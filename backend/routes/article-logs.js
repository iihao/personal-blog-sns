/**
 * 文章日志路由
 * 记录文章的浏览、点赞、修改等操作
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

/**
 * 记录文章日志（公开接口，用于浏览记录）
 * POST /api/article-logs
 * Body: { article_id, action_type, action, details }
 */
router.post('/', async (req, res) => {
  const { article_id, action_type, action, details } = req.body;
  
  if (!article_id || !action_type) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  // 获取用户信息（可选，浏览记录不需要登录）
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
    } catch (e) {
      // Token 无效，使用匿名用户
    }
  }
  
  // 获取 IP 地址
  const ip_address = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.ip || 
                     req.connection.remoteAddress;
  
  const user_agent = req.headers['user-agent'] || '';
  
  const stmt = db.prepare(`
    INSERT INTO article_logs (article_id, user_id, username, action, action_type, details, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(article_id, user_id, username, action || action_type, action_type, details || '', ip_address, user_agent, function(err) {
    if (err) {
      console.error('记录日志失败:', err);
      return res.status(500).json({ error: '记录失败' });
    }
    res.json({ success: true, log_id: this.lastID });
  });
});

/**
 * 获取文章日志列表（需要认证）
 * GET /api/article-logs/:article_id
 */
router.get('/:article_id', authenticateToken, (req, res) => {
  const { article_id } = req.params;
  const { page = 1, limit = 50, action_type } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = `
    SELECT al.*, u.avatar, u.role
    FROM article_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.article_id = ?
  `;
  
  const params = [article_id];
  
  if (action_type) {
    sql += ' AND al.action_type = ?';
    params.push(action_type);
  }
  
  sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // 获取总数
    db.get(`SELECT COUNT(*) as total FROM article_logs WHERE article_id = ?`, [article_id], (err, countRow) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        logs: rows || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countRow?.total || 0,
          pages: Math.ceil((countRow?.total || 0) / limit)
        }
      });
    });
  });
});

/**
 * 获取所有文章日志（超级管理员，需要认证）
 * GET /api/article-logs
 */
router.get('/', authenticateToken, (req, res) => {
  // 检查是否为超级管理员
  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  const { page = 1, limit = 50, article_id, action_type, user_id } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = `
    SELECT al.*, u.avatar, u.role, p.title as article_title
    FROM article_logs al
    LEFT JOIN users u ON al.user_id = u.id
    LEFT JOIN posts p ON al.article_id = p.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (article_id) {
    sql += ' AND al.article_id = ?';
    params.push(article_id);
  }
  
  if (action_type) {
    sql += ' AND al.action_type = ?';
    params.push(action_type);
  }
  
  if (user_id) {
    sql += ' AND al.user_id = ?';
    params.push(user_id);
  }
  
  sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // 获取总数
    let countSql = `SELECT COUNT(*) as total FROM article_logs WHERE 1=1`;
    const countParams = [];
    
    if (article_id) {
      countSql += ' AND article_id = ?';
      countParams.push(article_id);
    }
    
    if (action_type) {
      countSql += ' AND action_type = ?';
      countParams.push(action_type);
    }
    
    if (user_id) {
      countSql += ' AND user_id = ?';
      countParams.push(user_id);
    }
    
    db.get(countSql, countParams, (err, countRow) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        logs: rows || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countRow?.total || 0,
          pages: Math.ceil((countRow?.total || 0) / limit)
        }
      });
    });
  });
});

/**
 * 获取文章统计信息
 * GET /api/article-logs/stats/:article_id
 */
router.get('/stats/:article_id', authenticateToken, (req, res) => {
  const { article_id } = req.params;
  
  const stats = {};
  
  // 总浏览数
  db.get(`SELECT COUNT(*) as total FROM article_logs WHERE article_id = ? AND action_type = 'view'`, [article_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    stats.views = row?.total || 0;
    
    // 总点赞数
    db.get(`SELECT COUNT(*) as total FROM article_logs WHERE article_id = ? AND action_type = 'like'`, [article_id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      stats.likes = row?.total || 0;
      
      // 总修改次数
      db.get(`SELECT COUNT(*) as total FROM article_logs WHERE article_id = ? AND action_type = 'update'`, [article_id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        stats.updates = row?.total || 0;
        
        // 最近活跃时间
        db.get(`SELECT MAX(created_at) as last_activity FROM article_logs WHERE article_id = ?`, [article_id], (err, row) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          stats.last_activity = row?.last_activity || null;
          
          res.json({ stats });
        });
      });
    });
  });
});

module.exports = router;
