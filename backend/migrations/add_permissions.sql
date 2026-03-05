-- 添加权限相关字段到 users 表
ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '[]';
ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN last_login DATETIME;

-- 更新 admin 用户为超级管理员
UPDATE users SET 
  role = 'super_admin',
  permissions = '["all"]',
  is_active = 1
WHERE username = 'admin';

-- 将其他 admin 角色降级为普通管理员
UPDATE users SET 
  role = 'admin',
  permissions = '["write_posts","edit_posts","delete_posts","manage_comments","manage_media"]'
WHERE role = 'admin' AND username != 'admin';

-- 创建系统配置表（仅 super_admin 可访问）
CREATE TABLE IF NOT EXISTS system_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- 插入默认配置
INSERT OR IGNORE INTO system_config (config_key, config_value, description) VALUES 
  ('site_name', 'blog.sqlboy.top', '网站名称'),
  ('site_description', '黄强的技术博客', '网站描述'),
  ('site_keywords', '博客，技术，分享', 'SEO 关键词'),
  ('posts_per_page', '10', '每页文章数'),
  ('allow_register', 'true', '允许用户注册'),
  ('comment_need_audit', 'true', '评论需要审核'),
  ('max_upload_size', '5242880', '最大上传文件大小 (字节)'),
  ('allowed_file_types', 'jpg,jpeg,png,gif,webp', '允许的文件类型');

-- 创建权限定义表
CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  permission_name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT
);

-- 插入默认权限
INSERT OR IGNORE INTO permissions (permission_name, description, category) VALUES
  ('all', '超级管理员 - 所有权限', 'system'),
  ('write_posts', '撰写文章', 'content'),
  ('edit_posts', '编辑文章', 'content'),
  ('delete_posts', '删除文章', 'content'),
  ('publish_posts', '发布文章', 'content'),
  ('manage_comments', '管理评论', 'content'),
  ('manage_media', '管理媒体', 'content'),
  ('manage_users', '管理用户', 'user'),
  ('manage_config', '管理系统配置', 'system'),
  ('view_analytics', '查看统计分析', 'analytics');
