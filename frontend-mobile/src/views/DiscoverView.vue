<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <!-- 顶部搜索栏 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3">
        <div class="flex items-center gap-3">
          <h1 class="text-lg font-bold text-gray-900">发现</h1>
          <div class="flex-1"></div>
          <button class="p-2 touch-feedback">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="px-4 py-4 space-y-4">
      <!-- 热门话题 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-bold text-gray-900">🔥 热门话题</h2>
          <button class="text-sm text-gray-500 touch-feedback">查看更多</button>
        </div>
        <div class="space-y-3">
          <div v-for="(topic, index) in hotTopics" :key="topic.id" class="flex items-start gap-3">
            <span :class="index < 3 ? 'text-red-500 font-bold' : 'text-gray-400'" class="text-lg w-6">
              {{ index + 1 }}
            </span>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 line-clamp-2">{{ topic.title }}</p>
              <div class="flex items-center gap-4 mt-1">
                <span class="text-xs text-gray-500">{{ topic.views }}万阅读</span>
                <span class="text-xs text-gray-500">{{ topic.posts }}讨论</span>
              </div>
            </div>
            <span v-if="topic.hot" class="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded">热</span>
          </div>
        </div>
      </div>

      <!-- 推荐关注 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-bold text-gray-900">👥 推荐关注</h2>
          <button class="text-sm text-gray-500 touch-feedback">换一批</button>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="user in recommendedUsers" :key="user.id" class="text-center">
            <div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xl font-bold mb-2">
              {{ user.avatar || user.name.charAt(0) }}
            </div>
            <p class="text-sm font-medium text-gray-900 truncate">{{ user.name }}</p>
            <p class="text-xs text-gray-500 mb-2">{{ user.followers }}粉丝</p>
            <button class="w-full py-1.5 text-xs bg-blue-500 text-white rounded-full touch-feedback">
              关注
            </button>
          </div>
        </div>
      </div>

      <!-- 精选文章 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-bold text-gray-900">⭐ 精选文章</h2>
          <button class="text-sm text-gray-500 touch-feedback">查看更多</button>
        </div>
        <div class="space-y-4">
          <article v-for="article in featuredArticles" :key="article.id" class="flex gap-3">
            <div class="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex-shrink-0"></div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-2">{{ article.title }}</h3>
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xs">
                  {{ article.author.charAt(0) }}
                </div>
                <span class="text-xs text-gray-600">{{ article.author }}</span>
              </div>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-xs text-gray-500 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {{ article.likes }}
                </span>
                <span class="text-xs text-gray-500 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 14.042 3 12.574 3 11c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {{ article.comments }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- 精彩图片 -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-bold text-gray-900">📷 精彩瞬间</h2>
          <button class="text-sm text-gray-500 touch-feedback">查看更多</button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div v-for="photo in photos" :key="photo.id" class="aspect-square rounded-lg bg-gradient-to-br from-pink-500 to-rose-600"></div>
        </div>
      </div>

      <!-- 活动公告 -->
      <div class="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-4 shadow-sm text-white">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-bold mb-1">🎉 新用户福利</h3>
            <p class="text-sm opacity-90 mb-2">注册即送 100 积分，签到再领更多好礼！</p>
            <button class="px-4 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-full touch-feedback">
              立即参与
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TabBar from '../components/TabBar.vue'

// 热门话题
const hotTopics = ref([
  { id: 1, title: 'AI 技术如何改变我们的生活？', views: 125.8, posts: 2341, hot: true },
  { id: 2, title: '分享你的编程学习路线', views: 98.5, posts: 1876, hot: true },
  { id: 3, title: '2026 年最值得关注的科技趋势', views: 87.3, posts: 1543, hot: true },
  { id: 4, title: '如何保持工作与生活的平衡', views: 65.2, posts: 987, hot: false },
  { id: 5, title: '推荐几本好书', views: 52.1, posts: 756, hot: false },
])

// 推荐用户
const recommendedUsers = ref([
  { id: 1, name: '科技达人', avatar: '科', followers: 12.5 },
  { id: 2, name: '编程小白', avatar: '编', followers: 8.3 },
  { id: 3, name: '生活家', avatar: '生', followers: 15.2 },
  { id: 4, name: '摄影师', avatar: '摄', followers: 20.1 },
  { id: 5, name: '旅行者', avatar: '旅', followers: 18.7 },
  { id: 6, name: '美食家', avatar: '美', followers: 25.3 },
])

// 精选文章
const featuredArticles = ref([
  { 
    id: 1, 
    title: '从零开始学习 Vue 3：完整指南', 
    author: '前端大神', 
    likes: 1234, 
    comments: 89 
  },
  { 
    id: 2, 
    title: '2026 年前端开发趋势预测', 
    author: '技术观察', 
    likes: 987, 
    comments: 56 
  },
  { 
    id: 3, 
    title: '如何成为一名优秀的全栈工程师', 
    author: '职场导师', 
    likes: 756, 
    comments: 42 
  },
])

// 精彩图片
const photos = ref([
  { id: 1 }, { id: 2 }, { id: 3 },
  { id: 4 }, { id: 5 }, { id: 6 },
  { id: 7 }, { id: 8 }, { id: 9 },
])
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.98); }
</style>
