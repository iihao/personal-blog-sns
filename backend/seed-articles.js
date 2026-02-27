const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./blog.db');

const articles = [
  {
    title: "2026 年前端开发趋势：Vue 3、TypeScript 与现代化开发体验",
    content: `<h2>引言</h2>
<p>随着 2026 年的到来，前端开发领域继续快速演进。作为一名全栈开发者，我深刻感受到技术栈的选择对开发效率和项目质量的巨大影响。本文将分享我在实际项目中使用 Vue 3、TypeScript 等现代技术的经验和心得。</p>

<h2>Vue 3 组合式 API 的优势</h2>
<p>Vue 3 的组合式 API（Composition API）彻底改变了我们组织组件逻辑的方式。相比选项式 API，组合式 API 提供了更好的代码复用性和类型推导能力。</p>

<p>在实际项目中，我发现组合式 API 有几个显著优势：</p>
<ul>
<li><strong>逻辑复用更灵活</strong>：通过自定义 Hook，可以将通用逻辑抽离出来，在多个组件间复用，避免了 mixins 的命名冲突问题。</li>
<li><strong>类型推导更友好</strong>：配合 TypeScript，组合式 API 能提供完整的类型推导，大大减少了运行时错误。</li>
<li><strong>代码组织更清晰</strong>：相关逻辑可以组织在一起，而不是分散在 data、methods、computed 等不同选项中。</li>
</ul>

<h2>TypeScript 带来的开发体验提升</h2>
<p>TypeScript 已经成为现代前端开发的标配。在这个博客项目中，我全面采用了 TypeScript，收获颇丰：</p>

<p><strong>1. 早期错误检测</strong></p>
<p>类型系统能在编译阶段发现大部分错误，减少了运行时 bug。特别是在重构时，类型检查能帮助快速定位需要修改的地方。</p>

<p><strong>2. 更好的 IDE 支持</strong></p>
<p>智能提示、自动补全、跳转定义等功能让开发效率大幅提升。即使是阅读他人代码，也能快速理解数据结构和方法签名。</p>

<p><strong>3. 文档即代码</strong></p>
<p>类型定义本身就是最好的文档。新加入的开发者通过阅读类型定义，能快速了解项目的数据结构和 API 设计。</p>

<h2>构建工具的选择</h2>
<p>Vite 作为新一代构建工具，已经成熟稳定。相比传统的 Webpack，Vite 的开发服务器启动速度几乎是瞬时的，热更新也非常快速。这对于大型项目来说，能显著提升开发体验。</p>

<h2>总结</h2>
<p>现代前端技术栈的核心价值在于提升开发效率和代码质量。Vue 3 + TypeScript + Vite 的组合，为开发者提供了优秀的开发体验。当然，技术选型需要根据项目实际情况，没有银弹，只有最适合的选择。</p>

<p>未来，我将继续探索更多前端新技术，如 Server Components、Islands Architecture 等，保持技术敏感度，为项目带来更好的解决方案。</p>`,
    author: "黄强",
    tags: "Vue3,TypeScript,前端开发，技术趋势",
    category: "技术分享",
    published: 1
  },
  {
    title: "Linux 服务器安全加固实践：从入门到精通",
    content: `<h2>前言</h2>
<p>服务器安全是每个运维和开发者都必须重视的问题。一次安全漏洞可能导致数据泄露、服务中断甚至经济损失。本文将分享我在 Linux 服务器安全加固方面的实践经验，帮助你构建更安全的服务器环境。</p>

<h2>一、基础安全配置</h2>

<h3>1.1 SSH 安全加固</h3>
<p>SSH 是服务器最常用的远程管理方式，也是攻击者最常尝试的入口。以下是 SSH 加固的关键措施：</p>

<p><strong>禁用密码登录，使用密钥认证</strong></p>
<p>密码容易被暴力破解，而 SSH 密钥几乎不可能被破解。生成密钥对后，在<code>/etc/ssh/sshd_config</code>中配置：</p>
<pre><code>PasswordAuthentication no
PubkeyAuthentication yes</code></pre>

<p><strong>修改默认端口</strong></p>
<p>将 SSH 端口从默认的 22 改为其他端口，可以减少自动化扫描攻击：</p>
<pre><code>Port 2222</code></pre>

<p><strong>限制登录用户</strong></p>
<p>只允许特定用户登录 SSH：</p>
<pre><code>AllowUsers admin deploy</code></pre>

<h3>1.2 防火墙配置</h3>
<p>使用 UFW（Uncomplicated Firewall）配置防火墙规则：</p>
<pre><code># 启用防火墙
ufw enable

# 允许 SSH
ufw allow 2222/tcp

# 允许 HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 查看状态
ufw status verbose</code></pre>

<h2>二、系统更新与补丁管理</h2>

<h3>2.1 定期更新系统</h3>
<p>保持系统更新是防范已知漏洞的最有效方法：</p>
<pre><code># Ubuntu/Debian
apt update && apt upgrade -y

# CentOS/RHEL
yum update -y</code></pre>

<h3>2.2 配置自动安全更新</h3>
<p>安装 unattended-upgrades 包，配置自动安装安全更新：</p>
<pre><code>apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades</code></pre>

<h2>三、用户与权限管理</h2>

<h3>3.1 最小权限原则</h3>
<p>遵循最小权限原则，只授予用户完成任务所需的最小权限。不要随意使用 root 账户，日常操作使用普通用户，必要时通过 sudo 提权。</p>

<h3>3.2 审计用户权限</h3>
<p>定期检查具有 sudo 权限的用户：</p>
<pre><code>grep sudo /etc/group
cat /etc/sudoers</code></pre>

<h2>四、日志监控与入侵检测</h2>

<h3>4.1 启用系统日志</h3>
<p>确保 rsyslog 或 systemd-journald 服务正常运行，记录系统活动。</p>

<h3>4.2 安装 Fail2Ban</h3>
<p>Fail2Ban 可以自动封禁多次登录失败的 IP 地址：</p>
<pre><code>apt install fail2ban
systemctl enable fail2ban
systemctl start fail2ban</code></pre>

<h2>五、备份策略</h2>

<p>再完善的安全措施也无法保证 100% 安全，因此备份至关重要：</p>
<ul>
<li><strong>3-2-1 原则</strong>：至少 3 份数据，2 种不同介质，1 份异地备份</li>
<li><strong>定期测试恢复</strong>：备份的价值在于能够恢复，定期测试恢复流程</li>
<li><strong>自动化备份</strong>：使用 cron 或 systemd timer 定时执行备份任务</li>
</ul>

<h2>总结</h2>
<p>服务器安全是一个持续的过程，需要定期审查和更新安全措施。建立安全意识，养成良好的安全习惯，比任何工具都重要。希望本文的实践经验能帮助你构建更安全的服务器环境。</p>`,
    author: "黄强",
    tags: "Linux，服务器安全，运维，SSH，防火墙",
    category: "运维安全",
    published: 1
  },
  {
    title: "Docker 容器化部署完整指南：从开发到生产",
    content: `<h2>为什么选择 Docker</h2>
<p>在现代软件开发中，"在我机器上能运行"已经不再是一个可接受的理由。Docker 通过容器化技术，解决了开发、测试、生产环境一致性的问题，让应用部署变得简单可靠。</p>

<h2>Docker 核心概念</h2>

<h3>镜像（Image）</h3>
<p>镜像是一个只读模板，包含了运行应用所需的代码、运行时、库、环境变量和配置文件。可以把镜像理解为类的定义。</p>

<h3>容器（Container）</h3>
<p>容器是镜像的运行实例，相当于类的实例对象。容器之间相互隔离，拥有独立的文件系统、网络和进程空间。</p>

<h3>Dockerfile</h3>
<p>Dockerfile 是构建镜像的脚本文件，定义了镜像的构建步骤。以下是一个 Node.js 应用的 Dockerfile 示例：</p>

<pre><code>FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]</code></pre>

<h2>实战：容器化博客系统</h2>

<h3>第一步：编写 Dockerfile</h3>
<p>为博客后端服务创建 Dockerfile：</p>

<pre><code>FROM node:20-alpine

# 安装必要的构建工具
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --production

# 复制应用代码
COPY . .

# 创建数据目录
RUN mkdir -p /app/uploads

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]</code></pre>

<h3>第二步：编写 docker-compose.yml</h3>
<p>使用 Docker Compose 编排多容器应用：</p>

<pre><code>version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    networks:
      - blog-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - blog-network

networks:
  blog-network:
    driver: bridge</code></pre>

<h2>性能优化技巧</h2>

<h3>1. 使用多阶段构建</h3>
<p>多阶段构建可以显著减小镜像体积：</p>

<pre><code># 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
CMD ["node", "dist/server.js"]</code></pre>

<h3>2. 合理使用缓存</h3>
<p>在 Dockerfile 中，将变化频率低的指令放在前面，充分利用 Docker 的层缓存机制。</p>

<h3>3. 选择合适的基础镜像</h3>
<p>Alpine 镜像体积小、安全性高，适合生产环境。但需要注意 musl libc 与 glibc 的兼容性问题。</p>

<h2>生产环境最佳实践</h2>

<ul>
<li><strong>不以 root 运行</strong>：创建专用用户运行应用</li>
<li><strong>资源限制</strong>：使用<code>--memory</code>和<code>--cpus</code>限制容器资源</li>
<li><strong>健康检查</strong>：配置 HEALTHCHECK 指令监控容器状态</li>
<li><strong>日志管理</strong>：配置日志驱动和轮转策略</li>
<li><strong>安全扫描</strong>：定期扫描镜像漏洞</li>
</ul>

<h2>监控与日志</h2>
<p>在生产环境中，建议使用 ELK Stack（Elasticsearch、Logstash、Kibana）或 Prometheus + Grafana 进行日志收集和性能监控。</p>

<h2>总结</h2>
<p>Docker 容器化部署简化了应用的构建、运输和运行流程。通过合理的镜像设计和编排配置，可以实现高效、可靠、可扩展的部署方案。掌握 Docker 技术，是现代开发者的必备技能。</p>`,
    author: "黄强",
    tags: "Docker，容器化，DevOps，部署，微服务",
    category: "技术教程",
    published: 1
  },
  {
    title: "RESTful API 设计最佳实践：打造优雅的接口",
    content: `<h2>什么是 RESTful API</h2>
<p>REST（Representational State Transfer）是一种软件架构风格，定义了一组约束和原则。遵循这些原则设计的 API 称为 RESTful API，具有清晰、简洁、易于理解的特点。</p>

<h2>核心设计原则</h2>

<h3>1. 使用名词表示资源</h3>
<p>URL 应该使用名词表示资源，避免使用动词：</p>

<pre><code>✅ /api/posts          # 获取文章列表
✅ /api/posts/123      # 获取 ID 为 123 的文章
❌ /api/getPosts
❌ /api/getPostById</code></pre>

<h3>2. 使用 HTTP 方法表示操作</h3>
<p>HTTP 方法已经定义了操作的语义，不需要在 URL 中重复：</p>

<pre><code>GET    /api/posts      # 获取文章列表
POST   /api/posts      # 创建新文章
GET    /api/posts/123  # 获取单篇文章
PUT    /api/posts/123  # 更新文章（全量）
PATCH  /api/posts/123  # 更新文章（部分）
DELETE /api/posts/123  # 删除文章</code></pre>

<h3>3. 使用复数名词</h3>
<p>资源名称统一使用复数形式，保持一致性：</p>

<pre><code>✅ /api/users
✅ /api/posts
✅ /api/comments
❌ /api/user
❌ /api/post</code></pre>

<h3>4. 使用嵌套表示关联关系</h3>
<p>对于有关联的资源，使用嵌套 URL：</p>

<pre><code>GET /api/posts/123/comments    # 获取文章 123 的评论
GET /api/users/456/posts       # 获取用户 456 的文章</code></pre>

<h2>响应格式设计</h2>

<h3>统一响应结构</h3>
<p>设计统一的响应格式，便于客户端处理：</p>

<pre><code>// 成功响应
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": [ ... ]
  }
}

// 列表响应
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}</code></pre>

<h3>合适的 HTTP 状态码</h3>
<p>正确使用 HTTP 状态码，让客户端了解请求结果：</p>

<pre><code>200 OK          # 请求成功
201 Created     # 资源创建成功
204 No Content  # 删除成功，无返回内容
400 Bad Request # 请求参数错误
401 Unauthorized# 未授权
403 Forbidden   # 禁止访问
404 Not Found   # 资源不存在
409 Conflict    # 资源冲突
422 Unprocessable Entity # 参数验证失败
500 Internal Server Error # 服务器错误</code></pre>

<h2>分页与过滤</h2>

<h3>分页参数</h3>
<pre><code>GET /api/posts?page=1&limit=10
GET /api/posts?offset=0&limit=10</code></pre>

<h3>过滤参数</h3>
<pre><code>GET /api/posts?category=tech&published=true
GET /api/posts?author=123&status=draft
GET /api/posts?created_at_gte=2026-01-01</code></pre>

<h3>排序参数</h3>
<pre><code>GET /api/posts?sort=created_at&order=desc
GET /api/posts?sort=-created_at  # - 表示降序</code></pre>

<h2>版本控制</h2>
<p>API 版本控制确保向后兼容，常见的版本控制方式：</p>

<pre><code># URL 路径版本（推荐）
/api/v1/posts
/api/v2/posts

# 请求头版本
Accept: application/vnd.api.v1+json

# 查询参数版本
/api/posts?version=1</code></pre>

<h2>认证与授权</h2>

<h3>JWT Token 认证</h3>
<pre><code>Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</code></pre>

<h3>API Key 认证</h3>
<pre><code>X-API-Key: your-api-key-here</code></pre>

<h2>错误处理</h2>
<p>提供详细的错误信息，帮助开发者快速定位问题：</p>

<pre><code>{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": [
      {
        "field": "title",
        "message": "标题不能为空",
        "code": "REQUIRED"
      },
      {
        "field": "content",
        "message": "内容长度至少 10 个字符",
        "code": "MIN_LENGTH"
      }
    ]
  }
}</code></pre>

<h2>文档与测试</h2>

<h3>使用 OpenAPI/Swagger</h3>
<p>编写规范的 API 文档，方便开发者理解和使用：</p>

<pre><code>openapi: 3.0.0
info:
  title: Blog API
  version: 1.0.0
paths:
  /api/posts:
    get:
      summary: 获取文章列表
      parameters:
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: 成功</code></pre>

<h2>性能优化</h2>

<ul>
<li><strong>字段选择</strong>：支持<code>fields</code>参数，只返回需要的字段</li>
<li><strong>数据缓存</strong>：使用 ETag、Last-Modified 等缓存头</li>
<li><strong>请求限流</strong>：防止 API 滥用，保护服务器资源</li>
<li><strong>异步处理</strong>：耗时操作使用异步任务处理</li>
</ul>

<h2>总结</h2>
<p>设计优秀的 RESTful API 需要遵循一定的规范和最佳实践。好的 API 设计应该清晰、一致、易于理解和使用。这不仅提升了开发效率，也降低了维护成本。希望本文的实践经验能帮助你设计出更优雅的 API。</p>`,
    author: "黄强",
    tags: "API,RESTful，后端开发，接口设计，Web 开发",
    category: "技术教程",
    published: 1
  },
  {
    title: "个人博客从 0 到 1：技术选型与架构设计",
    content: `<h2>项目背景</h2>
<p>作为一名技术爱好者，我一直想拥有一个完全属于自己的博客平台。市面上的博客系统虽然功能丰富，但要么过于臃肿，要么不够灵活。于是，我决定从零开始，打造一个轻量、高效、易用的个人博客系统。</p>

<h2>技术选型</h2>

<h3>前端技术栈</h3>
<p>前端采用现代化的技术栈，追求极致的开发体验和用户体验：</p>

<ul>
<li><strong>Vue 3</strong>：渐进式 JavaScript 框架，组合式 API 提供优秀的代码组织能力</li>
<li><strong>Vite</strong>：新一代构建工具，开发服务器启动速度快，热更新迅速</li>
<li><strong>Tailwind CSS</strong>：实用优先的 CSS 框架，快速构建现代化界面</li>
<li><strong>Vue Router</strong>：官方路由管理器，支持嵌套路由和动态路由</li>
<li><strong>Pinia</strong>：Vue 3 官方状态管理库，类型推导友好</li>
</ul>

<h3>后端技术栈</h3>
<p>后端追求简洁高效，快速迭代：</p>

<ul>
<li><strong>Node.js</strong>：JavaScript 运行时，前后端使用同一语言</li>
<li><strong>Express</strong>：轻量级 Web 框架，中间件生态丰富</li>
<li><strong>SQLite</strong>：轻量级数据库，无需单独部署，适合个人博客</li>
<li><strong>JWT</strong>：JSON Web Token，实现无状态认证</li>
<li><strong>bcrypt</strong>：密码加密库，保护用户信息安全</li>
</ul>

<h3>部署方案</h3>
<ul>
<li><strong>Nginx</strong>：高性能 Web 服务器，反向代理和负载均衡</li>
<li><strong>Let's Encrypt</strong>：免费 SSL 证书，HTTPS 加密传输</li>
<li><strong>PM2</strong>：Node.js 进程管理，自动重启和日志管理</li>
</ul>

<h2>架构设计</h2>

<h3>整体架构</h3>
<pre><code>┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│    Nginx    │────▶│   Express   │
│  (Vue 3)    │◀────│  (Reverse   │◀────│    (API)    │
│             │     │   Proxy)    │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   SQLite    │
                                        │  (Database) │
                                        └─────────────┘</code></pre>

<h3>目录结构</h3>
<pre><code>blog-project/
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── components/   # 可复用组件
│   │   ├── views/        # 页面组件
│   │   ├── router/       # 路由配置
│   │   ├── stores/       # 状态管理
│   │   └── assets/       # 静态资源
│   └── package.json
│
├── backend/               # 后端项目
│   ├── routes/           # API 路由
│   ├── models/           # 数据模型
│   ├── middleware/       # 中间件
│   ├── public/           # 静态文件
│   ├── uploads/          # 上传文件
│   └── server.js         # 入口文件
│
└── nginx/                 # Nginx 配置
    └── blog-https.conf</code></pre>

<h3>数据库设计</h3>
<p>博客系统核心数据表：</p>

<pre><code>-- 文章表
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  tags TEXT,
  category TEXT,
  published BOOLEAN DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME
);

-- 评论表
CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  post_id INTEGER,
  author_name TEXT,
  author_email TEXT,
  content TEXT,
  status TEXT,
  created_at DATETIME,
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- 用户表
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT,
  role TEXT,
  created_at DATETIME
);

-- 媒体表
CREATE TABLE media (
  id INTEGER PRIMARY KEY,
  filename TEXT,
  original_name TEXT,
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at DATETIME
);</code></pre>

<h2>核心功能实现</h2>

<h3>1. 用户认证</h3>
<p>使用 JWT 实现无状态认证，用户登录后获取 Token，后续请求携带 Token 进行身份验证。</p>

<h3>2. 文章管理</h3>
<p>支持 Markdown 编辑器，实时预览，草稿自动保存，文章发布/下线管理。</p>

<h3>3. 评论系统</h3>
<p>评论审核机制，防止垃圾评论，支持评论回复和嵌套。</p>

<h3>4. 媒体管理</h3>
<p>图片上传、裁剪、压缩，支持拖拽上传和剪贴板粘贴。</p>

<h2>性能优化</h2>

<h3>前端优化</h3>
<ul>
<li>代码分割，按需加载</li>
<li>图片懒加载</li>
<li>静态资源 CDN 加速</li>
<li>Service Worker 缓存</li>
</ul>

<h3>后端优化</h3>
<ul>
<li>数据库查询优化，添加索引</li>
<li>接口响应缓存</li>
<li>静态资源 Gzip 压缩</li>
<li>请求限流防刷</li>
</ul>

<h2>安全考虑</h2>
<ul>
<li><strong>HTTPS</strong>：全站加密传输</li>
<li><strong>密码加密</strong>：使用 bcrypt 加密存储</li>
<li><strong>XSS 防护</strong>：输入过滤，输出转义</li>
<li><strong>CSRF 防护</strong>：Token 验证</li>
<li><strong>SQL 注入防护</strong>：参数化查询</li>
</ul>

<h2>部署流程</h2>

<pre><code># 1. 构建前端
cd frontend
npm run build

# 2. 安装后端依赖
cd backend
npm install --production

# 3. 配置 Nginx
sudo cp nginx/blog-https.conf /etc/nginx/conf.d/
sudo nginx -t
sudo systemctl reload nginx

# 4. 启动后端
pm2 start server.js --name blog-backend

# 5. 配置 SSL
certbot --nginx -d blog.sqlboy.top</code></pre>

<h2>总结与展望</h2>
<p>从零搭建博客系统是一个很好的学习过程，涵盖了前端、后端、数据库、部署等多个方面。虽然功能还不够完善，但核心功能已经可用。</p>

<p>未来计划添加的功能：</p>
<ul>
<li>文章搜索功能</li>
<li>RSS 订阅</li>
<li>访问统计</li>
<li>主题切换</li>
<li>SEO 优化</li>
</ul>

<p>技术之路永无止境，持续学习和实践才能不断进步。希望这个博客系统能记录我的成长历程，也能为他人提供参考。</p>`,
    author: "黄强",
    tags: "博客系统，全栈开发，架构设计，Vue3,Node.js",
    category: "项目实战",
    published: 1
  }
];

// Insert articles into database
db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO posts (title, content, author, tags, category, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  articles.forEach((article, index) => {
    const status = article.published ? 'published' : 'draft';
    stmt.run(
      article.title,
      article.content,
      article.author,
      article.tags,
      article.category,
      status,
      function(err) {
        if (err) {
          console.error(`Error inserting article ${index + 1}:`, err);
        } else {
          console.log(`✅ Article ${index + 1} inserted: ${article.title} (ID: ${this.lastID})`);
        }
      }
    );
  });

  stmt.finalize(() => {
    console.log('\n🎉 All articles inserted successfully!');
    db.close();
  });
});
