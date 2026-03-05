<template>
  <div class="categories-page">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-folder-open"></i>
        全部分类
      </h1>
      <p class="page-subtitle">探索不同主题的文章</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-container">
      <div class="loading-spinner"></div>
      <p class="state-text">正在加载分类...</p>
    </div>

    <!-- Categories Grid -->
    <div v-else-if="categories.length > 0" class="categories-grid">
      <router-link 
        v-for="category in categories" 
        :key="category.category" 
        :to="`/categories/${encodeURIComponent(category.category)}`"
        class="category-card"
      >
        <div class="category-icon">
          <i class="fas fa-folder"></i>
        </div>
        <div class="category-info">
          <h3 class="category-name">{{ category.category }}</h3>
          <p class="category-count">
            <i class="fas fa-file-alt"></i>
            {{ category.count }} 篇文章
          </p>
        </div>
        <div class="category-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </router-link>
    </div>

    <!-- Empty State -->
    <div v-else class="state-container">
      <div class="empty-illustration">📂</div>
      <h2 class="state-title">暂无分类</h2>
      <p class="state-description">博主正在整理分类中，敬请期待...</p>
      <router-link to="/" class="back-btn">
        <i class="fas fa-arrow-left"></i> 返回首页
      </router-link>
    </div>

    <!-- 返回首页按钮 -->
    <div class="back-home" v-if="categories.length > 0">
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
const categories = ref([])

// 加载分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/posts/categories')
    const data = await res.json()
    categories.value = data.categories || []
  } catch (error) {
    console.error('加载分类失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)
</script>

<style scoped>
.categories-page {
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--card-bg);
  border-radius: 16px;
  border: 2px solid var(--border-color);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow-color);
}

.category-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 14px;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-count i {
  font-size: 0.75rem;
}

.category-arrow {
  color: var(--text-tertiary);
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.category-card:hover .category-arrow {
  transform: translateX(4px);
  color: var(--accent-primary);
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
  .categories-page {
    padding: 32px 16px;
  }

  .page-title {
    font-size: 2rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .category-card {
    padding: 20px;
  }

  .category-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }
}
</style>
