const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// 获取博客配置 (所有 settings)
router.get('/config', (req, res) => {
  db.all('SELECT * FROM settings', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Convert to key-value object
    const config = {};
    (rows || []).forEach(row => {
      config[row.key] = { value: row.value, description: row.description };
    });
    res.json({ config });
  });
});

// 获取单个配置项
router.get('/config/:key', (req, res) => {
  db.get('SELECT * FROM settings WHERE key = ?', [req.params.key], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Config key not found' });
    }
    res.json({ config: { key: row.key, value: row.value, description: row.description } });
  });
});

// 更新博客配置
router.put('/config/:key', (req, res) => {
  const { value, description } = req.body;
  const key = req.params.key;
  
  db.run(
    'INSERT OR REPLACE INTO settings (key, value, description, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    [key, value, description || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Configuration updated successfully', key, value });
    }
  );
});

// 批量更新配置
router.put('/config', (req, res) => {
  const configs = req.body;
  
  if (!configs || typeof configs !== 'object') {
    return res.status(400).json({ error: 'Invalid config data' });
  }
  
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO settings (key, value, description, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
  );
  
  Object.entries(configs).forEach(([key, data]) => {
    const value = typeof data === 'object' ? data.value : data;
    const description = typeof data === 'object' ? data.description : null;
    stmt.run(key, value, description);
  });
  
  stmt.finalize();
  res.json({ message: 'Configuration updated successfully' });
});

module.exports = router;