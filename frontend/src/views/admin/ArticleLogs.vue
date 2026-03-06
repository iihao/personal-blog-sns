<template>
  <div class="article-logs-view">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-history"></i> 文章日志
      </h1>
      <p class="page-subtitle">查看文章的浏览、点赞、修改记录</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <i class="fas fa-eye"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.views || 0 }}</div>
          <div class="stat-label">浏览次数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon red">
          <i class="fas fa-heart"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.likes || 0 }}</div>
          <div class="stat-label">点赞次数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <i class="fas fa-edit"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.updates || 0 }}</div>
          <div class="stat-label">修改次数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ lastActivity }}</div>
          <div class="stat-label">最近活跃</div>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filter-bar">
      <div class="filter-group">
        <label>操作类型：</label>
        <select v-model="filterType" @change="loadLogs">
          <option value="">全部</option>
          <option value="view">浏览</option>
          <option value="like">点赞</option>
          <option value="update">修改</option>
          <option value="delete">删除</option>
          <option value="create">创建</option>
        </select>
      </div>
      <button class="btn-secondary" @click="loadLogs">
        <i class="fas fa-sync"></i> 刷新
      </button>
    </div>

    <!-- 日志列表 -->
    <div class="logs-container">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>加载中...</p>
      </div>

      <div v-else-if="logs.length === 0" class="empty-state">
        <i class="fas fa-history"></i>
        <p>暂无日志记录</p>
      </div>

      <div v-else class="timeline">
        <div v-for="log in logs" :key="log.id" class="timeline-item">
          <div class="timeline-marker">
            <div class="marker-dot" :class="getActionTypeClass(log.action_type)"></div>
            <div class="marker-line"></div>
          </div>
          <div class="timeline-content">
            <div class="log-header">
              <div class="log-user">
                <img v-if="log.avatar" :src="log.avatar" :alt="log.username" class="user-avatar" />
                <div v-else class="user-avatar-placeholder">
                  {{ log.username?.charAt(0).toUpperCase() || 'A' }}
                </div>
                <span class="username">{{ log.username || '匿名用户' }}</span>
                <span v-if="log.role" class="role-badge" :class="log.role">{{ getRoleName(log.role) }}</span>
              </div>
              <div class="log-time">{{ formatTime(log.created_at) }}</div>
            </div>
            <div class="log-body">
              <div class="log-action">
                <i :class="getActionIcon(log.action_type)"></i>
                <span class="action-text">{{ log.action }}</span>
              </div>
              <div v-if="log.details" class="log-details">{{ log.details }}</div>
              <div v-if="log.ip_address" class="log-meta">
                <i class="fas fa-map-marker-alt"></i> {{ log.ip_address }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.pages > 1" class="pagination">
      <button class="page-btn" :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">
        <i class="fas fa-chevron-left"></i> 上一页
      </button>
      <span class="page-info">
        第 {{ pagination.page }} / {{ pagination.pages }} 页
      </span>
      <button class="page-btn" :disabled="pagination.page >= pagination.pages" @click="changePage(pagination.page + 1)">
        下一页 <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const articleId = computed(() => route.params.id || route.query.article_id)

const logs = ref([])
const stats = ref({})
const loading = ref(true)
const filterType = ref('')
const pagination = ref({ page: 1, limit: 50, total: 0, pages: 1 })

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

// 最近活跃时间
const lastActivity = computed(() => {
  if (!stats.value.last_activity) return '-'
  return formatTime(stats.value.last_activity)
})

// 获取操作类型样式
const getActionTypeClass = (type) => {
  const classes = {
    view: 'view',
    like: 'like',
    update: 'update',
    delete: 'delete',
    create: 'create'
  }
  return classes[type] || ''
}

// 获取操作图标
const getActionIcon = (type) => {
  const icons = {
    view: 'fas fa-eye',
    like: 'fas fa-heart',
    update: 'fas fa-edit',
    delete: 'fas fa-trash',
    create: 'fas fa-plus'
  }
  return icons[type] || 'fas fa-circle'
}

// 获取角色名称
const getRoleName = (role) => {
  const names = {
    super_admin: '超级管理员',
    admin: '管理员',
    user: '用户'
  }
  return names[role] || ''
}

// 加载统计信息
const loadStats = async () => {
  try {
    const token = localStorage.getItem('blog_token')
    const res = await fetch(`/api/article-logs/stats/${articleId.value}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    stats.value = data.stats || {}
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 加载日志列表
const loadLogs = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('blog_token')
    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.limit
    })
    if (filterType.value) params.append('action_type', filterType.value)

    const res = await fetch(`/api/article-logs/${articleId.value}?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    logs.value = data.logs || []
    pagination.value = data.pagination || {}
  } catch (error) {
    console.error('加载日志失败:', error)
  } finally {
    loading.value = false
  }
}

// 切换页码
const changePage = (page) => {
  if (page < 1 || page > pagination.value.pages) return
  pagination.value.page = page
  loadLogs()
}

// 生命周期
onMounted(() => {
  if (articleId.value) {
    loadStats()
    loadLogs()
  }
})
</script>

<style scoped>
.article-logs-view {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-subtitle {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.stat-icon.blue {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.2), rgba(0, 122, 255, 0.1));
  color: #007aff;
}

.stat-icon.red {
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.2), rgba(255, 59, 48, 0.1));
  color: #ff3b30;
}

.stat-icon.orange {
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.2), rgba(255, 149, 0, 0.1));
  color: #ff9500;
}

.stat-icon.green {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.2), rgba(52, 199, 89, 0.1));
  color: #34c759;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #86868b;
}

/* 筛选器 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-group label {
  font-size: 14px;
  color: #1d1d1f;
  font-weight: 500;
}

.filter-group select {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #d2d2d7;
  background: white;
  color: #1d1d1f;
  font-size: 14px;
  cursor: pointer;
}

/* 日志列表 */
.logs-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
}

.loading-state i, .empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

/* 时间线 */
.timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding-bottom: 24px;
  position: relative;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d2d2d7;
  z-index: 1;
}

.marker-dot.view {
  background: #007aff;
}

.marker-dot.like {
  background: #ff3b30;
}

.marker-dot.update {
  background: #ff9500;
}

.marker-dot.delete {
  background: #8e8e93;
}

.marker-dot.create {
  background: #34c759;
}

.marker-line {
  width: 2px;
  flex: 1;
  background: #e5e5e7;
  margin-top: 8px;
}

.timeline-content {
  flex: 1;
  background: #f5f5f7;
  border-radius: 12px;
  padding: 16px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.log-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar, .user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.username {
  font-weight: 600;
  font-size: 14px;
  color: #1d1d1f;
}

.role-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.role-badge.super_admin {
  background: rgba(255, 59, 48, 0.15);
  color: #ff3b30;
}

.role-badge.admin {
  background: rgba(0, 122, 255, 0.15);
  color: #007aff;
}

.log-time {
  font-size: 12px;
  color: #86868b;
}

.log-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-action {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #1d1d1f;
}

.log-action i {
  font-size: 14px;
}

.log-details {
  font-size: 13px;
  color: #1d1d1f;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
}

.log-meta {
  font-size: 12px;
  color: #86868b;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
}

.page-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #d2d2d7;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #007aff;
  color: #007aff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #86868b;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-bar {
    flex-direction: column;
    gap: 12px;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
