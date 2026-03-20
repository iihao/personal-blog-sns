<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3">
        <h1 class="text-lg font-bold text-gray-900">博客</h1>
      </div>
    </header>

    <main class="px-4 py-4 space-y-4">
      <!-- 签到卡片 -->
      <div class="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 shadow-lg text-white">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-sm opacity-90">📅 {{ currentDate }}</p>
            <p class="text-2xl font-bold mt-1">{{ checkinInfo.checkedIn ? '今日已签到' : '等待签到' }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm opacity-90">连续签到</p>
            <p class="text-3xl font-bold">🔥 {{ checkinInfo.streak }}</p>
          </div>
        </div>
        <button 
          v-if="!checkinInfo.checkedIn"
          @click="doCheckin" 
          :disabled="checkinInfo.checkingIn"
          class="w-full py-2 bg-white text-purple-600 rounded-xl font-bold touch-feedback"
        >
          {{ checkinInfo.checkingIn ? '签到中...' : '立即签到' }}
        </button>
        <div v-else class="text-center py-2 bg-white/20 rounded-xl">
          <span>✅ 已获得 {{ checkinInfo.points }} 积分</span>
        </div>
      </div>

      <!-- 快捷功能入口 -->
      <div class="grid grid-cols-4 gap-3">
        <button @click="$router.push('/checkin')" class="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm touch-feedback">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="text-xs text-gray-700">签到</span>
        </button>
        <button @click="$router.push('/wallet')" class="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm touch-feedback">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="text-xs text-gray-700">钱包</span>
        </button>
        <button @click="$router.push('/categories')" class="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm touch-feedback">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <span class="text-xs text-gray-700">分类</span>
        </button>
        <button @click="$router.push('/tags')" class="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm touch-feedback">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <span class="text-xs text-gray-700">标签</span>
        </button>
      </div>

      <!-- 文章列表 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-lg text-gray-900">最新文章</h2>
          <button @click="loadPosts" class="text-sm text-primary-500 touch-feedback">
            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新
          </button>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-500">{{ error }}</p>
          <button 
            @click="loadPosts"
            class="mt-4 px-6 py-2 bg-primary-500 text-white rounded-full touch-feedback"
          >
            重试
          </button>
        </div>

        <div v-else class="space-y-4">
          <article 
            v-for="post in posts" 
            :key="post.id"
            @click="goToPost(post.id)"
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 touch-feedback"
          >
            <!-- 用户信息 -->
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {{ (post.author || 'A').charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-900">{{ post.author || '作者' }}</span>
                  <span class="text-xs text-gray-500">{{ formatDate(post.created_at) }}</span>
                </div>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-xs text-gray-400">移动端</span>
                  <span class="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">日常动态</span>
                </div>
              </div>
              <button class="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-full touch-feedback">关注</button>
            </div>

            <!-- 文章标题 -->
            <h3 class="text-base font-bold text-gray-900 mb-3 line-clamp-2">{{ post.title }}</h3>

            <!-- 内容概览 -->
            <div class="mb-3">
              <p class="text-sm text-gray-600 line-clamp-3">{{ stripHtml(post.content) }}</p>
            </div>

            <!-- 文章标签 -->
            <div class="flex flex-wrap gap-2 mb-3">
              <span v-if="post.category" class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                {{ post.category }}
              </span>
              <span v-if="post.tags" class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                {{ post.tags }}
              </span>
            </div>

            <!-- 底部互动栏 -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
              <div class="flex items-center gap-4">
                <button class="flex items-center gap-1.5 text-gray-500 hover:text-red-500 touch-feedback">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span class="text-xs">{{ post.likes || 0 }}</span>
                </button>
                <button class="flex items-center gap-1.5 text-gray-500 hover:text-primary-500 touch-feedback">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 14.042 3 12.574 3 11c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span class="text-xs">{{ post.comments || 0 }}</span>
                </button>
              </div>
              <button class="flex items-center gap-1.5 text-gray-500 hover:text-primary-500 touch-feedback">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span class="text-xs">分享</span>
              </button>
            </div>
          </article>

          <div v-if="posts.length === 0" class="text-center py-12">
            <p class="text-gray-500">暂无文章</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { postApi } from '../utils/api'
import TabBar from '../components/TabBar.vue'

const router = useRouter()
const route = useRoute()
const posts = ref([])
const loading = ref(true)
const error = ref(null)
const activeTab = ref('home')

// 签到信息
const checkinInfo = ref({
  checkedIn: false,
  streak: 0,
  points: 0,
  checkingIn: false
})

// 当前日期
const currentDate = ref('')

const loadPosts = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await postApi.getPosts()
    posts.value = Array.isArray(data) ? data : (data.posts || [])
  } catch (err) {
    error.value = '加载失败，请重试'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const loadCheckinStatus = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return
    
    const res = await fetch('/api/checkin/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) {
      checkinInfo.value.checkedIn = data.data.checkedInToday
      checkinInfo.value.streak = data.data.currentStreak
      checkinInfo.value.points = data.data.todayPoints
    }
  } catch (error) {
    console.error('加载签到状态失败:', error)
  }
}

const doCheckin = async () => {
  checkinInfo.value.checkingIn = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/checkin/do', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await res.json()
    if (data.success) {
      checkinInfo.value.checkedIn = true
      checkinInfo.value.points = data.data.points
      checkinInfo.value.streak = data.data.streak
      alert(`签到成功！获得 ${data.data.points} 积分`)
    }
  } catch (error) {
    console.error('签到失败:', error)
    alert('签到失败，请重试')
  } finally {
    checkinInfo.value.checkingIn = false
  }
}

const goToPost = (id) => {
  router.push(`/post/${id}`)
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
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const updateDate = () => {
  const now = new Date()
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  currentDate.value = now.toLocaleDateString('zh-CN', options)
}

const updateActiveTab = () => {
  const path = route.path
  if (path === '/') activeTab.value = 'home'
  else if (path === '/categories' || path.startsWith('/categories/')) activeTab.value = 'categories'
  else if (path === '/checkin') activeTab.value = 'leaderboard'
  else if (path === '/user') activeTab.value = 'user'
}

// 监听路由变化
watch(route, () => {
  updateActiveTab()
})

onMounted(() => {
  updateDate()
  updateActiveTab()
  loadPosts()
  loadCheckinStatus()
})
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
