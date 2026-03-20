<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3">
        <h1 class="text-lg font-bold text-gray-900">更新日志</h1>
      </div>
    </header>

    <main class="px-4 py-4">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>

      <div v-else class="space-y-4">
        <div v-for="version in changelog" :key="version.version" class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold text-lg text-gray-900">{{ version.version }}</h3>
            <span class="text-xs text-gray-500">{{ version.date }}</span>
          </div>
          <ul class="space-y-1">
            <li v-for="(change, index) in version.changes" :key="index" class="text-sm text-gray-600 flex items-start gap-2">
              <span class="text-primary-500 mt-0.5">•</span>
              <span>{{ change }}</span>
            </li>
          </ul>
        </div>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <TabBar />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TabBar from '../components/TabBar.vue'

const changelog = ref([])
const loading = ref(true)

const loadChangelog = async () => {
  try {
    const res = await fetch('/api/changelog')
    const data = await res.json()
    changelog.value = data.changelog || []
  } catch (error) {
    console.error('加载更新日志失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadChangelog()
})
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
