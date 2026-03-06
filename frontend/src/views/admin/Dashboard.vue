<template>
  <div class="admin-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-home"></i>
        仪表盘
      </h1>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" @click="navigateTo('/admin/articles')">
        <div class="stat-icon blue">
          <i class="fas fa-newspaper"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.posts?.total || 0 }}</div>
          <div class="stat-label">文章总数</div>
          <div class="stat-change positive">
            <i class="fas fa-check"></i> {{ stats.posts?.published || 0 }} 已发布
          </div>
        </div>
      </div>

      <div class="stat-card" @click="navigateTo('/admin/comments')">
        <div class="stat-icon green">
          <i class="fas fa-comments"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.comments?.total || 0 }}</div>
          <div class="stat-label">评论总数</div>
          <div class="stat-change" :class="{ 'has-pending': stats.comments?.pending > 0 }">
            <i class="fas fa-clock"></i> {{ stats.comments?.pending || 0 }} 待审核
          </div>
        </div>
      </div>

      <div class="stat-card" @click="navigateTo('/admin/media')">
        <div class="stat-icon purple">
          <i class="fas fa-images"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.media?.total || 0 }}</div>
          <div class="stat-label">媒体文件</div>
          <div class="stat-change">
            <i class="fas fa-database"></i> {{ formatSize(stats.media?.size || 0) }}
          </div>
        </div>
      </div>

      <div class="stat-card" @click="navigateTo('/admin/editor')">
        <div class="stat-icon orange">
          <i class="fas fa-plus-circle"></i>
        </div>
        <div class="stat-info">
          <div class="stat-label">快捷操作</div>
          <div class="stat-action">
            <i class="fas fa-pen"></i> 写文章
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- 最近文章 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <i class="fas fa-history"></i>
            最近文章
          </h2>
          <router-link to="/admin/articles" class="card-link">
            查看全部 <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
        <div class="card-body">
          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>加载中...</p>
          </div>
          <div v-else-if="recentPosts.length === 0" class="empty-state">
            <i class="fas fa-newspaper"></i>
            <p>暂无文章</p>
            <router-link to="/admin/editor" class="btn-primary">
              <i class="fas fa-plus"></i> 创建第一篇文章
            </router-link>
          </div>
          <div v-else class="article-list">
            <div 
              v-for="post in recentPosts" 
              :key="post.id"
              class="article-item"
              @click="editPost(post.id)"
            >
              <div class="article-status" :class="post.published ? 'published' : 'draft'"></div>
              <div class="article-info">
                <div class="article-title">{{ post.title }}</div>
                <div class="article-meta">
                  <i class="fas fa-user"></i> {{ post.author || 'Admin' }}
                  <span v-if="post.category"> • <i class="fas fa-folder"></i> {{ post.category }}</span>
                </div>
              </div>
              <div class="article-date">
                {{ formatDate(post.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近评论 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <i class="fas fa-comment-dots"></i>
            最近评论
          </h2>
          <router-link to="/admin/comments" class="card-link">
            查看全部 <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
        <div class="card-body">
          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>加载中...</p>
          </div>
          <div v-else-if="recentComments.length === 0" class="empty-state">
            <i class="fas fa-comments"></i>
            <p>暂无评论</p>
          </div>
          <div v-else class="comment-list">
            <div 
              v-for="comment in recentComments" 
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-avatar">
                {{ (comment.author_name || '匿名').charAt(0).toUpperCase() }}
              </div>
              <div class="comment-content">
                <div class="comment-author">{{ comment.author_name || '匿名' }}</div>
                <div class="comment-text">{{ truncateText(comment.content, 50) }}</div>
                <div class="comment-meta">
                  <span :class="['status-badge', comment.status || 'pending']">
                    {{ comment.status === 'approved' ? '已通过' : '待审核' }}
                  </span>
                  <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h2 class="section-title">
        <i class="fas fa-bolt"></i>
        快捷操作
      </h2>
      <div class="action-grid">
        <div class="action-card" @click="navigateTo('/admin/editor')">
          <i class="fas fa-plus-circle"></i>
          <span>新建文章</span>
        </div>
        <div class="action-card" @click="navigateTo('/admin/articles')">
          <i class="fas fa-edit"></i>
          <span>管理文章</span>
        </div>
        <div class="action-card" @click="navigateTo('/admin/media')">
          <i class="fas fa-upload"></i>
          <span>上传媒体</span>
        </div>
        <div class="action-card" @click="navigateTo('/admin/comments')">
          <i class="fas fa-comment-dots"></i>
          <span>查看评论</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stats = ref({
  posts: { total: 0, published: 0, drafts: 0 },
  comments: { total: 0, pending: 0, approved: 0 },
  media: { total: 0, size: 0 }
})
const recentPosts = ref([])
const recentComments = ref([])
const loading = ref(true)

// 格式化文件大小
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 截断文本
const truncateText = (text, length) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// 加载统计数据
const loadStats = async () => {
  try {
    // 文章统计
    const postsRes = await fetch('/api/posts/stats')
    const postsData = await postsRes.json()
    stats.value.posts = {
      total: postsData.total || 0,
      published: postsData.published || 0,
      drafts: postsData.drafts || 0
    }
    
    // 评论统计
    try {
      const commentsRes = await fetch('/api/comments/stats')
      const commentsData = await commentsRes.json()
      stats.value.comments = commentsData
    } catch (e) {
      stats.value.comments = { total: 0, pending: 0, approved: 0 }
    }
    
    // 媒体统计
    try {
      const mediaRes = await fetch('/api/media/stats')
      const mediaData = await mediaRes.json()
      // API 返回格式：{stats: {total, total_size, by_type}}
      stats.value.media = {
        total: mediaData.stats?.total || 0,
        size: mediaData.stats?.total_size || 0
      }
    } catch (e) {
      console.error('加载媒体统计失败:', e)
      stats.value.media = { total: 0, size: 0 }
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 加载最近文章
const loadRecentPosts = async () => {
  try {
    const postsRes = await fetch('/api/posts?limit=5')
    const postsData = await postsRes.json()
    recentPosts.value = (postsData.posts || []).slice(0, 5)
  } catch (error) {
    console.error('加载文章失败:', error)
  }
}

// 加载最近评论
const loadRecentComments = async () => {
  try {
    const commentsRes = await fetch('/api/comments?limit=5')
    const commentsData = await commentsRes.json()
    recentComments.value = (commentsData.comments || []).slice(0, 5)
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    await Promise.all([
      loadStats(),
      loadRecentPosts(),
      loadRecentComments()
    ])
    
    console.log('数据加载成功')
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / 86400000)
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

// 导航
const navigateTo = (path) => {
  router.push(path)
}

// 编辑文章
const editPost = (id) => {
  router.push(`/admin/editor?id=${id}`)
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-icon.blue {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.2), rgba(0, 122, 255, 0.1));
  color: #007aff;
}

.stat-icon.green {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.2), rgba(52, 199, 89, 0.1));
  color: #34c759;
}

.stat-icon.purple {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(102, 126, 234, 0.1));
  color: #667eea;
}

.stat-icon.orange {
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.2), rgba(255, 149, 0, 0.1));
  color: #ff9500;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 14px;
  color: #86868b;
  font-weight: 500;
}

.stat-change {
  font-size: 12px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #86868b;
}

.stat-change.positive {
  color: #34c759;
}

.stat-change.has-pending {
  color: #ff9500;
}

.stat-action {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
  margin-top: 8px;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

/* 卡片 */
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.card-link:hover {
  color: #764ba2;
}

.card-body {
  padding: 24px;
}

/* 加载状态 */
.loading-state, .empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #86868b;
}

.loading-state i, .empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state .btn-primary {
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

/* 文章列表 */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f5f5f7;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.article-item:hover {
  background: rgba(102, 126, 234, 0.08);
  transform: translateX(4px);
}

.article-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.article-status.published {
  background: #34c759;
}

.article-status.draft {
  background: #ff9500;
}

.article-info {
  flex: 1;
  min-width: 0;
}

.article-title {
  font-weight: 600;
  font-size: 15px;
  color: #1d1d1f;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-meta {
  font-size: 13px;
  color: #86868b;
}

.article-date {
  font-size: 13px;
  color: #86868b;
  white-space: nowrap;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f5f5f7;
  border-radius: 12px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-author {
  font-weight: 600;
  font-size: 14px;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.comment-text {
  font-size: 13px;
  color: #1d1d1f;
  margin-bottom: 8px;
  line-height: 1.4;
}

.comment-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 12px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.approved {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.status-badge.pending {
  background: rgba(255, 149, 0, 0.15);
  color: #ff9500;
}

.comment-date {
  color: #86868b;
}

/* 快捷操作 */
.quick-actions {
  margin-top: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.action-card i {
  font-size: 32px;
  color: #667eea;
}

.action-card span {
  font-weight: 600;
  font-size: 14px;
  color: #1d1d1f;
}

/* 响应式 - 移动端优化 */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 16px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
  }
  
  .stat-icon i {
    font-size: 22px;
  }
  
  .stat-value {
    font-size: 26px;
  }
  
  .stat-label {
    font-size: 13px;
  }
  
  .stat-change {
    font-size: 11px;
  }
  
  .dashboard-grid {
    gap: 16px;
  }
  
  .card-header {
    padding: 16px;
  }
  
  .card-title {
    font-size: 16px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .article-item {
    padding: 12px;
  }
  
  .article-status {
    width: 8px;
    height: 8px;
  }
  
  .article-title {
    font-size: 14px;
  }
  
  .article-meta {
    font-size: 12px;
  }
  
  .article-date {
    font-size: 12px;
  }
  
  .section-title {
    font-size: 16px;
    margin-bottom: 16px;
  }
  
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
  }
  
  .stat-icon i {
    font-size: 24px;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .stat-label {
    font-size: 13px;
  }
  
  .section-title {
    font-size: 16px;
    margin-bottom: 16px;
  }
  
  .action-card {
    padding: 20px;
  }
  
  .action-card i {
    font-size: 28px;
  }
  
  .action-card span {
    font-size: 13px;
  }
  
  .recent-activity {
    padding: 20px;
  }
  
  .activity-item {
    padding: 16px 0;
  }
  
  .activity-icon {
    width: 40px;
    height: 40px;
  }
  
  .activity-content {
    font-size: 13px;
  }
  
  .activity-time {
    font-size: 12px;
  }
  
  .comment-item {
    padding: 16px 0;
  }
  
  .comment-avatar {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .comment-text {
    font-size: 13px;
  }
  
  .comment-meta {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .stat-icon {
    width: 44px;
    height: 44px;
    margin-bottom: 0;
  }
  
  .stat-icon i {
    font-size: 20px;
  }
  
  .stat-info {
    flex: 1;
    margin-left: 12px;
    text-align: left;
  }
  
  .stat-value {
    font-size: 22px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .stat-change {
    font-size: 10px;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .action-card {
    flex-direction: row;
    justify-content: flex-start;
    padding: 16px;
    gap: 16px;
  }
  
  .action-card i {
    font-size: 28px;
  }
  
  .action-card span {
    font-size: 14px;
  }
  
  .recent-activity,
  .recent-comments {
    padding: 16px;
  }
  
  .activity-item {
    padding: 12px 0;
    gap: 12px;
  }
  
  .activity-icon {
    width: 36px;
    height: 36px;
  }
  
  .activity-content {
    font-size: 12px;
  }
  
  .comment-item {
    padding: 12px 0;
    gap: 10px;
  }
  
  .comment-avatar {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
  
  .comment-author {
    font-size: 13px;
  }
  
  .comment-text {
    font-size: 12px;
  }
  
  .comment-meta {
    font-size: 10px;
  }
  
  .status-badge {
    font-size: 10px;
    padding: 2px 6px;
  }
}

/* 横屏模式优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .stat-label {
    font-size: 11px;
  }
}
</style>
