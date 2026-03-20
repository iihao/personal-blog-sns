const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// 初始化扩展设置项
db.serialize(() => {
  const settings = [
    // 网站基本信息
    { key: 'site_title', value: '我的博客', description: '网站标题' },
    { key: 'site_description', value: '一个现代化的个人博客平台', description: '网站描述' },
    { key: 'site_keywords', value: '博客，技术，分享', description: '网站关键词' },
    { key: 'site_logo', value: '', description: '网站 Logo URL' },
    { key: 'site_favicon', value: '', description: '网站 Favicon URL' },
    
    // 个人信息
    { key: 'author_name', value: 'Admin', description: '作者名称' },
    { key: 'author_bio', value: '', description: '作者简介' },
    { key: 'author_avatar', value: '', description: '作者头像 URL' },
    
    // 联系方式
    { key: 'contact_email', value: '', description: '联系邮箱' },
    { key: 'contact_wechat', value: '', description: '微信二维码 URL' },
    { key: 'contact_qq', value: '', description: 'QQ 号' },
    { key: 'contact_telegram', value: '', description: 'Telegram 用户名' },
    { key: 'contact_twitter', value: '', description: 'Twitter 用户名' },
    
    // 社交链接
    { key: 'social_github', value: '', description: 'GitHub 地址' },
    { key: 'social_weibo', value: '', description: '微博地址' },
    { key: 'social_zhihu', value: '', description: '知乎地址' },
    { key: 'social_juejin', value: '', description: '掘金地址' },
    { key: 'social_csdn', value: '', description: 'CSDN 地址' },
    
    // 备案信息
    { key: 'icp_license', value: '', description: 'ICP 备案号' },
    { key: 'icp_license_url', value: 'https://beian.miit.gov.cn/', description: 'ICP 备案链接' },
    { key: 'gongan_license', value: '', description: '公安备案号' },
    { key: 'gongan_license_url', value: '', description: '公安备案链接' },
    
    // 统计代码
    { key: 'analytics_code', value: '', description: '统计代码（如 Google Analytics）' },
    { key: 'analytics_enabled', value: '0', description: '是否启用统计' },
    
    // Hero Section 设置
    { key: 'hero_enabled', value: '1', description: '是否显示 Hero 区域' },
    { key: 'hero_background', value: '', description: 'Hero 背景图片 URL' },
    { key: 'hero_height', value: '400', description: 'Hero 区域高度（px）' },
    { key: 'hero_title', value: '', description: 'Hero 标题（为空则使用网站标题' },
    { key: 'hero_description', value: '', description: 'Hero 描述（为空则使用网站描述' },
    
    // 其他设置
    { key: 'posts_per_page', value: '10', description: '每页文章数' },
    { key: 'allow_comments', value: '1', description: '是否允许评论' },
    { key: 'comment_audit', value: '1', description: '评论是否需要审核' }
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO settings (key, value, description) VALUES (?, ?, ?)');
  settings.forEach(setting => {
    stmt.run(setting.key, setting.value, setting.description);
  });
  stmt.finalize();
  
  console.log('Settings initialized');
});

// 获取所有设置（管理后台）
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM settings ORDER BY key', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const settings = {};
    (rows || []).forEach(row => {
      settings[row.key] = {
        value: row.value,
        description: row.description
      };
    });
    
    res.json({ settings });
  });
});

// 获取公开设置
router.get('/public', (req, res) => {
  db.all("SELECT key, value FROM settings WHERE key NOT LIKE '%analytics%' AND key NOT LIKE '%email%'", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const settings = {};
    (rows || []).forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json({ settings });
  });
});

// 批量更新设置
router.put('/batch', authenticateToken, requireAdmin, (req, res) => {
  const updates = req.body;
  
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: '无效的更新数据' });
  }
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO settings (key, value, description, updated_at) 
    VALUES (?, ?, CURRENT_TIMESTAMP, (SELECT description FROM settings WHERE key = ?))
  `);
  
  const results = [];
  let errors = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    stmt.run(key, value, key, function(err) {
      if (err) {
        errors.push({ key, error: err.message });
      } else {
        results.push(key);
      }
    });
  });
  
  stmt.finalize();
  
  // 等待所有更新完成
  setTimeout(() => {
    if (errors.length > 0) {
      res.status(500).json({ 
        error: '部分设置更新失败',
        success: results,
        failed: errors
      });
    } else {
      res.json({ 
        success: true, 
        message: '设置已更新',
        updated: results
      });
    }
  }, 100);
});

// 更新单个设置
router.put('/:key', authenticateToken, requireAdmin, (req, res) => {
  const key = req.params.key;
  const { value, description } = req.body;
  
  if (value === undefined) {
    return res.status(400).json({ error: '设置值不能为空' });
  }
  
  db.run(`
    INSERT OR REPLACE INTO settings (key, value, description, updated_at) 
    VALUES (?, ?, COALESCE(?, (SELECT description FROM settings WHERE key = ?)), CURRENT_TIMESTAMP)
  `, [key, value, description, key], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({ 
      success: true, 
      message: '设置已更新',
      key,
      value
    });
  });
});

// 获取设置分类
router.get('/categories/list', authenticateToken, requireAdmin, (req, res) => {
  const categories = [
    {
      id: 'basic',
      name: '基本信息',
      icon: 'fas fa-info-circle',
      settings: ['site_title', 'site_description', 'site_keywords', 'site_logo', 'site_favicon']
    },
    {
      id: 'author',
      name: '作者信息',
      icon: 'fas fa-user',
      settings: ['author_name', 'author_bio', 'author_avatar']
    },
    {
      id: 'contact',
      name: '联系方式',
      icon: 'fas fa-envelope',
      settings: ['contact_email', 'contact_wechat', 'contact_qq', 'contact_telegram', 'contact_twitter']
    },
    {
      id: 'social',
      name: '社交链接',
      icon: 'fas fa-share-alt',
      settings: ['social_github', 'social_weibo', 'social_zhihu', 'social_juejin', 'social_csdn']
    },
    {
      id: 'license',
      name: '备案信息',
      icon: 'fas fa-certificate',
      settings: ['icp_license', 'icp_license_url', 'gongan_license', 'gongan_license_url']
    },
    {
      id: 'analytics',
      name: '统计设置',
      icon: 'fas fa-chart-line',
      settings: ['analytics_code', 'analytics_enabled']
    },
    {
      id: 'hero',
      name: 'Hero 设置',
      icon: 'fas fa-image',
      settings: ['hero_enabled', 'hero_background', 'hero_height', 'hero_title', 'hero_description']
    },
    {
      id: 'advanced',
      name: '高级设置',
      icon: 'fas fa-cogs',
      settings: ['posts_per_page', 'allow_comments', 'comment_audit']
    }
  ];
  
  res.json({ categories });
});

module.exports = router;
