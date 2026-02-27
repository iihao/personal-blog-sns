# 📝 个人博客系统 - 前后端分离版本

一个现代化的个人博客平台，采用前后端分离架构。

**在线演示:** [blog.sqlboy.top](https://blog.sqlboy.top)

---

## ✨ 特性

### 前端
- 🎨 **现代化 UI** - 时间线风格设计，渐变色彩
- 📱 **响应式设计** - 完美适配手机、平板、桌面
- 🔍 **搜索过滤** - 实时搜索、分类筛选
- 💬 **评论系统** - 支持评论提交和审核
- 🌓 **深色模式** - (开发中) 护眼深色主题
- ⚡ **高性能** - Vue 3 + Vite 快速加载

### 后端
- 🔐 **JWT 认证** - 安全的用户认证
- 📊 **RESTful API** - 规范的接口设计
- 💾 **SQLite 数据库** - 轻量级数据存储
- 🛡️ **安全中间件** - Helmet、CORS 保护
- 📝 **文章管理** - CRUD、分页、搜索
- 🖼️ **媒体管理** - 图片上传和管理

### 管理后台
- 📈 **数据仪表盘** - 文章统计、快速概览
- ✏️ **文章编辑器** - 创建、编辑、发布
- 🗂️ **媒体库** - 文件上传管理
- 💬 **评论管理** - 审核、删除评论
- ⚙️ **站点设置** - 博客配置

---

## 🛠️ 技术栈

### 前端
- **框架:** Vue 3 (Composition API)
- **构建工具:** Vite 5
- **状态管理:** Pinia
- **路由:** Vue Router 4
- **样式:** TailwindCSS + 自定义 CSS
- **HTTP 客户端:** Fetch API

### 后端
- **运行时:** Node.js
- **框架:** Express
- **数据库:** SQLite3
- **认证:** JWT
- **安全:** Helmet、CORS
- **日志:** Morgan

### 部署
- **Web 服务器:** Nginx
- **进程管理:** Systemd / PM2

---

## 📦 项目结构

```
blog-project/
├── backend/
│   ├── server.js              # 主服务入口
│   ├── routes/                # API 路由
│   │   ├── auth.js           # 认证路由
│   │   ├── posts.js          # 文章路由
│   │   ├── comments.js       # 评论路由
│   │   ├── media.js          # 媒体路由
│   │   └── config.js         # 配置路由
│   ├── models/               # 数据模型
│   ├── public/               # 管理后台静态文件
│   ├── uploads/              # 上传文件目录
│   ├── blog.db               # SQLite 数据库
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.vue           # 根组件
│   │   ├── main.js           # 入口文件
│   │   ├── router/           # 路由配置
│   │   ├── store/            # Pinia Store
│   │   ├── views/            # 页面组件
│   │   │   ├── HomeView.vue  # 首页
│   │   │   └── PostView.vue  # 文章详情
│   │   ├── components/       # 公共组件
│   │   └── assets/           # 静态资源
│   ├── dist/                 # 构建输出
│   └── package.json
├── nginx/                    # Nginx 配置
├── README.md                 # 项目说明
├── TODO.md                   # 功能清单
└── PROGRESS-2026-02-27.md    # 进度报告
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 16.x
- npm >= 8.x

### 安装后端

```bash
cd backend

# 安装依赖
npm install

# 初始化数据库 (可选，首次运行自动创建)
node init-db.js

# 启动服务
node server.js

# 或使用 PM2
pm2 start server.js --name blog-backend
```

后端服务将在 `http://localhost:3000` 启动

### 安装前端

```bash
cd frontend

# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建
npm run preview
```

### 默认账户

- **用户名:** admin
- **密码:** admin

⚠️ **重要:** 首次使用后请修改默认密码！

---

## 📡 API 文档

### 认证

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/logout` | 用户登出 |
| GET | `/api/auth/me` | 获取当前用户 |

### 文章

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/posts` | 获取文章列表 |
| GET | `/api/posts/:id` | 获取单篇文章 |
| GET | `/api/posts/stats` | 获取文章统计 |
| POST | `/api/posts` | 创建文章 |
| PUT | `/api/posts/:id` | 更新文章 |
| DELETE | `/api/posts/:id` | 删除文章 |
| DELETE | `/api/posts/batch` | 批量删除 |

### 评论

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/comments` | 获取评论列表 |
| POST | `/api/comments` | 提交评论 |
| PUT | `/api/comments/:id` | 更新评论 |
| DELETE | `/api/comments/:id` | 删除评论 |

### 媒体

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/media` | 获取媒体列表 |
| POST | `/api/media/upload` | 上传文件 |
| DELETE | `/api/media/:id` | 删除文件 |

### 配置

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/config/public` | 获取公开配置 |
| GET | `/api/config` | 获取完整配置 (需认证) |
| PUT | `/api/config` | 更新配置 (需认证) |

---

## 🔧 配置

### 环境变量

后端支持以下环境变量：

```bash
PORT=3000              # 服务端口
NODE_ENV=production    # 运行环境
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name blog.sqlboy.top;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 管理后台
    location /admin {
        root /path/to/backend/public;
        try_files $uri $uri/ /admin/index.html;
    }

    # 上传文件
    location /uploads {
        alias /path/to/backend/uploads;
    }
}
```

---

## 📊 开发进度

查看 [TODO.md](./TODO.md) 了解完整功能清单和开发计划。

### 已完成 ✅
- 用户认证系统
- 文章管理 (CRUD)
- 评论系统
- 媒体管理
- 站点配置
- 响应式 UI

### 进行中 🚧
- 深色模式
- Markdown 编辑器
- 代码高亮

### 计划中 📅
- SEO 优化
- 点赞收藏
- 数据分析
- RSS 订阅

---

## 🐛 已知问题

1. 移动端导航菜单体验待优化
2. 评论不支持 emoji 表情
3. 编辑器需要自动保存功能

---

## 📝 更新日志

### v1.0.0 (2026-02-27)
- ✨ 初始版本发布
- ✨ 完整的前后端分离架构
- ✨ 文章、评论、媒体管理
- ✨ 现代化 UI 设计
- 🐛 修复评论查询过滤问题

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 👤 作者

**blog.sqlboy.top**

---

## 🔗 链接

- [博客首页](https://blog.sqlboy.top)
- [管理后台](https://blog.sqlboy.top/admin)
- [GitHub](https://github.com/your-repo)

---

**Made with ❤️ by Vue3 + Express**
