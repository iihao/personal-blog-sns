const jwt = require('jsonwebtoken');

// JWT secret from environment variable (required in production)
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  WARNING: JWT_SECRET not set in production environment!');
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const user = jwt.verify(token, JWT_SECRET || 'blog-secret-key');
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Optional auth (adds user to request if token present, but doesn't require it)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET || 'blog-secret-key');
      req.user = user;
    } catch (error) {
      // Token invalid, but continue without auth
    }
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
