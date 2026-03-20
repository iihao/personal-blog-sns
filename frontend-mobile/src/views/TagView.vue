<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3">
        <h1 class="text-lg font-bold text-gray-900">#{{ tagName }}</h1>
      </div>
    </header>

    <main class="px-4 py-4">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>

      <div v-else class="space-y-4">
        <div v-if="posts.length === 0" class="text-center py-12 text-gray-500">
          暂无文章
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
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const posts = ref([])
const loading = ref(true)
const tagName = ref(route.params.name)

const loadPosts = async () => {
  try {
    const res = await fetch(`/api/posts?tag=${encodeURIComponent(tagName.value)}`)
    const data = await res.json()
    posts.value = data.posts || []
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
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

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
