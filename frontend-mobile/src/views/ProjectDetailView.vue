<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3 flex items-center gap-2">
        <button @click="$router.back()" class="p-2 -ml-2 touch-feedback">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-bold text-gray-900 flex-1">项目详情</h1>
      </div>
    </header>

    <main class="px-4 py-4">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>

      <div v-else-if="project" class="bg-white rounded-xl p-4 shadow-sm">
        <h1 class="text-xl font-bold text-gray-900 mb-2">{{ project.title }}</h1>
        <div class="flex items-center gap-2 mb-4">
          <span v-if="project.tags" class="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded">{{ project.tags }}</span>
          <span class="text-xs text-gray-400">{{ formatDate(project.created_at) }}</span>
        </div>
        
        <div v-if="project.image" class="mb-4 rounded-lg overflow-hidden">
          <img :src="project.image" :alt="project.title" class="w-full h-48 object-cover" />
        </div>
        
        <div class="prose max-w-none">
          <p class="text-gray-700 whitespace-pre-line">{{ project.description }}</p>
        </div>
        
        <div v-if="project.link" class="mt-4 pt-4 border-t border-gray-100">
          <a :href="project.link" target="_blank" class="inline-flex items-center gap-2 text-primary-600 font-medium">
            <span>查看项目</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const project = ref(null)
const loading = ref(true)

const loadProject = async () => {
  try {
    const res = await fetch(`/api/projects/${route.params.id}`)
    const data = await res.json()
    project.value = data.project || data
  } catch (error) {
    console.error('加载项目失败:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  loadProject()
})
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
