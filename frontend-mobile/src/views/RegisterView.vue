<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">注册</h1>
      <p class="text-center text-gray-500 mb-6">创建新账号</p>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名"
            required
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="请输入邮箱"
            required
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            required
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold touch-feedback disabled:opacity-50"
        >
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          已有账号？
          <router-link to="/login" class="text-primary-600 font-medium">立即登录</router-link>
        </p>
      </div>

      <div class="mt-4 text-center">
        <router-link to="/" class="text-sm text-gray-500 hover:text-gray-700">
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const formData = ref({ username: '', email: '', password: '' })

const handleRegister = async () => {
  isLoading.value = true
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })
    const data = await res.json()
    
    if (data.success) {
      alert('注册成功！请登录')
      router.push('/login')
    } else {
      alert(data.error || data.message || '注册失败')
    }
  } catch (error) {
    console.error('注册失败:', error)
    alert('注册失败，请重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
