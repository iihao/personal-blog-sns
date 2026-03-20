const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// 获取所有配置
router.get('/config', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    db.all('SELECT * FROM settings ORDER BY key', (err, settings) => {
      if (err) {
        return res.status(500).json({ error: '数据库错误' });
      }
      
      const config = {};
      settings.forEach(s => {
        config[s.key] = { value: s.value, description: s.description };
      });
      
      res.json({ success: true, data: config });
    });
  });
});

// 更新配置
router.put('/config', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const configs = req.body;
  
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    const updates = Object.entries(configs).map(([key, value]) => {
      return new Promise((resolve, reject) => {
        db.run(`UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?`, 
          [value, key], function(err) {
            if (err) reject(err);
            else resolve();
          });
      });
    });
    
    Promise.all(updates)
      .then(() => {
        res.json({ success: true, message: '配置更新成功' });
      })
      .catch(err => {
        res.status(500).json({ error: '更新配置失败' });
      });
  });
});

// 获取钱包配置
router.get('/wallet', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    db.all('SELECT * FROM wallet_config ORDER BY key', (err, configs) => {
      if (err) {
        return res.status(500).json({ error: '数据库错误' });
      }
      
      const config = {};
      configs.forEach(c => {
        config[c.key] = { value: c.value, description: c.description };
      });
      
      res.json({ success: true, data: config });
    });
  });
});

// 更新钱包配置
router.put('/wallet', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const configs = req.body;
  
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    const updates = Object.entries(configs).map(([key, value]) => {
      return new Promise((resolve, reject) => {
        db.run(`UPDATE wallet_config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?`, 
          [value, key], function(err) {
            if (err) reject(err);
            else resolve();
          });
      });
    });
    
    Promise.all(updates)
      .then(() => {
        res.json({ success: true, message: '配置更新成功' });
      })
      .catch(err => {
        res.status(500).json({ error: '更新配置失败' });
      });
  });
});

// 获取用户列表
router.get('/users', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    db.all(`SELECT id, username, email, role, created_at FROM users 
            ORDER BY created_at DESC LIMIT ? OFFSET ?`, 
            [limit, (page - 1) * limit], 
            (err, users) => {
              if (err) {
                return res.status(500).json({ error: '数据库错误' });
              }
              
              db.get('SELECT COUNT(*) as total FROM users', (err, countRow) => {
                res.json({
                  success: true,
                  data: { users, total: countRow?.total || 0, page, limit }
                });
              });
            });
  });
});

// 更新用户角色
router.put('/users/:id/role', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.params.id;
  const { role } = req.body;
  
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    db.run(`UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, 
      [role, userId], function(err) {
        if (err) {
          return res.status(500).json({ error: '更新失败' });
        }
        res.json({ success: true, message: '角色更新成功' });
      });
  });
});

// 删除用户
router.delete('/users/:id', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.params.id;
  
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: '不能删除自己' });
    }
    
    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
      if (err) {
        return res.status(500).json({ error: '删除失败' });
      }
      res.json({ success: true, message: '用户已删除' });
    });
  });
});

// 获取签到统计
router.get('/checkin/stats', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    db.get(`SELECT 
              COUNT(DISTINCT user_id) as totalUsers,
              COUNT(*) as totalCheckins,
              AVG(streak) as avgStreak
            FROM checkins`, 
            (err, stats) => {
              if (err) {
                return res.status(500).json({ error: '数据库错误' });
              }
              
              res.json({ success: true, data: stats || {} });
            });
  });
});

// 获取钱包统计
router.get('/wallet/stats', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    db.get(`SELECT 
              COUNT(DISTINCT user_id) as totalUsers,
              SUM(balance) as totalBalance,
              SUM(points) as totalPoints
            FROM wallets`, 
            (err, stats) => {
              if (err) {
                return res.status(500).json({ error: '数据库错误' });
              }
              
              res.json({ success: true, data: stats || {} });
            });
  });
});

module.exports = router;
