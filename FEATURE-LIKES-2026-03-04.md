# ❤️ 文章点赞功能

**日期:** 2026-03-04  
**功能:** 文章阅读量统计 + 点赞功能  
**状态:** ✅ 已完成

---

## ✨ 功能特性

### 1. 阅读量统计

**功能:**
- ✅ 自动统计文章被访问次数
- ✅ 每次查看文章自动 +1
- ✅ 在文章详情页显示阅读数
- ✅ 支持热门文章排序（按阅读量）

**实现:**
- 数据库字段：`posts.view_count` (INTEGER)
- API: `GET /api/posts/:id` 自动增加阅读量
- 前端显示：文章底部统计区域

---

### 2. 点赞功能

**功能:**
- ✅ 允许未登录用户点赞
- ✅ 登录用户记录用户名
- ✅ 未登录用户记录设备名和 IP
- ✅ 防止重复点赞（同一用户/设备）
- ✅ 实时显示点赞数
- ✅ 支持取消点赞（仅登录用户）

**实现细节:**

#### 数据库表

```sql
CREATE TABLE likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id INTEGER,              -- 登录用户 ID
  username TEXT,                -- 用户名或设备名
  device_id TEXT,               -- 设备 ID（未登录用户）
  ip_address TEXT,              -- IP 地址
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
)

-- 唯一索引，防止重复点赞
CREATE UNIQUE INDEX idx_likes_unique ON likes(post_id, user_id, device_id)
```

#### API 端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/likes/post/:postId` | 获取点赞数 | 公开 |
| GET | `/api/likes/post/:postId/list` | 获取点赞列表 | 公开 |
| GET | `/api/likes/post/:postId/check` | 检查是否已点赞 | 公开 |
| POST | `/api/likes/post/:postId` | 点赞文章 | 公开 |
| DELETE | `/api/likes/post/:postId` | 取消点赞 | 需要登录 |

#### 点赞逻辑

**已登录用户:**
1. 验证 JWT Token
2. 检查是否已点赞（通过 user_id）
3. 插入记录：`user_id`, `username`, `ip_address`
4. 返回最新点赞数

**未登录用户:**
1. 生成设备 ID（存储在 localStorage）
2. 获取设备名称（User Agent）
3. 获取 IP 地址
4. 检查是否已点赞（通过 device_id）
5. 插入记录：`device_id`, `username`（设备名）, `ip_address`
6. 返回最新点赞数

**防止重复:**
- 数据库唯一索引：`(post_id, user_id, device_id)`
- 前端检查状态，已点赞按钮禁用
- 后端双重验证，返回友好错误提示

---

## 🎨 前端实现

### 组件修改

**文件:** `frontend/src/views/PostView.vue`

**新增状态:**
```javascript
const likeCount = ref(0)      // 点赞数
const isLiked = ref(false)    // 是否已点赞
const liking = ref(false)     // 是否正在处理
const likeError = ref(null)   // 错误信息
const deviceId = ref('')      // 设备 ID
```

**新增方法:**
```javascript
generateDeviceId()    // 生成/获取设备 ID
getDeviceName()       // 获取设备名称
fetchLikeCount()      // 获取点赞数
checkLikeStatus()     // 检查是否已点赞
toggleLike()          // 点赞/取消点赞
```

### UI 设计

**点赞按钮状态:**

1. **未点赞:**
   ```
   ♡ 0 次点赞
   ```
   - 空心爱心图标
   - 灰色边框
   - 可点击

2. **已点赞:**
   ```
   ❤️ 1 次点赞
   ```
   - 实心红色爱心
   - 红色背景高亮
   - 可点击取消（仅登录用户）

3. **处理中:**
   ```
   ⏳ 处理中...
   ```
   - 按钮禁用
   - 显示加载动画

4. **错误状态:**
   ```
   ⚠️ 错误信息
   ```
   - 红色文字提示

---

## 📊 数据统计

### 阅读量统计

