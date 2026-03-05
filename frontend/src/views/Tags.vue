<template>
  <div class="tags-page">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-tags"></i>
        全部标签
      </h1>
      <p class="page-subtitle">按标签浏览文章</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-container">
      <div class="loading-spinner"></div>
      <p class="state-text">正在加载标签...</p>
    </div>

    <!-- Tags Cloud -->
    <div v-else-if="tags.length > 0" class="tags-cloud">
      <router-link 
        v-for="tag in sortedTags" 
        :key="tag.tag" 
        :to="`/tags/${encodeURIComponent(tag.tag)}`"
        class="tag-item"
        :class="getTagSizeClass(tag.count)"
      >
        <span class="tag-text">#{{ tag.tag }}</span>
        <span class="tag-count">{{ tag.count }}</span>
      </router-link>
    </div>

    <!-- Tags Grid (备用布局) -->
    <div v-else-if="tags.length > 0" class="tags-grid">
      <router-link 
        v-for="tag in sortedTags" 
        :key="tag.tag" 
        :to="`/tags/${encodeURIComponent(tag.tag)}`"
        class="tag-card"
      >
        <div class="tag-card-icon">
          <i class="fas fa-tag"></i>
        </div>
        <div class="tag-card-info">
          <h3 class="tag-card-name">#{{ tag.tag }}</h3>
          <p class="tag-card-count">{{ tag.count }} 篇文章</p>
        </div>
      </router-link>
    </div>

    <!-- Empty State -->
    <div v-else class="state-container">
      <div class="empty-illustration">🏷️</div>
      <h2 class="state-title">暂无标签</h2>
      <p class="state-description">博主正在添加标签中，敬请期待...</p>
      <router-link to="/" class="back-btn">
        <i class="fas fa-arrow-left"></i> 返回首页
      </router-link>
    </div>

    <!-- 返回首页按钮 -->
    <div class="back-home" v-if="tags.length > 0">
      <router-link to="/" class="back-btn">
        <i class="fas fa-arrow-left"></i> 返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePostStore } from '../store'

const postStore = usePostStore()
const loading = ref(true)
const tags = ref([])

// 按数量排序的标签
const sortedTags = computed(() => {
  return [...tags.value].sort((a, b) => b.count - a.count)
})

// 根据文章数量获取标签大小
const getTagSizeClass = (count) => {
  if (count >= 10) return 'tag-large'
  if (count >= 5) return 'tag-medium'
  return 'tag-small'
}

// 加载标签列表
const fetchTags = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/posts/tags')
    const data = await res.json()
    tags.value = data.tags || []
  } catch (error) {
    console.error('加载标签失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchTags)
</script>

<style scoped>
.tags-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 60vh;
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
  margin: 0;
}

.state-container {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.state-text {
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.empty-illustration {
  font-size: 5rem;
  margin-bottom: 24px;
}

.state-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.state-description {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 24px;
}

/* 标签云布局 */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 48px;
  padding: 32px;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--bg-tertiary);
  border-radius: 20px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.tag-item:hover {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.tag-item .tag-count {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tag-item:hover .tag-count {
  background: rgba(255, 255, 255, 0.2);
}

/* 标签大小 */
.tag-large {
  font-size: 1.125rem;
  padding: 12px 22px;
}

.tag-medium {
  font-size: 1rem;
  padding: 10px 18px;
}

.tag-small {
  font-size: 0.875rem;
  padding: 8px 14px;
}

/* 网格布局（备用） */
.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
}

.tag-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 2px solid var(--border-color);
  text-decoration: none;
  transition: all 0.3s ease;
}

.tag-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow-color);
}

.tag-card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 12px;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.tag-card-info {
  flex: 1;
  min-width: 0;
}

.tag-card-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-card-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.back-home {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--border-color);
  transform: translateY(-2px);
}

/* 响应式 */
@media (max-width: 768px) {
  .tags-page {
    padding: 32px 16px;
  }

  .page-title {
    font-size: 2rem;
  }

  .tags-cloud {
    padding: 24px 16px;
  }

  .tag-item {
    font-size: 0.875rem;
    padding: 8px 14px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .tags-cloud {
    gap: 8px;
  }

  .tag-large {
    font-size: 1rem;
  }

  .tag-medium {
    font-size: 0.875rem;
  }

  .tag-small {
    font-size: 0.8125rem;
  }
}
</style>
