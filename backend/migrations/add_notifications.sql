-- 创建消息通知表
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  from_user_id INTEGER,
  type TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (from_user_id) REFERENCES users(id)
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- comments 表添加 is_read 字段
ALTER TABLE comments ADD COLUMN is_read INTEGER DEFAULT 0;
