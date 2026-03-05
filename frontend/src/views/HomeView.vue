<template>
  <div class="home-wrapper">
    <!-- Hero Section -->
    <section 
      v-if="heroSettings.hero_enabled !== '0'" 
      class="hero-section"
      :style="heroStyle"
    >
      <div class="container-custom">
        <div class="hero-content animate-fade-in">
          <h1 class="hero-title">{{ heroSettings.hero_title || blogConfig.blog_title || '我的博客' }}</h1>
          <p class="hero-description">{{ heroSettings.hero_description || blogConfig.blog_description || '记录技术，分享生活' }}</p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="container-custom py-8">
      <!-- Search & Filter Bar -->
      <div class="filter-bar">
        <div class="search-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="搜索文章..."
            class="search-input"
            aria-label="搜索文章"
          />
        </div>
        <div class="filter-wrapper">
          <i class="fas fa-filter filter-icon"></i>
          <select v-model="selectedCategory" @change="filterPosts" class="filter-select" aria-label="选择分类">
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <!-- Loading State -->
        <div v-if="loading" class="state-container">
          <div class="loading-spinner"></div>
          <p class="state-text">正在加载文章...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="posts.length === 0" class="state-container">
          <div class="empty-illustration">📝</div>
          <h2 class="state-title">暂无文章</h2>
          <p class="state-description">博主正在努力创作中，敬请期待...</p>
        </div>

        <!-- Posts List -->
        <div v-else class="posts-grid">
          <article 
            v-for="(post, index) in posts" 
            :key="post.id" 
            class="post-card card"
            :style="{ animationDelay: `${Math.min(index * 0.08, 0.4)}s` }"
          >
            <div class="post-card-header">
              <div class="post-date-badge">
                <span class="date-day">{{ formatDay(post.created_at) }}</span>
                <span class="date-month">{{ formatMonth(post.created_at) }}</span>
              </div>
              <span v-if="post.category" class="post-category">
                <router-link :to="`/categories/${encodeURIComponent(post.category)}`" class="category-link">
                  <i class="fas fa-folder"></i> {{ post.category }}
                </router-link>
              </span>
            </div>

            <div class="post-card-body">
              <h2 class="post-title">
                <router-link :to="`/post/${post.id}`" class="title-link">
                  {{ post.title }}
                </router-link>
              </h2>

              <div class="post-meta">
                <span class="meta-item">
                  <i class="fas fa-user"></i>
                  {{ post.author || 'Admin' }}
                </span>
                <span class="meta-item">
                  <i class="fas fa-calendar"></i>
                  {{ formatDate(post.created_at) }}
                </span>
              </div>

              <div class="post-tags" v-if="post.tags">
                <router-link 
                  v-for="tag in post.tags.split(',').slice(0, 3)" 
                  :key="tag.trim()" 
                  :to="`/tags/${encodeURIComponent(tag.trim())}`"
                  class="tag"
                >
                  #{{ tag.trim() }}
                </router-link>
              </div>

              <p class="post-excerpt" v-html="stripHtml(post.content).substring(0, 180) + '...'"></p>
            </div>

            <div class="post-card-footer">
              <router-link :to="`/post/${post.id}`" class="read-more-link">
                阅读全文
                <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
          </article>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="pagination-container">
        <button 
          :disabled="pagination.page <= 1" 
          @click="changePage(pagination.page - 1)"
          class="pagination-btn btn-secondary"
          aria-label="上一页"
        >
          <i class="fas fa-chevron-left"></i>
          <span class="hide-mobile">上一页</span>
        </button>
        
        <span class="pagination-info">
          {{ pagination.page }} / {{ pagination.pages }}
        </span>
        
        <button 
          :disabled="pagination.page >= pagination.pages" 
          @click="changePage(pagination.page + 1)"
          class="pagination-btn btn-secondary"
          aria-label="下一页"
        >
          <span class="hide-mobile">下一页</span>
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePostStore, useBlogStore } from '../store'
import SearchBar from '../components/SearchBar.vue'
import ThemeToggle from '../components/ThemeToggle.vue'

const postStore = usePostStore()
const blogStore = useBlogStore()

const posts = computed(() => postStore.posts)
const loading = computed(() => postStore.loading)
const pagination = computed(() => postStore.pagination)
const blogConfig = computed(() => blogStore.config)

// Hero 设置
const heroSettings = ref({
  hero_enabled: '1',
  hero_background: '',
  hero_height: '400',
  hero_title: '',
  hero_description: ''
})

