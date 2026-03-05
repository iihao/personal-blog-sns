const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// 创建 projects 表
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT,
    github_url TEXT,
    demo_url TEXT,
    tech_stack TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'completed',
    sort_order INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating projects table:', err);
    } else {
      console.log('Projects table initialized');
    }
  });
});

// ===== 公开 API =====

// 获取项目列表（公开）
router.get('/', (req, res) => {
  const { status = 'completed', featured } = req.query;
  
  let query = `SELECT * FROM projects WHERE 1=1`;
  const params = [];
  
  if (featured === 'true') {
    query += ` AND is_featured = 1`;
  } else if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY sort_order ASC, created_at DESC`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ projects: rows || [] });
  });
});

// 获取单个项目（公开）
router.get('/:id', (req, res) => {
  const projectId = req.params.id;
  
  db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: '项目不存在' });
    }
    res.json({ project: row });
  });
});

// ===== 管理后台 API（需要认证）=====

// 获取所有项目（管理后台）
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ projects: rows || [] });
  });
});

// 创建项目
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const {
    name,
    description,
    url,
    github_url,
    demo_url,
    tech_stack,
    image_url,
    status = 'completed',
    sort_order = 0,
    is_featured = 0
  } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: '项目名称不能为空' });
  }
  
  const stmt = db.prepare(`
    INSERT INTO projects (
      name, description, url, github_url, demo_url, 
      tech_stack, image_url, status, sort_order, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    name,
    description || null,
    url || null,
    github_url || null,
    demo_url || null,
    tech_stack || null,
    image_url || null,
    status,
    sort_order,
    is_featured
  );
  
  stmt.finalize(function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM projects WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        success: true, 
        project: row,
        message: '项目创建成功'
      });
    });
  });
});

// 更新项目
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const projectId = req.params.id;
  const {
    name,
    description,
    url,
    github_url,
    demo_url,
    tech_stack,
    image_url,
    status,
    sort_order,
    is_featured
  } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: '项目名称不能为空' });
  }
  
  db.run(`
    UPDATE projects SET
      name = ?,
      description = ?,
      url = ?,
      github_url = ?,
      demo_url = ?,
      tech_stack = ?,
      image_url = ?,
      status = ?,
      sort_order = ?,
      is_featured = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    name,
    description || null,
    url || null,
    github_url || null,
    demo_url || null,
    tech_stack || null,
    image_url || null,
    status || 'completed',
    sort_order || 0,
    is_featured || 0,
    projectId
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        success: true, 
        project: row,
        message: '项目已更新'
      });
    });
  });
});

// 删除项目
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const projectId = req.params.id;
  
  db.run('DELETE FROM projects WHERE id = ?', [projectId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    res.json({ 
      success: true, 
      message: '项目已删除'
    });
  });
});

// 批量删除项目
router.post('/batch', authenticateToken, requireAdmin, (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '请选择要删除的项目' });
  }
  
  const placeholders = ids.map(() => '?').join(',');
  db.run(`DELETE FROM projects WHERE id IN (${placeholders})`, ids, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({ 
      success: true, 
      message: `已删除 ${this.changes} 个项目`
    });
  });
});

// 获取项目统计
router.get('/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM projects',
    "SELECT COUNT(*) as completed FROM projects WHERE status = 'completed'",
    "SELECT COUNT(*) as in_progress FROM projects WHERE status = 'in_progress'",
    "SELECT COUNT(*) as featured FROM projects WHERE is_featured = 1"
  ];
  
  Promise.all([
    new Promise((resolve, reject) => db.get(queries[0], (err, row) => err ? reject(err) : resolve(row))),
    new Promise((resolve, reject) => db.get(queries[1], (err, row) => err ? reject(err) : resolve(row))),
    new Promise((resolve, reject) => db.get(queries[2], (err, row) => err ? reject(err) : resolve(row))),
    new Promise((resolve, reject) => db.get(queries[3], (err, row) => err ? reject(err) : resolve(row)))
  ]).then(([total, completed, inProgress, featured]) => {
    res.json({
      total: total.total,
      completed: completed.completed,
      in_progress: in_progress.in_progress,
      featured: featured.featured
    });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

module.exports = router;
