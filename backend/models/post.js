const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class PostModel {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '../database/blog.db'));
    this.init();
  }

  init() {
    const createPostsTable = `
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT DEFAULT 'Admin',
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'published'
      )
    `;
    
    this.db.run(createPostsTable, (err) => {
      if (err) {
        console.error('Error creating posts table:', err);
      } else {
        console.log('Posts table ready');
      }
    });
  }

  // Get all published posts
  getAllPosts(callback) {
    const query = 'SELECT * FROM posts WHERE status = "published" ORDER BY created_at DESC';
    this.db.all(query, callback);
  }

  // Get post by ID
  getPostById(id, callback) {
    const query = 'SELECT * FROM posts WHERE id = ? AND status = "published"';
    this.db.get(query, [id], callback);
  }

  // Create new post
  createPost(postData, callback) {
    const { title, content, author, tags } = postData;
    const query = 'INSERT INTO posts (title, content, author, tags) VALUES (?, ?, ?, ?)';
    this.db.run(query, [title, content, author || 'Admin', tags || ''], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, ...postData });
      }
    });
  }

  // Update post
  updatePost(id, postData, callback) {
    const { title, content, author, tags, status } = postData;
    const query = 'UPDATE posts SET title = ?, content = ?, author = ?, tags = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    this.db.run(query, [title, content, author, tags, status, id], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id, ...postData });
      }
    });
  }

  // Delete post (soft delete by setting status)
  deletePost(id, callback) {
    const query = 'UPDATE posts SET status = "deleted", updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    this.db.run(query, [id], callback);
  }

  // Close database connection
  close() {
    this.db.close();
  }
}

module.exports = PostModel;