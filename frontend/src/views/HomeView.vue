<template>
  <div class="home-container">
    <!-- Header -->
    <header class="site-header">
      <div class="header-content">
        <h1 class="site-title">{{ blogConfig.blog_title }}</h1>
        <p class="site-description">{{ blogConfig.blog_description }}</p>
        <!-- 主题切换按钮 -->
        <div class="theme-toggle-container">
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Search & Filter Bar -->
      <div class="filter-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索文章..." 
            @input="debouncedSearch"
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <select v-model="selectedCategory" @change="filterPosts" class="filter-select">
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <div class="timeline">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在加载文章...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="posts.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h2>暂无文章</h2>
          <p>博主正在努力创作中...</p>
        </div>

        <!-- Timeline Posts -->
        <div v-else class="timeline-posts">
          <div v-for="(post, index) in posts" :key="post.id" class="timeline-item">
            <div class="timeline-marker">
              <div class="marker-dot"></div>
              <div class="marker-line"></div>
            </div>
            
            <article class="timeline-card" :style="{ animationDelay: `${index * 0.1}s` }">
              <div class="card-date">
                <span class="date-day">{{ formatDay(post.created_at) }}</span>
                <span class="date-month">{{ formatMonth(post.created_at) }}</span>
                <span class="date-year">{{ formatYear(post.created_at) }}</span>
              </div>
              
              <div class="card-content">
                <div class="card-category" v-if="post.category">
                  <i class="fas fa-folder"></i> {{ post.category }}
                </div>
                <h2 class="card-title">{{ post.title }}</h2>
                
                <div class="card-meta">
                  <span class="meta-author">
                    <i class="fas fa-user"></i> {{ post.author || 'Admin' }}
                  </span>
                  <span class="meta-date">
                    <i class="fas fa-calendar"></i> {{ formatDate(post.created_at) }}
                  </span>
                </div>
                
                <div class="card-tags" v-if="post.tags">
                  <span v-for="tag in post.tags.split(',').slice(0, 3)" :key="tag" class="tag">
                    #{{ tag.trim() }}
                  </span>
                </div>
                
                <div class="card-excerpt" v-html="stripHtml(post.content).substring(0, 200) + '...'"></div>
                
                <div class="card-footer">
                  <a :href="`/post/${post.id}`" class="read-more">
                    阅读全文 <i class="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="pagination">
        <button 
          :disabled="pagination.page <= 1" 
          @click="changePage(pagination.page - 1)"
          class="page-btn"
        >
          <i class="fas fa-chevron-left"></i> 上一页
        </button>
        
        <span class="page-info">
          第 {{ pagination.page }} / {{ pagination.pages }} 页
        </span>
        
        <button 
          :disabled="pagination.page >= pagination.pages" 
          @click="changePage(pagination.page + 1)"
          class="page-btn"
        >
          下一页 <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <p>© {{ new Date().getFullYear() }} {{ blogConfig.blog_title }}. Powered by Vue3 + Express</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePostStore, useBlogStore } from '../store'
import ThemeToggle from '../components/ThemeToggle.vue'

const postStore = usePostStore()
const blogStore = useBlogStore()

const posts = computed(() => postStore.posts)
const loading = computed(() => postStore.loading)
const pagination = computed(() => postStore.pagination)
const blogConfig = computed(() => blogStore.config)

const searchQuery = ref('')
const selectedCategory = ref('')
const categories = ref([])
let searchTimer = null

onMounted(async () => {
  await blogStore.fetchConfig()
  await postStore.fetchPosts(1, 20)
  extractCategories()
})

const extractCategories = () => {
  const cats = new Set(posts.value.filter(p => p.category).map(p => p.category))
  categories.value = Array.from(cats)
}

const debouncedSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filterPosts()
  }, 500)
}

const filterPosts = async () => {
  const status = 'published'
  await postStore.fetchPosts(1, 20, searchQuery.value, status)
  extractCategories()
}

const changePage = async (page) => {
  const status = 'published'
  await postStore.fetchPosts(page, 20, searchQuery.value, status)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDay = (dateString) => {
  const date = new Date(dateString)
  return date.getDate().toString().padStart(2, '0')
}

const formatMonth = (dateString) => {
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const date = new Date(dateString)
  return months[date.getMonth()]
}

const formatYear = (dateString) => {
  const date = new Date(dateString)
  return date.getFullYear()
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const stripHtml = (html) => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.site-header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 60px 20px;
  text-align: center;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.site-title {
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  letter-spacing: -1px;
}

.site-description {
  font-size: 18px;
  color: #666;
  font-weight: 400;
}

.theme-toggle-container {
  position: absolute;
  top: 20px;
  right: 20px;
}

/* Filter Bar */
.filter-bar {
  max-width: 900px;
  margin: 40px auto 20px;
  padding: 0 20px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-group {
  min-width: 150px;
}

.filter-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

/* Main Content */
.main-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 60px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
}

.timeline-item {
  position: relative;
  margin-bottom: 40px;
}

.timeline-marker {
  position: absolute;
  left: -40px;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  z-index: 1;
}

.marker-line {
  flex: 1;
  width: 2px;
  background: rgba(102, 126, 234, 0.3);
  min-height: 100%;
}

.timeline-item:last-child .marker-line {
  display: none;
}

/* Timeline Card */
.timeline-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.timeline-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
}

.card-date {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.card-category {
  display: inline-block;
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 12px 0;
  line-height: 1.3;
}

.card-meta {
  display: flex;
  gap: 16px;
  color: #86868b;
  font-size: 14px;
  margin-bottom: 12px;
}

.card-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.tag {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.card-excerpt {
  color: #3c3c43;
  line-height: 1.6;
  margin-bottom: 16px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.read-more:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateX(4px);
}

/* Loading & Empty States */
.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h2 {
  font-size: 24px;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.empty-state p {
  color: #86868b;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding: 20px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  color: #86868b;
  font-size: 14px;
  font-weight: 500;
}

/* Footer */
.site-footer {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 40px 20px;
  text-align: center;
  color: #86868b;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .site-title {
    font-size: 32px;
  }

  .timeline {
    padding-left: 40px;
  }

  .timeline::before {
    left: 10px;
  }

  .timeline-marker {
    left: -30px;
  }

  .timeline-card {
    padding: 20px;
  }

  .card-title {
    font-size: 20px;
  }

  .filter-bar {
    flex-direction: column;
  }

  .search-box, .filter-group {
    min-width: 100%;
  }

  .pagination {
    flex-direction: column;
  }
}
</style>
