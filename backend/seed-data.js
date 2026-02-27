const db = require('./models/post');

// 测试文章数据
const testPosts = [
  {
    title: '欢迎来到我的博客',
    content: '<p>这是我的第一篇博客文章！</p><p>在这个博客中，我将分享技术心得、生活感悟和各种有趣的内容。</p><p>感谢你的访问！</p>',
    author: '黄强',
    tags: '["欢迎", "博客", "介绍"]'
  },
  {
    title: 'Vue3 + Tailwind CSS 开发体验',
    content: '<p>最近在使用 Vue3 和 Tailwind CSS 开发前端项目，体验非常棒！</p><h3>Vue3 的优势</h3><ul><li>Composition API 让代码组织更清晰</li><li>性能提升显著</li><li>TypeScript 支持完善</li></ul><h3>Tailwind CSS 的魅力</h3><ul><li>原子化 CSS 类名</li><li>响应式设计简单</li><li>自定义主题灵活</li></ul><p>两者的结合让开发效率大幅提升！</p>',
    author: '黄强',
    tags: '["Vue3", "Tailwind CSS", "前端开发"]'
  },
  {
    title: 'Nginx 配置最佳实践',
    content: '<p>Nginx 是一个高性能的 Web 服务器和反向代理服务器。</p><h3>安全配置</h3><ul><li>启用 HTTPS</li><li>设置安全头</li><li>限制请求大小</li></ul><h3>性能优化</h3><ul><li>启用 gzip 压缩</li><li>配置缓存</li><li>负载均衡</li></ul><p>正确的 Nginx 配置可以显著提升网站性能和安全性。</p>',
    author: '黄强',
    tags: '["Nginx", "服务器", "性能优化", "安全"]'
  }
];

async function seedData() {
  try {
    // 清空现有数据
    await db.run('DELETE FROM posts');
    
    // 插入测试数据
    for (const post of testPosts) {
      const result = await db.run(
        'INSERT INTO posts (title, content, author, tags, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))',
        [post.title, post.content, post.author, post.tags]
      );
      console.log(`Inserted post ID: ${result.lastID}`);
    }
    
    console.log('Test data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await db.close();
  }
}

seedData();