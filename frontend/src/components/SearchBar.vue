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
  padding: 12px 45px 12px 16px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #111827);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-btn, .clear-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: var(--text-secondary, #6b7280);
  transition: all 0.2s;
}

.search-btn:hover, .clear-btn:hover {
  background: var(--bg-tertiary, #f3f4f6);
  color: var(--text-primary, #111827);
}

.clear-btn {
  right: 40px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

:global(.dark) .search-results {
  background: var(--bg-secondary, #1e293b);
}

.search-result-item {
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item a {
  display: block;
  padding: 16px;
  text-decoration: none;
  transition: background 0.2s;
}

.search-result-item a:hover {
  background: var(--bg-tertiary, #f3f4f6);
}

:global(.dark) .search-result-item a:hover {
  background: var(--bg-tertiary, #334155);
}

.search-result-item h4 {
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.search-result-item p {
  margin: 0 0 8px;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  line-height: 1.5;
}

.result-meta {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--text-tertiary, #9ca3af);
}

.category {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
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