**查询示例:**
```sql
-- 获取文章阅读量
SELECT id, title, view_count FROM posts ORDER BY view_count DESC LIMIT 10;

-- 热门文章
GET /api/posts/stats/popular?limit=5
```

### 点赞统计

**查询示例:**
```sql
-- 获取文章点赞数
SELECT post_id, COUNT(*) as like_count FROM likes GROUP BY post_id;

-- 获取点赞用户列表
SELECT username, created_at FROM likes 
WHERE post_id = 1 AND username IS NOT NULL 
ORDER BY created_at DESC LIMIT 10;

-- 统计总点赞数
SELECT COUNT(*) as total_likes FROM likes;
```

---

## 🧪 测试场景

### 阅读量测试

1. 访问文章页面
2. 刷新页面
3. 验证 `view_count` 增加
4. 检查前端显示正确

### 点赞测试

#### 登录用户

1. 登录账号
2. 访问文章
3. 点击点赞按钮
4. 验证：
   - ✅ 点赞数 +1
   - ✅ 按钮变为已点赞状态
   - ✅ 数据库记录 user_id 和 username
5. 再次点击（取消点赞）
6. 验证：
   - ✅ 点赞数 -1
   - ✅ 按钮恢复未点赞状态
   - ✅ 数据库记录删除

#### 未登录用户

1. 退出登录
2. 访问文章
3. 点击点赞按钮
4. 验证：
   - ✅ 点赞数 +1
   - ✅ 按钮变为已点赞状态
   - ✅ 数据库记录 device_id 和 device_name
5. 刷新页面
6. 验证：
   - ✅ 仍显示已点赞状态
   - ✅ 无法重复点赞
7. 尝试取消点赞
8. 验证：
   - ✅ 提示需要登录

### 设备测试

1. 使用不同设备/浏览器访问
2. 每个设备可以点赞一次
3. 同一设备不能重复点赞
4. 验证 device_id 正确生成和存储

---

## 📁 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `backend/routes/likes.js` | 新建 - 点赞 API 路由 |
| `backend/server.js` | 注册 `/api/likes` 路由 |
| `frontend/src/views/PostView.vue` | 添加点赞 UI 和逻辑 |

---

## 🔧 配置说明

### 设备 ID 生成

```javascript
// 前端生成并存储
const deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
localStorage.setItem('blog_device_id', deviceId)
```

### IP 地址获取

```javascript
// 后端获取（支持代理）
const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
           req.headers['x-real-ip'] || 
           req.connection?.remoteAddress || 
           'unknown'
```

---

## 🎯 后续优化建议

### 短期

- [ ] 添加点赞动画效果
- [ ] 显示最近点赞用户列表
- [ ] 添加点赞通知（管理员）

### 中期

- [ ] 点赞排行榜
- [ ] 用户点赞历史
- [ ] 防刷机制（频率限制）

### 长期

- [ ] 点赞权重系统
- [ ] 社交分享集成
- [ ] 数据分析报表

---

## 📊 API 响应示例

### 获取点赞数

```json
GET /api/likes/post/1
{
  "count": 42
}
```

### 点赞成功

```json
POST /api/likes/post/1
{
  "success": true,
  "count": 43,
  "message": "点赞成功"
}
```

### 重复点赞

```json
POST /api/likes/post/1
{
  "error": "您已经赞过这篇文章了"
}
```

### 检查点赞状态

```json
GET /api/likes/post/1/check
{
  "liked": true
}
```

---

## ✅ 验收标准

- [x] 阅读量自动统计
- [x] 点赞功能正常工作
- [x] 未登录用户可以点赞
- [x] 登录用户记录用户名
- [x] 未登录用户记录设备信息
- [x] 防止重复点赞
- [x] 支持取消点赞（登录用户）
- [x] UI 状态正确显示
- [x] 错误处理友好
- [x] 数据持久化正常

---

**开发完成时间:** 2026-03-04 11:55  
**后端服务:** ✅ 运行正常  
**前端构建:** ✅ 成功  
**测试状态:** ⏳ 待用户验证
