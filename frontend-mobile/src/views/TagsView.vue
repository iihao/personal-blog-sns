<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3">
        <h1 class="text-lg font-bold text-gray-900">标签</h1>
      </div>
    </header>

    <main class="px-4 py-4">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>

      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="tag in tags"
          :key="tag.name"
          @click="$router.push(`/tags/${tag.name}`)"
          class="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 touch-feedback"
        >
          <span class="font-medium text-gray-900">{{ tag.name }}</span>
          <span class="text-xs text-gray-500 ml-1">({{ tag.count }})</span>
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

const tags = ref([])
const loading = ref(true)

const loadTags = async () => {
  try {
    const res = await fetch('/api/posts/tags')
    const data = await res.json()
    tags.value = data.tags || []
  } catch (error) {
    console.error('加载标签失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
