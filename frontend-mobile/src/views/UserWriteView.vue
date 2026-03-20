<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3 flex items-center gap-2">
        <button @click="$router.back()" class="p-2 -ml-2 touch-feedback">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-bold text-gray-900 flex-1">写文章</h1>
        <button @click="submitArticle" :disabled="isSubmitting" class="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium">
          {{ isSubmitting ? '发布中...' : '发布' }}
        </button>
      </div>
    </header>

    <main class="px-4 py-4 space-y-4">
      <!-- 标题 -->
      <input
        v-model="article.title"
        type="text"
        placeholder="输入文章标题..."
        class="w-full px-4 py-3 text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
      />

      <!-- 分类和标签 -->
      <div class="grid grid-cols-2 gap-3">
        <input
          v-model="article.category"
          type="text"
          placeholder="分类"
          class="px-4 py-3 border-2 border-gray-200 rounded-xl"
        />
        <input
          v-model="article.tags"
          type="text"
          placeholder="标签（用逗号分隔）"
          class="px-4 py-3 border-2 border-gray-200 rounded-xl"
        />
      </div>

      <!-- 内容 -->
      <textarea
        v-model="article.content"
        placeholder="开始写作..."
        rows="20"
        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
      ></textarea>

      <!-- 选项 -->
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <h3 class="font-bold text-gray-900 mb-3">发布选项</h3>
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input v-model="article.status" type="radio" value="published" class="w-4 h-4" />
            <span class="text-gray-700">立即发布</span>
          </label>
          <label class="flex items-center gap-3">
            <input v-model="article.status" type="radio" value="draft" class="w-4 h-4" />
            <span class="text-gray-700">保存为草稿</span>
          </label>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSubmitting = ref(false)
const article = ref({
  title: '',
  content: '',
  category: '',
  tags: '',
  status: 'published'
})

const submitArticle = async () => {
  if (!article.value.title.trim() || !article.value.content.trim()) {
    alert('请填写标题和内容')
    return
  }

  isSubmitting.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...article.value,
        tags: article.value.tags.split(/[,,]/).map(t => t.trim()).filter(Boolean).join(',')
      })
    })
    const data = await res.json()
    
    if (data.success || data.id) {
      alert('发布成功！')
      router.push(`/post/${data.id || data.data?.id}`)
    } else {
      alert(data.error || data.message || '发布失败')
    }
  } catch (error) {
    console.error('发布失败:', error)
    alert('发布失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
