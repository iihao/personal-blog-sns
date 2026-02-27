const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// 获取博客配置
router.get('/config', (req, res) => {
  db.get('SELECT * FROM blog_config LIMIT 1', (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ config: row || {} });
  });
});

// 更新博客配置
router.put('/config', (req, res) => {
  const { title, description, author_name } = req.body;
  
  db.run(
    'UPDATE blog_config SET title = ?, description = ?, author_name = ? WHERE id = 1',
    [title, description, author_name],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Configuration updated successfully' });
    }
  );
});

module.exports = router;