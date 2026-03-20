const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./blog.db', sqlite3.OPEN_READONLY)

// 搜索文章
router.get('/posts', (req, res) => {
  const { q, page = 1, limit = 20 } = req.query
  const offset = (page - 1) * limit
  
  if (!q) {
    return res.json({ success: false, error: '请输入搜索关键词' })
  }
  
  const sql = `
    SELECT id, title, content, author, created_at, category
    FROM posts 
    WHERE status = 'published' 
    AND (title LIKE ? OR content LIKE ? OR category LIKE ?)
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `
  
  const keyword = `%${q}%`
  db.all(sql, [keyword, keyword, keyword, limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: '搜索失败' })
    
    db.get('SELECT COUNT(*) as total FROM posts WHERE status="published" AND (title LIKE ? OR content LIKE ?)', 
      [keyword, keyword], (err, count) => {
        res.json({
          success: true,
          data: {
            posts: rows,
            total: count?.total || 0,
            page: parseInt(page),
            limit: parseInt(limit)
          }
        })
      })
  })
})

// 热门搜索
router.get('/hot', (req, res) => {
  const sql = `
    SELECT category as keyword, COUNT(*) as count
    FROM posts
    WHERE status = 'published' AND category IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
    LIMIT 10
  `
  
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: '查询失败' })
    res.json({ success: true, data: rows || [] })
  })
})

module.exports = router
