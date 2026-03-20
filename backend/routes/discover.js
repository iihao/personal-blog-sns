const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./blog.db', sqlite3.OPEN_READONLY)

// 获取热门话题
router.get('/topics', (req, res) => {
  const sql = `
    SELECT 
      category as title,
      COUNT(*) as posts,
      (SELECT COUNT(*) FROM posts WHERE category = p.category) * 100 as views
    FROM posts p
    WHERE category IS NOT NULL AND category != ''
    GROUP BY category
    ORDER BY posts DESC
    LIMIT 10
  `
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '查询失败' })
    }
    
    const topics = rows.map((row, index) => ({
      id: index + 1,
      title: row.title,
      views: Math.floor(row.views / 100),
      posts: row.posts,
      hot: index < 3
    }))
    
    res.json({ success: true, topics })
  })
})

// 获取推荐用户
router.get('/recommended-users', (req, res) => {
  const sql = `
    SELECT 
      username as name,
      id,
      (SELECT COUNT(*) FROM posts WHERE author = u.username) as posts_count,
      (SELECT COUNT(*) FROM comments WHERE author_name = u.username) as comments_count
    FROM users u
    ORDER BY posts_count DESC, comments_count DESC
    LIMIT 6
  `
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '查询失败' })
    }
    
    const users = rows.map(row => ({
      id: row.id,
      name: row.name || '匿名用户',
      avatar: null,
      followers: Math.floor((row.posts_count + row.comments_count) * 1.5)
    }))
    
    res.json({ success: true, users })
  })
})

// 获取精选文章
router.get('/featured-articles', (req, res) => {
  const limit = parseInt(req.query.limit) || 3
  
  const sql = `
    SELECT 
      p.id,
      p.title,
      p.author,
      p.created_at,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments,
      (SELECT COUNT(*) FROM likes WHERE target_id = p.id AND target_type = 'post') as likes
    FROM posts p
    WHERE p.status = 'published'
    ORDER BY p.created_at DESC
    LIMIT ?
  `
  
  db.all(sql, [limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '查询失败' })
    }
    
    const articles = rows.map(row => ({
      id: row.id,
      title: row.title,
      author: row.author || '佚名',
      created_at: row.created_at,
      likes: row.likes || 0,
      comments: row.comments || 0
    }))
    
    res.json({ success: true, articles })
  })
})

// 获取精彩图片（从文章中提取）
router.get('/photos', (req, res) => {
  const limit = parseInt(req.query.limit) || 9
  
  const sql = `
    SELECT 
      id,
      title,
      content,
      created_at
    FROM posts
    WHERE status = 'published' AND content LIKE '%<img%'
    ORDER BY created_at DESC
    LIMIT ?
  `
  
  db.all(sql, [limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '查询失败' })
    }
    
    const photos = rows.map(row => ({
      id: row.id,
      title: row.title,
      url: `/api/uploads/posts/${row.id}/cover.jpg`
    }))
    
    res.json({ success: true, photos })
  })
})

// 获取活动公告
router.get('/announcements', (req, res) => {
  const sql = `
    SELECT 
      id,
      title as content,
      created_at,
      '去看看' as action
    FROM posts
    WHERE status = 'published' AND category = '公告'
    ORDER BY created_at DESC
    LIMIT 5
  `
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '查询失败' })
    }
    
    const announcements = rows.map(row => ({
      id: row.id,
      title: '🎉 新用户福利',
      content: row.content || '注册即送 100 积分，签到再领更多好礼！',
      time: row.created_at,
      action: row.action
    }))
    
    res.json({ success: true, announcements })
  })
})

// 获取完整的发现页面数据
router.get('/', (req, res) => {
  // 并行查询所有数据
  const queries = {
    topics: new Promise((resolve, reject) => {
      db.all(`
        SELECT category as title, COUNT(*) as posts
        FROM posts WHERE category IS NOT NULL AND category != ''
        GROUP BY category ORDER BY posts DESC LIMIT 5
      `, [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows.map((row, i) => ({
          id: i + 1,
          title: row.title,
          views: Math.floor(row.posts * 25),
          posts: row.posts,
          hot: i < 3
        })))
      })
    }),
    
    users: new Promise((resolve, reject) => {
      db.all(`
        SELECT username as name, id,
          (SELECT COUNT(*) FROM posts WHERE author = u.username) as posts_count
        FROM users u ORDER BY posts_count DESC LIMIT 6
      `, [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows.map(row => ({
          id: row.id,
          name: row.name || '匿名用户',
          avatar: null,
          followers: Math.floor(row.posts_count * 2)
        })))
      })
    }),
    
    articles: new Promise((resolve, reject) => {
      db.all(`
        SELECT p.id, p.title, p.author,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments,
          (SELECT COUNT(*) FROM likes WHERE target_id = p.id AND target_type = 'post') as likes
        FROM posts p WHERE p.status = 'published'
        ORDER BY p.created_at DESC LIMIT 3
      `, [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows.map(row => ({
          id: row.id,
          title: row.title,
          author: row.author || '佚名',
          likes: row.likes || 0,
          comments: row.comments || 0
        })))
      })
    }),
    
    photos: new Promise((resolve, reject) => {
      db.all(`
        SELECT id, title FROM posts
        WHERE status = 'published' ORDER BY created_at DESC LIMIT 9
      `, [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows.map(row => ({ id: row.id, title: row.title })))
      })
    })
  }
  
  Promise.all(Object.values(queries))
    .then(([topics, users, articles, photos]) => {
      res.json({
        success: true,
        data: { topics, users, articles, photos }
      })
    })
    .catch(err => {
      res.status(500).json({ error: '查询失败', message: err.message })
    })
})

module.exports = router
