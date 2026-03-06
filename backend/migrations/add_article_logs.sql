-- 文章日志表
CREATE TABLE IF NOT EXISTS article_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL,
  user_id INTEGER,
  user_name TEXT,
  action TEXT NOT NULL,
  action_type TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_article_logs_article_id ON article_logs(article_id);
CREATE INDEX IF NOT EXISTS idx_article_logs_action_type ON article_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_article_logs_created_at ON article_logs(created_at);

-- 插入示例数据
INSERT INTO article_logs (article_id, user_id, user_name, action, action_type, details, ip_address) 
VALUES (1, 1, 'Admin', '查看文章', 'view', '浏览文章详情', '127.0.0.1');
