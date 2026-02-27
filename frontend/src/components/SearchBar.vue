<template>
  <div class="search-bar">
    <div class="search-container">
      <input 
        v-model="searchQuery"
        @input="debouncedSearch"
        @keyup.enter="handleSearch"
        type="text"
        placeholder="搜索文章..."
        class="search-input"
      />
      <button @click="handleSearch" class="search-btn">
        <i class="fas fa-search"></i>
      </button>
      <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- 搜索结果下拉 -->
    <transition name="slide">
      <div v-if="showResults && searchResults.length > 0" class="search-results">
        <div v-for="result in searchResults" :key="result.id" class="search-result-item">
          <router-link :to="`/post/${result.id}`" @click="closeResults">
            <h4>{{ result.title }}</h4>
            <p>{{ stripHtml(result.content).substring(0, 100) }}...</p>
            <div class="result-meta">
              <span v-if="result.category" class="category">{{ result.category }}</span>
              <span class="date">{{ formatDate(result.created_at) }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['search', 'clear'])

const searchQuery = ref('')
const searchResults = ref([])
const showResults = ref(false)
let searchTimer = null

const debouncedSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (searchQuery.value.trim()) {
      performSearch()
    } else {
      clearSearch()
    }
  }, 500)
}

const performSearch = async () => {
  try {
    const response = await fetch(`/api/posts?search=${encodeURIComponent(searchQuery.value)}&limit=10`)
    const data = await response.json()
    searchResults.value = data.posts || []
    showResults.value = searchResults.value.length > 0
    emit('search', { query: searchQuery.value, results: searchResults.value })
  } catch (error) {
    console.error('Search error:', error)
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    performSearch()
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showResults.value = false
  emit('clear')
}

const closeResults = () => {
  showResults.value = false
}

const stripHtml = (html) => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

watch(() => searchQuery.value, (newVal) => {
  if (!newVal.trim()) {
    clearSearch()
  }
})
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 14px 50px 14px 18px;
  border: 2px solid var(--input-border);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-btn, .clear-btn {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.search-btn:hover, .clear-btn:hover {
  background: var(--bg-tertiary);
  color: var(--accent-primary);
}

.clear-btn {
  right: 48px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 10px 40px var(--shadow-color);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  animation: slide-down 0.2s ease-out;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-result-item {
  border-bottom: 1px solid var(--border-color);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item a {
  display: block;
  padding: 16px 20px;
  text-decoration: none;
  transition: background 0.2s ease;
}

.search-result-item a:hover {
  background: var(--bg-tertiary);
}

.search-result-item h4 {
  margin: 0 0 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.search-result-item p {
  margin: 0 0 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.category {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-primary);
  border-radius: 12px;
  font-weight: 600;
}

/* 滚动条 */
.search-results::-webkit-scrollbar {
  width: 8px;
}

.search-results::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 0 0 16px 16px;
}

.search-results::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
