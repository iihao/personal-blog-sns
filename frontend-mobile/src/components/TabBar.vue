<template>
  <nav class="tabbar">
    <div class="tabbar-inner">
      <!-- 首页 -->
      <button @click="$router.push('/')" class="tab-item touch-feedback">
        <svg class="tab-icon" :class="activeTab === 'home' ? 'text-primary-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="tab-label" :class="activeTab === 'home' ? 'text-primary-500 font-medium' : 'text-gray-400'">首页</span>
      </button>
      
      <!-- 发现 -->
      <button @click="$router.push('/discover')" class="tab-item touch-feedback">
        <svg class="tab-icon" :class="activeTab === 'discover' ? 'text-primary-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="tab-label" :class="activeTab === 'discover' ? 'text-primary-500 font-medium' : 'text-gray-400'">发现</span>
      </button>
      
      <!-- 消息 -->
      <button @click="$router.push('/messages')" class="tab-item touch-feedback">
        <svg class="tab-icon" :class="activeTab === 'messages' ? 'text-primary-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span class="tab-label" :class="activeTab === 'messages' ? 'text-primary-500 font-medium' : 'text-gray-400'">消息</span>
      </button>
      
      <!-- 我的 -->
      <button @click="$router.push('/user')" class="tab-item touch-feedback">
        <svg class="tab-icon" :class="activeTab === 'user' ? 'text-primary-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="tab-label" :class="activeTab === 'user' ? 'text-primary-500 font-medium' : 'text-gray-400'">我的</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeTab = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path === '/discover' || path.startsWith('/discover/')) return 'discover'
  if (path === '/messages' || path.startsWith('/messages/')) return 'messages'
  if (path === '/user' || path.startsWith('/user/')) return 'user'
  return 'home'
})
</script>

<style scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #f3f4f6;
  z-index: 50;
  padding-bottom: env(safe-area-inset-bottom);
}

.tabbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 50px;
  padding: 4px 0;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 8px;
  min-width: 60px;
  background: none;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.tab-icon {
  width: 22px;
  height: 22px;
}

.tab-label {
  font-size: 10px;
  line-height: 1;
}

.touch-feedback {
  transition: transform 0.1s;
}

.touch-feedback:active {
  transform: scale(0.95);
}
</style>
