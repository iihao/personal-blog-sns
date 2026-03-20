<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3">
        <h1 class="text-lg font-bold text-gray-900">项目</h1>
      </div>
    </header>

    <main class="px-4 py-4">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="project in projects"
          :key="project.id"
          @click="$router.push(`/projects/${project.id}`)"
          class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 touch-feedback"
        >
          <h3 class="font-bold text-gray-900">{{ project.title }}</h3>
          <p class="text-sm text-gray-500 mt-2 line-clamp-2">{{ project.description }}</p>
          <div class="flex items-center gap-2 mt-3">
            <span v-if="project.tags" class="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded">{{ project.tags }}</span>
            <span class="text-xs text-gray-400">{{ formatDate(project.created_at) }}</span>
          </div>
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
import { useRouter } from 'vue-router'

const router = useRouter()
const projects = ref([])
const loading = ref(true)

const loadProjects = async () => {
  try {
    const res = await fetch('/api/projects')
    const data = await res.json()
    projects.value = data.projects || []
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
  loadProjects()
})
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
