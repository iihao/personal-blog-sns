<template>
  <div class="changelog-page">
    <div class="theme-toggle-fixed">
      <ThemeToggle />
    </div>

    <div class="container">
      <header class="page-header">
        <h1 class="page-title">
          <i class="fas fa-history"></i> 更新日志
        </h1>
        <p class="page-subtitle">记录博客系统的每一次成长和进步</p>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载更新日志...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>加载失败</h2>
        <p>{{ error }}</p>
        <button @click="fetchChangelog" class="retry-btn">重试</button>
      </div>

      <!-- Changelog Content -->
      <div v-else class="changelog-content">
        <div v-for="(entry, index) in changelog" :key="entry.version" class="changelog-entry">
          <!-- 版本头部 -->
          <div class="entry-header">
            <div class="version-badge">{{ entry.version }}</div>
            <div class="entry-date">
              <span class="relative-time">{{ formatRelativeTime(entry.date) }}</span>
              <span class="exact-time" :title="formatExactTime(entry.date)">{{ formatExactTime(entry.date) }}</span>
            </div>
          </div>

          <!-- 更新内容列表 -->
          <div class="entry-changes">
            <div v-for="(change, changeIndex) in entry.changes" :key="changeIndex" class="change-item">
              <div class="change-icon" :class="getTypeClass(change.type)">
                <i :class="getTypeIcon(change.type)"></i>
              </div>
              <div class="change-content">
                <span class="change-text">{{ change.content }}</span>
                <span class="change-tag" :class="getTypeTagClass(change.type)">{{ getTypeLabel(change.type) }}</span>
              </div>
            </div>
          </div>

          <!-- 分隔线（最后一个条目除外） -->
          <div v-if="index < changelog.length - 1" class="entry-divider"></div>
        </div>

        <!-- 底部提示 -->
        <div class="changelog-footer">
          <p>✨ 持续更新中，敬请期待更多功能！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ThemeToggle from '../components/ThemeToggle.vue'

const loading = ref(true)
const error = ref('')
const changelog = ref([])

// 获取更新日志
const fetchChangelog = async () => {
  try {
    loading.value = true
    error.value = ''
    const res = await fetch('/api/changelog')
    if (!res.ok) throw new Error('加载失败')
    const data = await res.json()
    changelog.value = data.changelog || []
  } catch (err) {
    console.error('加载更新日志失败:', err)
    error.value = '无法加载更新日志，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 格式化相对时间
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffSeconds < 60) {
    return '刚刚更新'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else if (diffWeeks < 4) {
    return `${diffWeeks}周前`
  } else {
    // 超过一个月显示具体日期
    return formatDate(dateString)
  }
}

// 格式化具体时间
const formatExactTime = (dateString) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}

// 获取类型对应的 CSS 类
const getTypeClass = (type) => {
  const typeMap = {
    feature: 'type-feature',
    fix: 'type-fix',
    improvement: 'type-improvement',
    security: 'type-security',
    docs: 'type-docs',
    performance: 'type-performance'
  }
  return typeMap[type] || 'type-feature'
}

// 获取类型对应的图标
const getTypeIcon = (type) => {
  const iconMap = {
    feature: 'fas fa-sparkles',
    fix: 'fas fa-bug',
    improvement: 'fas fa-arrow-up',
    security: 'fas fa-shield-alt',
    docs: 'fas fa-book',
    performance: 'fas fa-tachometer-alt'
  }
  return iconMap[type] || 'fas fa-star'
}

// 获取类型标签文字
const getTypeLabel = (type) => {
  const labelMap = {
    feature: '功能新增',
    fix: 'Bug 修复',
    improvement: '功能完善',
    security: '安全加固',
    docs: '文档更新',
    performance: '性能优化'
  }
  return labelMap[type] || '更新'
}

// 获取类型标签 CSS 类
const getTypeTagClass = (type) => {
  const tagMap = {
    feature: 'tag-feature',
    fix: 'tag-fix',
    improvement: 'tag-improvement',
    security: 'tag-security',
    docs: 'tag-docs',
    performance: 'tag-performance'
  }
  return tagMap[type] || 'tag-default'
}

onMounted(() => {
  fetchChangelog()
})
</script>

<style scoped>
.changelog-page {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: 40px 20px 80px;
}

.theme-toggle-fixed {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-title i {
  color: var(--accent-primary);
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

/* Loading & Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 20px;
  padding: 12px 32px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
}

/* Changelog Content */
.changelog-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.changelog-entry {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
  transition: all 0.3s;
}

.changelog-entry:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px var(--shadow-color);
}

.entry-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.version-badge {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9375rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
}

.entry-date {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.relative-time {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.exact-time {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

/* Changes List */
.entry-changes {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.change-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.change-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.875rem;
}

.change-icon.type-feature {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.change-icon.type-fix {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.change-icon.type-improvement {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.change-icon.type-security {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.change-icon.type-docs {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.change-icon.type-performance {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.change-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.change-text {
  font-size: 0.9375rem;
  color: var(--text-primary);
  line-height: 1.6;
}

.change-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.change-tag.tag-feature {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.change-tag.tag-fix {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.change-tag.tag-improvement {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.change-tag.tag-security {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.change-tag.tag-docs {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.change-tag.tag-performance {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.entry-divider {
  margin-top: 24px;
  border-top: 2px dashed var(--border-color);
}

.changelog-footer {
  text-align: center;
  padding: 32px 20px;
  color: var(--text-secondary);
  font-size: 1rem;
}

.changelog-footer p {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.875rem;
  }

  .changelog-entry {
    padding: 20px;
  }

  .change-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .change-tag {
    align-self: flex-start;
  }
}
</style>
