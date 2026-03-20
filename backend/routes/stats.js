const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./blog.db', sqlite3.OPEN_READONLY)

// 获取系统统计
router.get('/overview', (req, res) => {
  const queries = {
    users: cb => db.get('SELECT COUNT(*) as count FROM users', [], cb),
    posts: cb => db.get('SELECT COUNT(*) as count FROM posts WHERE status="published"', [], cb),
    comments: cb => db.get('SELECT COUNT(*) as count FROM comments', [], cb),
    checkins: cb => db.get('SELECT COUNT(*) as count FROM checkins', [], cb)
  }
  
  const results = {}
  let completed = 0
  
  Object.entries(queries).forEach(([key, query]) => {
    query((err, row) => {
      results[key] = row?.count || 0
      completed++
      if (completed === 4) {
        res.json({ success: true, data: results })
      }
    })
  })
})

// 获取热门文章
router.get('/popular-posts', (req, res) => {
  db.all(`
    SELECT p.id, p.title, p.author, p.created_at,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments,
           (SELECT COUNT(*) FROM likes WHERE target_id = p.id AND target_type = 'post') as likes
    FROM posts p
    WHERE p.status = 'published'
    ORDER BY likes DESC, comments DESC
    LIMIT 10
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: '查询失败' })
    res.json({ success: true, data: rows || [] })
  })
})

// 获取活跃用户
router.get('/active-users', (req, res) => {
  db.all(`
    SELECT u.username, u.id,
           (SELECT COUNT(*) FROM posts WHERE author = u.username) as posts,
           (SELECT COUNT(*) FROM comments WHERE author_name = u.username) as comments
    FROM users u
    ORDER BY posts DESC, comments DESC
    LIMIT 10
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: '查询失败' })
    res.json({ success: true, data: rows || [] })
  })
})

module.exports = router
