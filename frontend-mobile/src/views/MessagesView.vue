<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-bold text-gray-900">消息</h1>
          <div class="flex items-center gap-3">
            <button class="p-2 touch-feedback">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button class="p-2 touch-feedback relative">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main>
      <!-- 消息分类 Tab -->
      <div class="sticky top-[57px] z-40 bg-white border-b border-gray-100 safe-area-top">
        <div class="flex">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="currentTab = tab.id"
            :class="currentTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
            class="flex-1 py-3 text-sm font-medium text-center touch-feedback"
          >
            {{ tab.name }}
            <span v-if="tab.count > 0" class="ml-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
              {{ tab.count }}
            </span>
          </button>
        </div>
      </div>

      <div class="px-4 py-4">
        <!-- 互动消息 -->
        <div v-if="currentTab === 'interactions'" class="space-y-4">
          <div v-for="msg in interactionMessages" :key="msg.id" class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {{ msg.avatar || msg.username.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">{{ msg.username }}</p>
                <span class="text-xs text-gray-400">{{ msg.time }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ msg.content }}</p>
              <div v-if="msg.type === 'like' || msg.type === 'comment'" class="mt-2 p-3 bg-gray-50 rounded-lg">
                <p class="text-xs text-gray-500 line-clamp-1">{{ msg.postTitle }}</p>
              </div>
            </div>
            <button v-if="msg.type === 'follow'" class="px-4 py-1.5 text-xs bg-blue-500 text-white rounded-full touch-feedback">
              回关
            </button>
          </div>
        </div>

        <!-- 评论消息 -->
        <div v-if="currentTab === 'comments'" class="space-y-4">
          <div v-for="msg in commentMessages" :key="msg.id" class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {{ msg.avatar || msg.username.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">{{ msg.username }}</p>
                <span class="text-xs text-gray-400">{{ msg.time }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ msg.content }}</p>
              <div class="mt-2 p-3 bg-gray-50 rounded-lg">
                <p class="text-xs text-gray-500 line-clamp-2">{{ msg.replyTo || msg.postTitle }}</p>
              </div>
              <div class="flex items-center gap-4 mt-2">
                <button class="text-xs text-gray-500 touch-feedback">回复</button>
                <button class="text-xs text-gray-500 touch-feedback">删除</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 点赞消息 -->
        <div v-if="currentTab === 'likes'" class="space-y-4">
          <div v-for="msg in likeMessages" :key="msg.id" class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {{ msg.avatar || msg.username.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">{{ msg.username }}</p>
                <span class="text-xs text-gray-400">{{ msg.time }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ msg.content }}</p>
              <div class="mt-2 p-3 bg-gray-50 rounded-lg">
                <p class="text-xs text-gray-500 line-clamp-1">{{ msg.postTitle }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 系统消息 -->
        <div v-if="currentTab === 'system'" class="space-y-4">
          <div v-for="msg in systemMessages" :key="msg.id" class="bg-white rounded-xl p-4 shadow-sm">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white flex-shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900">{{ msg.title }}</p>
                  <span class="text-xs text-gray-400">{{ msg.time }}</span>
                </div>
                <p class="text-sm text-gray-600 mt-1">{{ msg.content }}</p>
                <button v-if="msg.action" class="mt-2 px-4 py-1.5 text-xs bg-blue-500 text-white rounded-full touch-feedback">
                  {{ msg.action }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="isEmpty" class="text-center py-16">
          <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p class="text-gray-500">暂无消息</p>
        </div>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TabBar from '../components/TabBar.vue'

const currentTab = ref('interactions')

const tabs = ref([
  { id: 'interactions', name: '互动', count: 3 },
  { id: 'comments', name: '评论', count: 5 },
  { id: 'likes', name: '赞', count: 12 },
  { id: 'system', name: '系统', count: 1 },
])

// 互动消息
const interactionMessages = ref([
  { 
    id: 1, 
    username: '张三', 
    avatar: '张',
    content: '关注了你', 
    time: '刚刚',
    type: 'follow'
  },
  { 
    id: 2, 
    username: '李四', 
    avatar: '李',
    content: '评论了你的文章', 
    time: '10 分钟前',
    type: 'comment',
    postTitle: '从零开始学习 Vue 3：完整指南'
  },
  { 
    id: 3, 
    username: '王五', 
    avatar: '王',
    content: '点赞了你的文章', 
    time: '1 小时前',
    type: 'like',
    postTitle: '2026 年前端开发趋势预测'
  },
])

// 评论消息
const commentMessages = ref([
  { 
    id: 1, 
    username: '编程小白', 
    avatar: '编',
    content: '这篇文章写得太好了！学到了很多，感谢分享！', 
    time: '5 分钟前',
    postTitle: '从零开始学习 Vue 3：完整指南'
  },
  { 
    id: 2, 
    username: '前端爱好者', 
    avatar: '前',
    content: '请问 Composition API 和 Options API 有什么区别？', 
    time: '30 分钟前',
    replyTo: '回复 @前端爱好者：Composition API 更灵活...'
  },
  { 
    id: 3, 
    username: '技术达人', 
    avatar: '技',
    content: '期待更多这样的干货文章！', 
    time: '2 小时前',
    postTitle: '2026 年前端开发趋势预测'
  },
])

// 点赞消息
const likeMessages = ref([
  { 
    id: 1, 
    username: '小明', 
    avatar: '小',
    content: '点赞了你的文章', 
    time: '3 分钟前',
    postTitle: '从零开始学习 Vue 3：完整指南'
  },
  { 
    id: 2, 
    username: '小红', 
    avatar: '小',
    content: '点赞了你的文章', 
    time: '15 分钟前',
    postTitle: '如何成为一名优秀的全栈工程师'
  },
])

// 系统消息
const systemMessages = ref([
  { 
    id: 1, 
    title: '欢迎加入', 
    content: '欢迎加入我们的社区！在这里你可以分享知识、交流经验、结识志同道合的朋友。', 
    time: '2026-03-20',
    action: '去看看'
  },
  { 
    id: 2, 
    title: '新手任务', 
    content: '完成新手任务，获取丰厚奖励！发布第一篇文章，获得 100 积分。', 
    time: '2026-03-19',
    action: '去完成'
  },
])

const isEmpty = computed(() => {
  if (currentTab.value === 'interactions') return interactionMessages.value.length === 0
  if (currentTab.value === 'comments') return commentMessages.value.length === 0
  if (currentTab.value === 'likes') return likeMessages.value.length === 0
  if (currentTab.value === 'system') return systemMessages.value.length === 0
  return false
})
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.98); }
</style>
