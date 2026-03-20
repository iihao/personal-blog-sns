<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3">
        <h1 class="text-lg font-bold text-gray-900">我的</h1>
      </div>
    </header>

    <main class="px-4 py-4 space-y-4">
      <!-- 用户信息卡片 -->
      <div v-if="isLoggedIn" class="bg-white rounded-2xl p-4 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {{ user.username?.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-bold text-gray-900">{{ user.username }}</h2>
            <p class="text-sm text-gray-500">ID: {{ user.id }}</p>
          </div>
        </div>
        
        <!-- 快捷数据 -->
        <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div class="text-center">
            <p class="text-lg font-bold text-purple-600">{{ wallet.points }}</p>
            <p class="text-xs text-gray-500">积分</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-bold text-emerald-600">¥{{ wallet.balance?.toFixed(2) }}</p>
            <p class="text-xs text-gray-500">余额</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-bold text-amber-600">{{ checkin.streak }}</p>
            <p class="text-xs text-gray-500">连续签到</p>
          </div>
        </div>
      </div>

      <!-- 未登录提示 -->
      <div v-else class="bg-white rounded-2xl p-6 shadow-sm text-center">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">未登录</h3>
        <p class="text-sm text-gray-500 mb-4">登录后享受更多功能</p>
        <button @click="$router.push('/login')" class="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-medium touch-feedback">
          立即登录
        </button>
      </div>

      <!-- 功能菜单 -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <!-- 钱包入口 -->
        <button 
          v-if="isLoggedIn"
          @click="$router.push('/wallet')" 
          class="flex items-center gap-3 w-full p-4 border-b border-gray-100 touch-feedback"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="flex-1 text-left font-medium text-gray-900">钱包</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- 签到入口 -->
        <button 
          @click="$router.push('/checkin')" 
          class="flex items-center gap-3 w-full p-4 border-b border-gray-100 touch-feedback"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="flex-1 text-left font-medium text-gray-900">签到</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- 个人设置 -->
        <button 
          @click="$router.push('/settings')" 
          class="flex items-center gap-3 w-full p-4 border-b border-gray-100 touch-feedback"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span class="flex-1 text-left font-medium text-gray-900">个人设置</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- 写文章 -->
        <button 
          v-if="isLoggedIn"
          @click="$router.push('/write')" 
          class="flex items-center gap-3 w-full p-4 border-b border-gray-100 touch-feedback"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <span class="flex-1 text-left font-medium text-gray-900">写文章</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- 友情链接 -->
        <button 
          class="flex items-center gap-3 w-full p-4 border-b border-gray-100 touch-feedback"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <span class="flex-1 text-left font-medium text-gray-900">友情链接</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- 更新日志 -->
        <button 
          @click="$router.push('/changelog')" 
          class="flex items-center gap-3 w-full p-4 touch-feedback"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="flex-1 text-left font-medium text-gray-900">更新日志</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- 退出登录 -->
      <button 
        v-if="isLoggedIn"
        @click="doLogout" 
        class="w-full py-3 bg-white text-red-600 rounded-2xl font-medium shadow-sm touch-feedback mb-4"
      >
        退出登录
      </button>
    </main>

    <!-- 底部导航栏 -->
    <TabBar />

  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import TabBar from '../components/TabBar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isLoggedIn = ref(false)
const user = ref({ id: '', username: '' })
const wallet = ref({ balance: 0, points: 0 })
const checkin = ref({ streak: 0 })

const checkAuth = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    isLoggedIn.value = false
    user.value = { id: '', username: '' }
    wallet.value = { balance: 0, points: 0 }
    checkin.value = { streak: 0 }
    return
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) {
      isLoggedIn.value = true
      user.value = data.data
      await loadWallet()
      await loadCheckin()
    } else {
      // Token 失效，清除登录状态
      localStorage.removeItem('token')
      isLoggedIn.value = false
    }
  } catch (error) {
    console.error('检查登录状态失败:', error)
  }
}

const loadWallet = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/wallet/balance', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) {
      wallet.value = data.data
    }
  } catch (error) {
    console.error('加载钱包失败:', error)
  }
}

const loadCheckin = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/checkin/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) {
      checkin.value = { streak: data.data.currentStreak }
    }
  } catch (error) {
    console.error('加载签到状态失败:', error)
  }
}

const doLogout = () => {
  localStorage.removeItem('token')
  isLoggedIn.value = false
  user.value = { id: '', username: '' }
  wallet.value = { balance: 0, points: 0 }
  checkin.value = { streak: 0 }
  router.push('/')
}

onMounted(() => {
  checkAuth()
})
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
