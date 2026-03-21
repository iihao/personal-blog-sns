const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./blog.db', sqlite3.OPEN_READONLY)
const { authenticateToken } = require('../middleware/auth')

// 获取当前用户信息
router.get('/me', authenticateToken, (req, res) => {
  const userId = req.user.id
  db.get('SELECT id, username, email, avatar, bio, created_at FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: '查询失败' })
    if (!row) return res.status(404).json({ error: '用户不存在' })
    
    // 获取统计信息
    db.get('SELECT COUNT(*) as posts FROM posts WHERE author = ?', [row.username], (err, stats) => {
      res.json({
        success: true,
        data: {
          ...row,
          posts: stats?.posts || 0
        }
      })
    })
  })
})

// 获取用户公开信息
router.get('/:id', (req, res) => {
  const userId = req.params.id
  db.get('SELECT id, username, avatar, bio, created_at FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: '查询失败' })
    if (!row) return res.status(404).json({ error: '用户不存在' })
    res.json({ success: true, data: row })
  })
})

// 获取用户文章列表
router.get('/:id/posts', (req, res) => {
  const userId = req.params.id
  const { page = 1, limit = 10 } = req.query
  const offset = (page - 1) * limit
  
  db.all(`
    SELECT id, title, created_at, category
    FROM posts
    WHERE author = (SELECT username FROM users WHERE id = ?)
    AND status = 'published'
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: '查询失败' })
    res.json({ success: true, data: rows || [] })
  })
})

module.exports = router
