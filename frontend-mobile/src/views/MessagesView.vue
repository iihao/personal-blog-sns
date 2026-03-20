<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-bold text-gray-900">消息</h1>
        <button v-if="unreadCount > 0" class="text-xs text-blue-600">全部已读</button>
      </div>
    </header>

    <!-- Tab 切换 -->
    <div class="sticky top-[57px] z-40 bg-white border-b border-gray-100">
      <div class="flex">
        <button v-for="tab in tabs" :key="tab.id" @click="currentTab = tab.id"
          :class="currentTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
          class="flex-1 py-3 text-sm font-medium">
          {{ tab.name }}
          <span v-if="tab.count > 0" class="ml-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <main class="px-4 py-4">
      <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>
      <div v-else-if="messages.length === 0" class="text-center py-16 text-gray-500">
        <div class="text-6xl mb-4">💬</div>
        <p>暂无消息</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="msg in messages" :key="msg.id" class="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
            {{ (msg.username || '用').charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900">{{ msg.username || '匿名用户' }}</p>
              <span class="text-xs text-gray-400">{{ msg.time || '刚刚' }}</span>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ msg.content || msg.title }}</p>
            <p v-if="msg.postTitle" class="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">{{ msg.postTitle }}</p>
          </div>
        </div>
      </div>
    </main>

    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TabBar from '../components/TabBar.vue'

const currentTab = ref('system')
const loading = ref(true)
const messages = ref([])
const unreadCount = ref(0)

const tabs = computed(() => [
  { id: 'interactions', name: '互动', count: 0 },
  { id: 'comments', name: '评论', count: 0 },
  { id: 'likes', name: '赞', count: 0 },
  { id: 'system', name: '系统', count: 0 }
])

const loadMessages = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    
    const res = await fetch(`/api/messages/${currentTab.value}`, { headers })
    const data = await res.json()
    
    if (data.success) {
      messages.value = data.messages || []
    } else {
      // 未授权时显示默认消息
      messages.value = [
        { id: 1, title: '欢迎加入', content: '欢迎加入我们的社区！', time: '2026-03-20' },
        { id: 2, title: '新手任务', content: '完成新手任务获取奖励！', time: '2026-03-19' }
      ]
    }
  } catch (err) {
    console.error('加载消息失败:', err)
    messages.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMessages()
})
</script>
