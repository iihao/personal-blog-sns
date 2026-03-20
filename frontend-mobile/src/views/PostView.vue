<template>
  <div class="min-h-screen bg-white safe-area-top safe-area-bottom">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3 flex items-center gap-3">
        <button @click="goBack" class="touch-feedback p-1 -ml-1">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="flex-1 text-base font-semibold text-gray-900 truncate">文章详情</h1>
        <div class="w-8"></div>
      </div>
    </header>

    <!-- 文章内容 -->
    <main class="px-4 py-6">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500">{{ error }}</p>
        <button 
          @click="loadPost"
          class="mt-4 px-6 py-2 bg-primary-500 text-white rounded-full touch-feedback"
        >
          重试
        </button>
      </div>

      <article v-else-if="post" class="prose prose-sm max-w-none">
        <h1 class="text-xl font-bold text-gray-900 mb-4">{{ post.title }}</h1>
        
        <div class="flex items-center gap-4 text-xs text-gray-400 mb-6 pb-6 border-b border-gray-100">
          <span>{{ formatDate(post.created_at) }}</span>
          <span v-if="post.views" class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ post.views }}
          </span>
          <span v-if="post.likes" class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {{ post.likes }}
          </span>
        </div>

        <div 
          class="text-gray-700 leading-relaxed"
          v-html="post.content"
        ></div>
      </article>

      <div v-else class="text-center py-12">
        <p class="text-gray-500">文章不存在</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postApi } from '../utils/api'

const route = useRoute()
const router = useRouter()
const post = ref(null)
const loading = ref(true)
const error = ref(null)

const loadPost = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await postApi.getPost(route.params.id)
    post.value = data
  } catch (err) {
    error.value = '加载失败，请重试'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.prose :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.prose :deep(p) {
  margin: 0.75rem 0;
}

.prose :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose :deep(h3) {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.prose :deep(ul), .prose :deep(ol) {
  padding-left: 1.25rem;
  margin: 0.75rem 0;
}

.prose :deep(li) {
  margin: 0.25rem 0;
}

.prose :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.prose :deep(pre code) {
  background: none;
  padding: 0;
}

.prose :deep(blockquote) {
  border-left: 3px solid #3b82f6;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #6b7280;
}
</style>
