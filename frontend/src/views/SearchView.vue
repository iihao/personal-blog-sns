<template>
  <div class="search-page">
    <div class="search-header">
      <h1 class="page-title">
        <i class="fas fa-search"></i>
        搜索结果
      </h1>
      
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchInput"
          @keyup.enter="performSearch"
          type="text"
          placeholder="输入关键词搜索文章..."
          class="search-input"
          aria-label="搜索文章"
        />
        <button @click="performSearch" class="search-btn" :disabled="!searchInput.trim()">
          搜索
        </button>
      </div>

      <p v-if="searchQuery" class="search-info">
        关键词：<strong>"{{ searchQuery }}"</strong>，共找到 {{ posts.length }} 篇文章
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-container">
      <div class="loading-spinner"></div>
      <p class="state-text">正在搜索...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!searchQuery" class="state-container">
      <div class="empty-illustration">🔍</div>
      <h2 class="state-title">请输入搜索关键词</h2>
      <p class="state-description">输入你想查找的内容，按回车键搜索</p>
    </div>

    <!-- No Results -->
    <div v-else-if="posts.length === 0" class="state-container">
      <div class="empty-illustration">😕</div>
      <h2 class="state-title">未找到相关文章</h2>
      <p class="state-description">尝试更换其他关键词进行搜索</p>
    </div>

    <!-- Results List -->
    <div v-else class="posts-list">
      <article 
        v-for="post in posts" 
        :key="post.id" 
        class="post-card card"
      >
        <div class="post-card-header">
          <span v-if="post.category" class="post-category">
            <i class="fas fa-folder"></i> {{ post.category }}
          </span>
          <span class="post-date">
            <i class="fas fa-calendar"></i> {{ formatDate(post.created_at) }}
          </span>
        </div>

        <div class="post-card-body">
          <h2 class="post-title">
            <router-link :to="`/post/${post.id}`" class="title-link" v-html="highlightMatch(post.title)">
            </router-link>
          </h2>

          <div class="post-meta">
            <span class="meta-item">
              <i class="fas fa-user"></i>
              {{ post.author || 'Admin' }}
            </span>
          </div>

          <div class="post-tags" v-if="post.tags">
            <span 
              v-for="tag in post.tags.split(',').slice(0, 3)" 
              :key="tag" 
              class="tag"
            >
              #{{ tag.trim() }}
            </span>
          </div>

          <p class="post-excerpt" v-html="highlightMatch(stripHtml(post.content).substring(0, 200) + '...')"></p>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostStore } from '../store'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()

const searchInput = ref('')
const searchQuery = ref('')
const posts = computed(() => postStore.posts)
const loading = computed(() => postStore.loading)

const performSearch = async () => {
  const query = searchInput.trim()
  if (!query) return
  
  searchQuery.value = query
  // Update URL query param
  router.push({ path: '/search', query: { q: query } })
  await postStore.fetchPosts(1, 20, query, 'published', '', '')
}

onMounted(async () => {
  // Get query from URL
  const query = route.query.q
  if (query) {
    searchInput.value = query
    searchQuery.value = query
    await postStore.fetchPosts(1, 20, query, 'published', '', '')
  }
})

// Watch for query changes
watch(() => route.query.q, async (newQuery) => {
  if (newQuery) {
    searchInput.value = newQuery
    searchQuery.value = newQuery
    await postStore.fetchPosts(1, 20, newQuery, 'published', '', '')
  } else {
    searchInput.value = ''
    searchQuery.value = ''
    postStore.posts = []
  }
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
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

const highlightMatch = (text) => {
  if (!searchQuery.value) return text
  const regex = new RegExp(`(${escapeRegExp(searchQuery.value)})`, 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<style scoped>
.search-page {
  padding: 2rem 0;
  min-height: 60vh;
}

.search-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-box {
  display: flex;
  gap: 0.75rem;
  max-width: 600px;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  flex: 1;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
}

.search-btn {
  padding: 0.875rem 1.5rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover:not(:disabled) {
  background: var(--accent-secondary);
  transform: translateY(-2px);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-info {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.search-info strong {
  color: var(--accent-primary);
}

/* State Containers */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-illustration {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.state-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.state-description {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Posts List */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Post Card */
.post-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.post-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.post-category {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-primary);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.post-date {
  color: var(--text-secondary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.post-card-body {
  padding: 1.5rem;
}

.post-title {
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 0.75rem;
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
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 1rem;
  font-size: 0.75rem;
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
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.read-more-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.read-more-link:hover {
  gap: 0.75rem;
  color: var(--accent-secondary);
}

/* Search Highlight */
.search-highlight {
  background: rgba(255, 255, 0, 0.3);
  color: inherit;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

:global(.dark) .search-highlight {
  background: rgba(255, 255, 0, 0.2);
}

/* Dark Mode */
:global(.dark) .post-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}
</style>
