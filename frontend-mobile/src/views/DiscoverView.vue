<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="px-4 py-3">
        <h1 class="text-lg font-bold text-gray-900">发现</h1>
      </div>
    </header>

    <main class="px-4 py-4 space-y-4">
      <!-- 热门话题 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h2 class="font-bold text-gray-900 mb-3">🔥 热门话题</h2>
        <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>
        <div v-else class="space-y-3">
          <div v-for="topic in topics" :key="topic.id" class="flex items-start gap-3">
            <span :class="topic.hot ? 'text-red-500 font-bold' : 'text-gray-400'" class="text-lg w-6">{{ topic.id }}</span>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ topic.title }}</p>
              <div class="flex items-center gap-4 mt-1">
                <span class="text-xs text-gray-500">{{ topic.views }}阅读</span>
                <span class="text-xs text-gray-500">{{ topic.posts }}讨论</span>
              </div>
            </div>
            <span v-if="topic.hot" class="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded">热</span>
          </div>
        </div>
      </div>

      <!-- 推荐用户 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h2 class="font-bold text-gray-900 mb-3">👥 推荐关注</h2>
        <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>
        <div v-else class="grid grid-cols-3 gap-3">
          <div v-for="user in users" :key="user.id" class="text-center">
            <div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xl font-bold mb-2">
              {{ user.name.charAt(0) }}
            </div>
            <p class="text-sm font-medium text-gray-900 truncate">{{ user.name }}</p>
            <p class="text-xs text-gray-500 mb-2">{{ user.followers }}粉丝</p>
            <button class="w-full py-1.5 text-xs bg-blue-500 text-white rounded-full">关注</button>
          </div>
        </div>
      </div>

      <!-- 精选文章 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h2 class="font-bold text-gray-900 mb-3">⭐ 精选文章</h2>
        <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>
        <div v-else class="space-y-4">
          <article v-for="article in articles" :key="article.id" class="border-b border-gray-100 pb-3 last:border-0">
            <h3 class="text-sm font-medium text-gray-900 mb-2">{{ article.title }}</h3>
            <div class="flex items-center gap-3 text-xs text-gray-500">
              <span>{{ article.author }}</span>
              <span>❤️ {{ article.likes }}</span>
              <span>💬 {{ article.comments }}</span>
            </div>
          </article>
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
const topics = ref([])
const users = ref([])
const articles = ref([])

const loadDiscoverData = async () => {
  try {
    const res = await fetch('/api/discover')
    const data = await res.json()
    if (data.success) {
      topics.value = data.data.topics
      users.value = data.data.users
      articles.value = data.data.articles
    }
  } catch (err) {
    console.error('加载发现数据失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDiscoverData()
})
</script>
