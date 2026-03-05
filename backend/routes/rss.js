const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// 生成 RSS Feed
router.get('/feed.xml', (req, res) => {
  db.all(
    "SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 20",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const baseUrl = 'https://sqlboy.top';
      const buildDate = new Date().toUTCString();
      
      // 生成 RSS 内容
      let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>blog.sqlboy.top</title>
  <link>${baseUrl}</link>
  <description>一个现代化的个人博客平台</description>
  <language>zh-CN</language>
  <lastBuildDate>${buildDate}</lastBuildDate>
  <atom:link href="${baseUrl}/rss/feed.xml" rel="self" type="application/rss+xml" />
  <generator>Blog RSS Generator</generator>
`;

      rows.forEach(post => {
        const link = `${baseUrl}/post/${post.id}`;
        const pubDate = new Date(post.created_at).toUTCString();
        
        // 清理 HTML 标签生成纯文本描述
        const description = post.content
          .replace(/<[^>]*>/g, '')
          .substring(0, 500)
          .trim();
        
        rss += `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <description><![CDATA[${description}...]]></description>
    <author>${post.author || 'Admin'}</author>
    <pubDate>${pubDate}</pubDate>
    <category>${post.category || '未分类'}</category>
    ${post.tags ? post.tags.split(',').map(tag => `<tag>${tag.trim()}</tag>`).join('\n    ') : ''}
  </item>`;
      });

      rss += `
</channel>
</rss>`;

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 缓存 1 小时
      res.send(rss);
    }
  );
});

// 生成 sitemap
router.get('/sitemap.xml', (req, res) => {
  db.all(
    "SELECT id, created_at, updated_at FROM posts WHERE status = 'published' ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const baseUrl = 'https://sqlboy.top';
      const today = new Date().toISOString().split('T')[0];
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/admin/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

      rows.forEach(post => {
        const lastmod = new Date(post.updated_at || post.created_at).toISOString().split('T')[0];
        sitemap += `  <url>
    <loc>${baseUrl}/post/${post.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${lastmod}</lastmod>
  </url>
`;
      });

      sitemap += `</urlset>`;

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存 24 小时
      res.send(sitemap);
    }
  );
});

module.exports = router;
