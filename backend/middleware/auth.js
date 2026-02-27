/**
 * 认证中间件
 * 验证用户身份和权限
 */

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// 验证登录（简单模式）
function validateLogin(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// 生成简单 token
function generateToken(username) {
  const payload = {
    username,
    role: username === ADMIN_USERNAME ? 'admin' : 'user',
    timestamp: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// 验证 token
function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    // 检查 token 是否过期（24 小时）
    if (Date.now() - payload.timestamp > 24 * 60 * 60 * 1000) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// JWT 认证中间件（用于 jwt 包）
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授权访问' });
  }
  
  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'blog-secret-key-2024', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token 无效或已过期' });
    }
    req.user = user;
    next();
  });
}

// 要求 admin 角色
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
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
    
    // 检查角色
    if (requiredRole === 'admin' && payload.role !== 'admin') {
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
  authMiddleware,
  authenticateToken,
  requireAdmin,
  optionalAuth
};
