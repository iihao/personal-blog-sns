<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3">
        <h1 class="text-lg font-bold text-gray-900">分类</h1>
      </div>
    </header>

    <main class="px-4 py-4">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>

      <div v-else class="grid grid-cols-2 gap-3">
        <button
          v-for="cat in categories"
          :key="cat.name"
          @click="$router.push(`/categories/${cat.name}`)"
          class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 touch-feedback text-left"
        >
          <h3 class="font-bold text-gray-900">{{ cat.name }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ cat.count }} 篇文章</p>
        </button>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <TabBar />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TabBar from '../components/TabBar.vue'

const categories = ref([])
const loading = ref(true)

const loadCategories = async () => {
  try {
    const res = await fetch('/api/posts/categories')
    const data = await res.json()
    categories.value = data.categories || []
  } catch (error) {
    console.error('加载分类失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
