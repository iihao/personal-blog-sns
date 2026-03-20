const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./blog.db')

// 验证 Token 中间件
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: '未授权访问' })
  try {
    const jwt = require('jsonwebtoken')
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token 无效' })
  }
}

// 获取互动消息
router.get('/interactions', verifyToken, (req, res) => {
  const userId = req.user.id
  db.all(`
    SELECT n.id, n.type, u.username as from_username, n.created_at, p.title as post_title
    FROM notifications n
    LEFT JOIN users u ON n.from_user_id = u.id
    LEFT JOIN posts p ON n.target_id = p.id
    WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 20
  `, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: '查询失败' })
    res.json({ success: true, messages: rows || [] })
  })
})

// 获取评论消息
router.get('/comments', verifyToken, (req, res) => {
  const userId = req.user.id
  db.all(`
    SELECT c.id, c.author_name as username, c.content, c.created_at, p.title as post_title
    FROM comments c JOIN posts p ON c.post_id = p.id
    WHERE p.author = (SELECT username FROM users WHERE id = ?)
    ORDER BY c.created_at DESC LIMIT 20
  `, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: '查询失败' })
    res.json({ success: true, messages: rows || [] })
  })
})

// 获取点赞消息
router.get('/likes', verifyToken, (req, res) => {
  const userId = req.user.id
  db.all(`
    SELECT l.id, u.username, l.created_at, p.title as post_title
    FROM likes l JOIN users u ON l.user_id = u.id
    JOIN posts p ON l.target_id = p.id
    WHERE p.author = (SELECT username FROM users WHERE id = ?)
    ORDER BY l.created_at DESC LIMIT 20
  `, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: '查询失败' })
    res.json({ success: true, messages: rows || [] })
  })
})

// 获取系统消息
router.get('/system', verifyToken, (req, res) => {
  res.json({
    success: true,
    messages: [
      { id: 1, title: '欢迎加入', content: '欢迎加入我们的社区！', time: '2026-03-20', action: '去看看' },
      { id: 2, title: '新手任务', content: '完成新手任务获取奖励！', time: '2026-03-19', action: '去完成' }
    ]
  })
})

// 获取未读数量
router.get('/unread-count', verifyToken, (req, res) => {
  const userId = req.user.id
  db.get(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: '查询失败' })
    res.json({ success: true, data: { total: row?.count || 0 } })
  })
})

module.exports = router
