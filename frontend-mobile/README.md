# 博客移动端前端 📱

基于 Vue3 + Vite + TailwindCSS 的移动端博客前端。

## 技术栈

- **框架**: Vue 3.5.29
- **构建工具**: Vite 5.4.8
- **样式**: TailwindCSS 3.4.13
- **状态管理**: Pinia 2.3.1
- **路由**: Vue Router 4.6.4
- **HTTP 客户端**: Axios 1.7.7
- **图标**: Heroicons Vue

## 移动端优化特性

- ✅ 响应式设计（针对手机屏幕优化）
- ✅ 触摸友好交互（touch-feedback 效果）
- ✅ 安全区域适配（iPhone 刘海屏）
- ✅ 底部导航栏（类似原生 App）
- ✅ PWA 就绪（可添加到主屏幕）
- ✅ 轻量化构建（~150KB gzip 后）
- ✅ 快速加载（首屏优化）

## 开发

```bash
cd /root/personal-blog-sns/frontend-mobile

# 安装依赖
npm install

# 开发模式（端口 3002）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 部署

生产构建输出到 `dist/` 目录，由 Nginx 托管。

### Nginx 配置

- **域名**: `m.sqlboy.top`
- **根目录**: `/root/personal-blog-sns/frontend-mobile/dist`
- **配置文件**: `/etc/nginx/conf.d/mobile.conf`

### 重新部署

```bash
cd /root/personal-blog-sns/frontend-mobile
npm run build
# Nginx 自动生效
```

## 目录结构

```
frontend-mobile/
├── dist/              # 生产构建输出
├── src/
│   ├── assets/        # 静态资源
│   │   └── main.css   # 全局样式
│   ├── components/    # 可复用组件
│   ├── composables/   # 组合式函数
│   ├── router/        # 路由配置
│   ├── store/         # Pinia 状态
│   ├── utils/         # 工具函数
│   │   └── api.js     # API 客户端
│   ├── views/         # 页面视图
│   │   ├── HomeView.vue   # 首页（文章列表）
│   │   └── PostView.vue   # 文章详情
│   ├── App.vue        # 根组件
│   └── main.js        # 入口文件
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## API 接口

复用后端 API（端口 3000）：

- `GET /api/posts` - 获取文章列表
- `GET /api/posts/:id` - 获取文章详情
- `GET /api/projects` - 获取项目列表

## 访问地址

- **生产环境**: https://m.sqlboy.top
- **开发环境**: http://localhost:3002

## 与桌面端区别

| 特性 | 桌面端 | 移动端 |
|------|--------|--------|
| 域名 | sqlboy.top | m.sqlboy.top |
| 端口 | Nginx 443 | Nginx 443 |
| 导航 | 顶部导航 | 底部导航栏 |
| 布局 | 多栏布局 | 单栏流式布局 |
| 交互 | 鼠标点击 | 触摸优化 |
| 字体 | 标准大小 | 适配移动端阅读 |

---

**版本**: 1.0.0  
**最后更新**: 2026-03-19
