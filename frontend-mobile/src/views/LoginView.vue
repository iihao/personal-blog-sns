<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 pb-[56px]">
    <!-- 返回按钮 -->
    <header class="sticky top-0 z-50 safe-area-top">
      <div class="px-4 py-3">
        <button @click="$router.back()" class="p-2 touch-feedback">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </header>

    <main class="px-4 py-8">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-auto">
        <div class="text-center mb-6">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">欢迎回来</h1>
          <p class="text-sm text-gray-500 mt-2">登录后探索更多精彩内容</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">账号</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                v-model="formData.username"
                type="text"
                placeholder="用户名或邮箱"
                required
                class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                v-model="formData.password"
                type="password"
                placeholder="请输入密码"
                required
                class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2">
              <input type="checkbox" class="w-4 h-4 text-purple-600 rounded" />
              <span class="text-gray-600">记住我</span>
            </label>
            <a href="#" class="text-purple-600 hover:text-purple-700">忘记密码？</a>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold touch-feedback disabled:opacity-50 shadow-lg"
          >
            {{ isLoading ? '登录中...' : '立即登录' }}
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-gray-100">
          <p class="text-sm text-center text-gray-500">
            还没有账号？
            <router-link to="/register" class="text-purple-600 font-medium hover:text-purple-700">立即注册</router-link>
          </p>
        </div>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TabBar from '../components/TabBar.vue'

const router = useRouter()
const isLoading = ref(false)
const formData = ref({ username: '', password: '' })

const handleLogin = async () => {
  isLoading.value = true
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })
    const data = await res.json()
    
    if (data.success || data.token) {
      const token = data.token || data.data?.token
      localStorage.setItem('token', token)
      sessionStorage.clear()
      window.location.href = '/'
    } else {
      alert(data.error || data.message || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
