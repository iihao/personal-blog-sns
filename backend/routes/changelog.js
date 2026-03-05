const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// 初始化数据库表
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS changelog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL,
    date TEXT NOT NULL,
    changes TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// 获取所有更新日志（公开）
router.get('/', (req, res) => {
  db.all('SELECT * FROM changelog ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // 解析 changes JSON
    const changelog = rows.map(row => ({
      ...row,
      changes: JSON.parse(row.changes)
    }));
    
    res.json({ changelog });
  });
});

// 获取单条更新日志
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM changelog WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: '更新日志不存在' });
    
    row.changes = JSON.parse(row.changes);
    res.json({ changelog: row });
  });
});

// 创建更新日志（需要管理员权限）
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { version, date, changes } = req.body;
  
  if (!version || !date || !changes || !Array.isArray(changes)) {
    return res.status(400).json({ error: '参数错误：需要 version, date, changes' });
  }
  
  const stmt = db.prepare('INSERT INTO changelog (version, date, changes) VALUES (?, ?, ?)');
  stmt.run(version, date, JSON.stringify(changes), function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: '更新日志创建成功' });
  });
  stmt.finalize();
});

// 更新更新日志（需要管理员权限）
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { version, date, changes } = req.body;
  
  if (!version || !date || !changes || !Array.isArray(changes)) {
    return res.status(400).json({ error: '参数错误：需要 version, date, changes' });
  }
  
  const stmt = db.prepare('UPDATE changelog SET version = ?, date = ?, changes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(version, date, JSON.stringify(changes), req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: '更新日志不存在' });
    res.json({ message: '更新日志修改成功' });
  });
  stmt.finalize();
});

// 删除更新日志（需要管理员权限）
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const stmt = db.prepare('DELETE FROM changelog WHERE id = ?');
  stmt.run(req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: '更新日志不存在' });
    res.json({ message: '更新日志删除成功' });
  });
  stmt.finalize();
});

// 批量删除更新日志（需要管理员权限）
router.delete('/batch', authenticateToken, requireAdmin, (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid IDs array' });
  }
  
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM changelog WHERE id IN (${placeholders})`);
  stmt.run(ids, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `${this.changes} 条更新日志已删除` });
  });
  stmt.finalize();
});

module.exports = router;