// Hero 样式计算
const heroStyle = computed(() => {
  const style = {}
  
  // 高度
  if (heroSettings.value.hero_height) {
    style.height = `${heroSettings.value.hero_height}px`
  }
  
  // 背景图片
  if (heroSettings.value.hero_background) {
    style.backgroundImage = `url('${heroSettings.value.hero_background}')`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
    style.backgroundRepeat = 'no-repeat'
  }
  
  return style
})

const searchQuery = ref('')
const selectedCategory = ref('')
const categories = ref([])
let searchTimer = null

const fetchHeroSettings = async () => {
  try {
    const response = await fetch('/api/settings/public')
    const data = await response.json()
    const settings = data.settings || {}
    
    heroSettings.value = {
      hero_enabled: settings.hero_enabled || '1',
      hero_background: settings.hero_background || '',
      hero_height: settings.hero_height || '400',
      hero_title: settings.hero_title || '',
      hero_description: settings.hero_description || ''
    }
  } catch (error) {
    console.error('Error fetching hero settings:', error)
  }
}

onMounted(async () => {
  await blogStore.fetchConfig()
  await fetchHeroSettings()
  // 从 API 获取分类列表
  const apiCategories = await postStore.fetchCategories()
  if (apiCategories && apiCategories.length > 0) {
    // API 返回的是对象数组 {category, count}，转换为字符串数组
    categories.value = apiCategories.map(c => c.category).filter(Boolean)
  }
  await postStore.fetchPosts(1, 20, '', 'published', '')
  // 如果 API 分类为空，从文章提取作为备用
  if (categories.value.length === 0) {
    extractCategories()
  }
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
  await postStore.fetchPosts(1, 20, searchQuery.value, status, selectedCategory.value)
  // 如果分类列表为空，从文章提取
  if (categories.value.length === 0) {
    extractCategories()
  }
}

const changePage = async (page) => {
  const status = 'published'
  await postStore.fetchPosts(page, 20, searchQuery.value, status, selectedCategory.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDay = (dateString) => {
  const date = new Date(dateString)
  return date.getDate().toString().padStart(2, '0')
}

const formatMonth = (dateString) => {
  const months = ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月']
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
/* ===== Hero Section ===== */
.home-wrapper {
  min-height: 100vh;
}

.hero-section {
  position: relative;
  padding: 100px 0 80px;
  border-bottom: 1px solid var(--border-color);
  /* 背景图片 */
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%),
              url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80') center/cover no-repeat;
  overflow: hidden;
}

/* 毛玻璃背景层 */
.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 1;
}

:global(.dark) .hero-section {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%),
              url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80') center/cover no-repeat;
}

:global(.dark) .hero-section::before {
  background: rgba(0, 0, 0, 0.3);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
  /* 毛玻璃卡片效果 */
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  padding: 48px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

:global(.dark) .hero-content {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
  animation: slide-up 0.6s ease-out;
}

.hero-description {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: var(--text-secondary);
  font-weight: 400;
  animation: slide-up 0.6s ease-out 0.1s backwards;
}

/* ===== Filter Bar ===== */
.filter-bar {
  @apply flex flex-col sm:flex-row gap-4 mb-8;
}

.search-wrapper, .filter-wrapper {
  @apply relative flex-1;
}

.search-icon, .filter-icon {
  @apply absolute left-4 top-1/2 -translate-y-1/2;
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input, .filter-select {
  @apply w-full pl-12 pr-4 py-3 rounded-xl;
  @apply transition-all duration-200;
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  color: var(--text-primary);
  font-size: 1rem;
}

.search-input:focus, .filter-select:focus {
  @apply outline-none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
}

.filter-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a3a3a3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 44px;
}

/* ===== Content Area ===== */
.content-area {
  min-height: 400px;
}

.state-container {
  @apply flex flex-col items-center justify-center;
  @apply py-20;
  text-align: center;
}

.empty-illustration {
  font-size: 4rem;
  margin-bottom: 24px;
  opacity: 0.5;
}

.state-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.state-description {
  color: var(--text-secondary);
}

/* ===== Posts Grid ===== */
.posts-grid {
  @apply grid gap-6 sm:gap-8;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

@media (max-width: 640px) {
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0;
  }
}

/* ===== Post Card ===== */
.post-card {
  @apply flex flex-col;
  animation: slide-up 0.5s ease-out backwards;
  will-change: transform, box-shadow;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-card:hover {
  transform: translateY(-4px);
}

.post-card-header {
  @apply flex items-center justify-between;
  @apply px-6 pt-6 pb-4;
}

.post-date-badge {
  @apply inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
}

.post-category {
  @apply inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium;
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-primary);
  transition: all 0.2s;
}

.post-category:hover {
  background: rgba(124, 58, 237, 0.15);
}

.category-link {
  display: inline-flex;
  align-items: center;
  gap: 1.5px;
  text-decoration: none;
  color: inherit;
}

.category-link:hover {
  opacity: 0.8;
}

.post-card-body {
  @apply flex-1 px-6 pb-4;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 12px;
}

.title-link {
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.title-link:hover {
  color: var(--accent-primary);
}

.post-meta {
  @apply flex items-center gap-4 mb-4;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.meta-item {
  @apply inline-flex items-center gap-1.5;
}

.post-tags {
  @apply flex flex-wrap gap-2 mb-4;
}

.post-tags .tag {
  @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
}

.post-tags .tag:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-1px);
}

.post-excerpt {
  color: var(--text-secondary);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-footer {
  @apply px-6 pb-6 pt-4;
  @apply border-t;
  border-color: var(--border-color);
}

.read-more-link {
  @apply inline-flex items-center gap-2 font-semibold;
  @apply transition-all duration-200;
  color: var(--accent-primary);
  text-decoration: none;
}

.read-more-link:hover {
  gap: 10px;
  color: var(--accent-secondary);
}

/* ===== Pagination ===== */
.pagination-container {
  @apply flex items-center justify-center gap-4;
  @apply mt-12 py-8;
}

.pagination-btn {
  @apply inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold;
  @apply transition-all duration-200;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 80px;
  text-align: center;
}

/* ===== Dark Mode ===== */
:global(.dark) .post-category {
  background: rgba(167, 139, 250, 0.15);
  color: var(--accent-primary);
}

:global(.dark) .post-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

:global(.dark) .post-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

/* ===== 移动端优化 ===== */
@media (max-width: 640px) {
  /* Hero Section 移动端优化 */
  .hero-section {
    padding: 60px 0 40px;
  }
  
  .hero-content {
    padding: 32px 20px;
    border-radius: 16px;
    margin: 0 12px;
  }
  
  /* Filter Bar 移动端优化 */
  .filter-bar {
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .search-input,
  .filter-select {
    padding: 10px 12px;
    font-size: 0.95rem;
  }
  
  .search-icon,
  .filter-icon {
    left: 10px;
  }
  
  .search-input {
    padding-left: 38px;
  }
  
  /* Content Area 移动端优化 */
  .content-area {
    padding: 0 4px;
  }
  
  /* 双列卡片布局优化 */
  .post-card {
    border-radius: 12px;
    overflow: hidden;
  }
  
  /* 卡片内边距优化 */
  .post-card-header {
    padding: 12px 10px 8px;
  }
  
  .post-card-body {
    padding: 0 10px 8px;
  }
  
  .post-card-footer {
    padding: 8px 10px 12px;
  }
  
  /* 日期徽章优化 - 更小更紧凑 */
  .post-date-badge {
    padding: 4px 8px;
    font-size: 0.7rem;
    gap: 4px;
  }
  
  .date-day {
    font-size: 0.75rem;
  }
  
  .date-month {
    font-size: 0.65rem;
  }
  
  /* 分类优化 */
  .post-category {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
  
  /* 标题字体优化 - 适应双列 */
  .post-title {
    font-size: 0.95rem;
    line-height: 1.35;
    margin-bottom: 8px;
  }
  
  /* 元信息优化 */
  .post-meta {
    font-size: 0.7rem;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  /* 标签优化 - 隐藏或精简 */
  .post-tags {
    gap: 4px;
    margin-bottom: 8px;
  }
  
  .post-tags .tag {
    padding: 2px 6px;
    font-size: 0.65rem;
  }
  
  /* 摘要优化 - 限制 2 行 */
  .post-excerpt {
    font-size: 0.8rem;
    line-height: 1.5;
    -webkit-line-clamp: 2;
  }
  
  /* 阅读更多链接优化 */
  .read-more-link {
    font-size: 0.8rem;
  }
  
  /* 分页优化 */
  .pagination-container {
    margin-top: 20px;
    padding: 12px 0;
  }
  
  .pagination-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  
  .pagination-info {
    min-width: 50px;
    font-size: 0.85rem;
  }
}
</style>
