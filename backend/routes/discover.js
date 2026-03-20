const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./blog.db', sqlite3.OPEN_READONLY)

// 获取完整发现页数据
router.get('/', (req, res) => {
  const queries = {
    topics: new Promise((resolve) => {
      db.all(`SELECT category as title, COUNT(*) as posts FROM posts WHERE category IS NOT NULL GROUP BY category ORDER BY posts DESC LIMIT 5`, [], (err, rows) => {
        resolve(rows?.map((r, i) => ({ id: i+1, title: r.title, views: r.posts*10, posts: r.posts, hot: i<3 })) || [])
      })
    }),
    users: new Promise((resolve) => {
      db.all(`SELECT username as name, id, (SELECT COUNT(*) FROM posts WHERE author=u.username) as cnt FROM users u ORDER BY cnt DESC LIMIT 6`, [], (err, rows) => {
        resolve(rows?.map(r => ({ id: r.id, name: r.name||'用户', avatar: null, followers: r.cnt*2 })) || [])
      })
    }),
    articles: new Promise((resolve) => {
      db.all(`SELECT id, title, author, created_at FROM posts WHERE status='published' ORDER BY created_at DESC LIMIT 3`, [], (err, rows) => {
        resolve(rows?.map(r => ({ id: r.id, title: r.title, author: r.author||'佚名', likes: Math.floor(Math.random()*100), comments: Math.floor(Math.random()*20) })) || [])
      })
    }),
    photos: new Promise((resolve) => {
      db.all(`SELECT id, title FROM posts WHERE status='published' ORDER BY created_at DESC LIMIT 9`, [], (err, rows) => {
        resolve(rows?.map(r => ({ id: r.id, title: r.title })) || [])
      })
    })
  }
  
  Promise.all(Object.values(queries)).then(([topics, users, articles, photos]) => {
    res.json({ success: true, data: { topics, users, articles, photos } })
  })
})

module.exports = router
