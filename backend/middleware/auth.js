/**
 * 认证中间件
 * 验证用户身份和权限
 */

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./blog.db');

// 验证登录（简单模式）
function validateLogin(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// 生成简单 token（从数据库加载用户信息）
function generateToken(username) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, username, role, permissions, is_active FROM users WHERE username = ?', [username], (err, user) => {
      if (err || !user) {
        reject(new Error('用户不存在'));
        return;
      }
      
      const payload = {
        id: user.id,
        username,
        role: user.role || 'user',
        permissions: user.permissions ? JSON.parse(user.permissions) : [],
        is_active: user.is_active !== 0,
        timestamp: Date.now()
      };
      
      resolve(Buffer.from(JSON.stringify(payload)).toString('base64'));
    });
  });
}

// 验证 token
function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    // 检查 token 是否过期（7 天，与前端保持一致）
    if (Date.now() - payload.timestamp > 7 * 24 * 60 * 60 * 1000) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// 检查用户是否有指定权限
function hasPermission(user, permission) {
  if (!user) return false;
  
  // 超级管理员拥有所有权限
  if (user.role === 'super_admin') return true;
  
  // 检查权限列表
  const permissions = user.permissions || [];
  return permissions.includes('all') || permissions.includes(permission);
}

// 权限检查中间件
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '未授权访问' });
    }
    
    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ error: '权限不足' });
    }
    
    next();
  };
}

// JWT 认证中间件（用于 jwt 包）
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授权访问' });
  }
  
  // 先尝试验证简单 token
  let payload = verifyToken(token);
  
  if (payload) {
    // 从数据库补充完整用户信息
    db.get('SELECT id, username, role, permissions, is_active, email, avatar FROM users WHERE username = ?', [payload.username], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: '用户不存在' });
      }
      
      if (user.is_active === 0) {
        return res.status(403).json({ error: '账号已被禁用' });
      }
      
      // 更新 last_login
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
      
      req.user = {
        ...payload,
        role: user.role,
        permissions: user.permissions ? JSON.parse(user.permissions) : [],
        email: user.email,
        avatar: user.avatar
      };
      next();
    });
    return;
  }
  
  // 如果不是简单 token，尝试 JWT
  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'blog-secret-key-2024', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token 无效或已过期' });
    }
    req.user = user;
    next();
  });
}

// 要求 admin 角色（包括 super_admin）
function requireAdmin(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(403).json({ error: '需要管理员权限' });
  }
}

// 通用认证中间件
function authMiddleware(requiredRole = 'admin') {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.token || req.query.token;
    
    if (!token && !authHeader) {
      return res.status(401).json({ error: '未授权访问' });
    }
    
    const tokenToVerify = authHeader ? authHeader.replace('Bearer ', '') : token;
    
    // 尝试验证简单 token
    let payload = verifyToken(tokenToVerify);
    
    // 如果不是简单 token，尝试 JWT
    if (!payload) {
      try {
        const jwt = require('jsonwebtoken');
        payload = jwt.verify(tokenToVerify, process.env.JWT_SECRET || 'blog-secret-key-2024');
      } catch (e) {
        return res.status(401).json({ error: 'Token 无效' });
      }
    }
    
    // 检查角色（super_admin 和 admin 都可以）
    if (requiredRole === 'admin' && payload.role !== 'admin' && payload.role !== 'super_admin') {
      return res.status(403).json({ error: '权限不足' });
    }
    
    req.user = payload;
    next();
  };
}

// 可选认证（不强制要求登录）
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = req.cookies?.token || (authHeader && authHeader.split(' ')[1]);
  
  if (token) {
    try {
      // 尝试验证简单 token
      let payload = verifyToken(token);
      
      // 如果不是简单 token，尝试 JWT
      if (!payload) {
        try {
          const jwt = require('jsonwebtoken');
          payload = jwt.verify(token, process.env.JWT_SECRET || 'blog-secret-key-2024');
        } catch (e) {
          // Token 无效，继续但不附加用户信息
        }
      }
      
      if (payload) {
        req.user = payload;
      }
    } catch (e) {
      // Token 验证失败，继续但不附加用户信息
    }
  }
  
  next();
}

module.exports = {
  validateLogin,
  generateToken,
  verifyToken,
  hasPermission,
  requirePermission,
  authMiddleware,
  authenticateToken,
  requireAdmin,
  optionalAuth
};
