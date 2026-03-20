const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin, validateLogin, generateToken } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// Login - 支持简单 admin 登录和数据库用户登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }
  
  // 简单 admin 登录（用于初始访问）- 从数据库加载真实角色
  if (validateLogin(username, password)) {
    try {
      const token = await generateToken(username);
      
      // 从数据库获取用户信息
      db.get('SELECT id, username, role, permissions, email FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user) {
          return res.json({ 
            success: true,
            token,
            user: { username, role: 'admin', id: 1 }
          });
        }
        
        res.cookie('token', token, { 
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'strict'
        });
        
        res.json({ 
          success: true,
          token,
          user: { 
            id: user.id, 
            username: user.username, 
            role: user.role || 'admin',
            permissions: user.permissions ? JSON.parse(user.permissions) : [],
            email: user.email 
          }
        });
      });
    } catch (error) {
      return res.status(500).json({ error: '生成 token 失败' });
    }
    return;
  }
  
  // 数据库用户登录
  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度至少 6 位' });
  }
  
  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role || 'user' },
      process.env.JWT_SECRET || 'blog-secret-key-2024',
      { expiresIn: '7d' }
    );
    
    res.cookie('token', token, { 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict'
    });
    
    res.json({ 
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role || 'user', email: user.email }
    });
  });
});

// Register (public)
router.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  
  // 验证必填字段
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  
  // 验证用户名长度
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: '用户名长度 3-20 个字符' });
  }
  
  // 验证密码长度
  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度至少 6 位' });
  }
  
  // 验证用户名格式（只允许字母、数字、下划线）
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ error: '用户名只能包含字母、数字和下划线' });
  }
  
  // 检查用户名是否已存在
  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: '数据库错误' });
    }
    
    if (user) {
      if (user.username === username) {
        return res.status(400).json({ error: '用户名已存在' });
      }
      if (user.email === email) {
        return res.status(400).json({ error: '邮箱已被注册' });
      }
    }
    
    // 密码加密
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Hash error:', err);
        return res.status(500).json({ error: '密码加密失败' });
      }
      
      // 插入新用户
      const stmt = db.prepare(
        'INSERT INTO users (username, password_hash, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
      );
      stmt.run(username, hash, email || null, 'user', function(err) {
        if (err) {
          console.error('Insert error:', err);
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: '用户名或邮箱已存在' });
          }
          return res.status(500).json({ error: '注册失败' });
        }
        
        // 注册成功，自动生成登录 token
        const token = jwt.sign(
          { id: this.lastID, username: username, role: 'user' },
          process.env.JWT_SECRET || 'blog-secret-key-2024',
          { expiresIn: '7d' }
        );
        
        res.cookie('token', token, { 
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'strict'
        });
        
        res.json({ 
          success: true,
          message: '注册成功',
          token,
          user: { 
            id: this.lastID, 
            username, 
            email,
            role: 'user' 
          }
        });
      });
      stmt.finalize();
    });
  });
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email, avatar, bio, role, created_at FROM users WHERE id = ?', 
    [req.user.id], 
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ user });
    }
  );
});

// Update profile
router.put('/profile', authenticateToken, (req, res) => {
  const { email, avatar, bio } = req.body;
  
  const stmt = db.prepare(
    'UPDATE users SET email = ?, avatar = ?, bio = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(email || null, avatar || null, bio || null, req.user.id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Profile updated successfully' });
  });
  stmt.finalize();
});

// Change password (with current password verification)
router.put('/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password required' });
  }
  
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    bcrypt.hash(newPassword, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const stmt = db.prepare(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      );
      stmt.run(hash, req.user.id, function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Password changed successfully' });
      });
      stmt.finalize();
    });
  });
});

// Simple password change (admin panel, without current password check)
router.post('/change-password', authenticateToken, (req, res) => {
  const { newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  
  bcrypt.hash(newPassword, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const stmt = db.prepare(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    stmt.run(hash, req.user.id, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Password changed successfully' });
    });
    stmt.finalize();
  });
});

// Reset password (admin can reset any user password)
router.post('/reset-password/:userId', authenticateToken, requireAdmin, (req, res) => {
  const { newPassword } = req.body;
  const userId = req.params.userId;
  
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  
  bcrypt.hash(newPassword, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const stmt = db.prepare(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    stmt.run(hash, userId, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'Password reset successfully' });
    });
    stmt.finalize();
  });
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT id, username, role, permissions, is_active, email, created_at, last_login FROM users ORDER BY created_at DESC', [], (err, users) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users });
  });
});

// Update user (super_admin only)
router.put('/users/:userId', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  const { role, permissions, is_active, email } = req.body;
  
  // 只有超级管理员可以修改用户权限
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: '需要超级管理员权限' });
  }
  
  // 不能修改自己的角色为普通用户
  if (parseInt(userId) === req.user.id && role && role !== 'super_admin') {
    return res.status(400).json({ error: '不能修改自己的超级管理员身份' });
  }
  
  const perms = permissions ? JSON.stringify(permissions) : null;
  
  db.run(
    'UPDATE users SET role = COALESCE(?, role), permissions = COALESCE(?, permissions), is_active = COALESCE(?, is_active), email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [role, perms, is_active, email, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: '用户不存在' });
      }
      res.json({ message: '用户信息已更新' });
    }
  );
});

// Delete user (admin only)
router.delete('/users/:userId', authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.userId;
  
  // Prevent deleting yourself
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  
  // 不能删除超级管理员
  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (user && user.role === 'super_admin') {
      return res.status(403).json({ error: '不能删除超级管理员账号' });
    }
    
    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    });
  });
});

// 系统配置 API（仅 super_admin）
router.get('/config', authenticateToken, (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: '需要超级管理员权限' });
  }
  
  db.all('SELECT * FROM system_config ORDER BY config_key', [], (err, configs) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const configObj = {};
    configs.forEach(c => {
      configObj[c.config_key] = c.config_value;
    });
    
    res.json({ config: configObj });
  });
});

router.put('/config', authenticateToken, (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: '需要超级管理员权限' });
  }
  
  const { config_key, config_value } = req.body;
  
  if (!config_key || config_value === undefined) {
    return res.status(400).json({ error: '配置项和值不能为空' });
  }
  
  db.run(
    'INSERT OR REPLACE INTO system_config (config_key, config_value, updated_at, updated_by) VALUES (?, ?, CURRENT_TIMESTAMP, ?)',
    [config_key, config_value, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: '配置已更新', config_key, config_value });
    }
  );
});

// 权限列表 API
router.get('/permissions', authenticateToken, (req, res) => {
  db.all('SELECT * FROM permissions ORDER BY category, permission_name', [], (err, permissions) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ permissions });
  });
});

module.exports = router;
