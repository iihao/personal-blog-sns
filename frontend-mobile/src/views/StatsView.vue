<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="px-4 py-3">
        <h1 class="text-lg font-bold text-gray-900">数据统计</h1>
      </div>
    </header>

    <main class="px-4 py-4 space-y-4">
      <!-- 概览统计 -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 text-white">
          <p class="text-sm opacity-90">用户数</p>
          <p class="text-3xl font-bold">{{ stats.users || 0 }}</p>
        </div>
        <div class="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white">
          <p class="text-sm opacity-90">文章数</p>
          <p class="text-3xl font-bold">{{ stats.posts || 0 }}</p>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white">
          <p class="text-sm opacity-90">评论数</p>
          <p class="text-3xl font-bold">{{ stats.comments || 0 }}</p>
        </div>
        <div class="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-4 text-white">
          <p class="text-sm opacity-90">签到数</p>
          <p class="text-3xl font-bold">{{ stats.checkins || 0 }}</p>
        </div>
      </div>

      <!-- 热门文章 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h2 class="font-bold text-gray-900 mb-3">🔥 热门文章</h2>
        <div v-if="loading" class="text-center py-4 text-gray-500">加载中...</div>
        <div v-else class="space-y-3">
          <div v-for="(post, i) in popularPosts" :key="post.id" class="flex items-center gap-3">
            <span :class="i < 3 ? 'text-red-500 font-bold' : 'text-gray-400'" class="text-lg w-6">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ post.title }}</p>
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <span>❤️ {{ post.likes }}</span>
                <span>💬 {{ post.comments }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 活跃用户 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h2 class="font-bold text-gray-900 mb-3">👥 活跃用户</h2>
        <div v-if="loading" class="text-center py-4 text-gray-500">加载中...</div>
        <div v-else class="space-y-3">
          <div v-for="(user, i) in activeUsers" :key="user.id" class="flex items-center gap-3">
            <span :class="i < 3 ? 'text-yellow-500 font-bold' : 'text-gray-400'" class="text-lg w-6">{{ i + 1 }}</span>
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold">
              {{ user.username.charAt(0) }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ user.username }}</p>
              <p class="text-xs text-gray-500">{{ user.posts }} 文章 · {{ user.comments }} 评论</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TabBar from '../components/TabBar.vue'

const loading = ref(true)
const stats = ref({})
const popularPosts = ref([])
const activeUsers = ref([])

const loadStats = async () => {
  try {
    const [overviewRes, popularRes, activeRes] = await Promise.all([
      fetch('/api/stats/overview'),
      fetch('/api/stats/popular-posts'),
      fetch('/api/stats/active-users')
    ])
    
    const overview = await overviewRes.json()
    const popular = await popularRes.json()
    const active = await activeRes.json()
    
    if (overview.success) stats.value = overview.data
    if (popular.success) popularPosts.value = popular.data
    if (active.success) activeUsers.value = active.data
  } catch (err) {
    console.error('加载统计失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>
