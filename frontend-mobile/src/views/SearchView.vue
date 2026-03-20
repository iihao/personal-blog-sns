<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3">
        <h1 class="text-lg font-bold text-gray-900">搜索</h1>
      </div>
    </header>

    <main class="px-4 py-4">
      <!-- 搜索框 -->
      <div class="mb-4">
        <form @submit.prevent="doSearch" class="flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索文章..."
            class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          />
          <button type="submit" class="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium touch-feedback">
            搜索
          </button>
        </form>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searched" class="space-y-4">
        <div v-if="posts.length === 0" class="text-center py-12 text-gray-500">
          没有找到相关文章
        </div>
        <article
          v-for="post in posts"
          :key="post.id"
          @click="$router.push(`/post/${post.id}`)"
          class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 touch-feedback"
        >
          <h2 class="font-bold text-gray-900 line-clamp-2">{{ post.title }}</h2>
          <p class="text-sm text-gray-500 mt-2 line-clamp-3">{{ stripHtml(post.content) }}</p>
          <div class="flex items-center justify-between mt-3">
            <span class="text-xs text-gray-400">{{ formatDate(post.created_at) }}</span>
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <span v-if="post.views">👁 {{ post.views }}</span>
              <span v-if="post.likes">❤️ {{ post.likes }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- 初始状态 -->
      <div v-else class="text-center py-12 text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p>输入关键词搜索文章</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const searchQuery = ref(route.query.q || '')
const posts = ref([])
const searched = ref(false)

const doSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  searched.value = true
  try {
    const res = await fetch(`/api/posts/search?q=${encodeURIComponent(searchQuery.value)}`)
    const data = await res.json()
    posts.value = data.posts || []
  } catch (error) {
    console.error('搜索失败:', error)
  }
}

const stripHtml = (html) => {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
