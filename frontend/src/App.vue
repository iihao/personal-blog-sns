<template>
  <div id="app" class="app-container">
    <template v-if="!isAdminRoute">
      <Header />
      <div class="main-content-wrapper">
        <main class="main-content-inner">
          <router-view />
          <Footer />
        </main>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
    <Toast ref="toast" />
    <BackToTop v-if="!isAdminRoute" />
  </div>
</template>

<script setup>
import { computed, ref, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Toast from './components/Toast.vue'
import BackToTop from './components/BackToTop.vue'

const route = useRoute()
const router = useRouter()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const toast = ref(null)

// 路由跳转时滚动到顶部
router.afterEach((to, from) => {
  if (to.path !== from.path) {
    const wrapper = document.querySelector('.main-content-wrapper')
    if (wrapper) {
      wrapper.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
})

// 全局提供 toast 方法
const $toast = {
  show: (message, type = 'info', duration = 3000) => {
    if (toast.value) {
      return toast.value.show(message, type, duration)
    }
  },
  success: (message, duration = 3000) => {
    if (toast.value) {
      return toast.value.success(message, duration)
    }
  },
  error: (message, duration = 3000) => {
    if (toast.value) {
      return toast.value.error(message, duration)
    }
  },
  warning: (message, duration = 3000) => {
    if (toast.value) {
      return toast.value.warning(message, duration)
    }
  },
  info: (message, duration = 3000) => {
    if (toast.value) {
      return toast.value.info(message, duration)
    }
  },
  loading: (message) => {
    if (toast.value) {
      return toast.value.loading(message)
    }
  },
  closeLoading: (id) => {
    if (toast.value) {
      toast.value.closeLoading(id)
    }
  }
}

// 将 toast 挂载到全局
if (typeof window !== 'undefined') {
  window.$toast = $toast
}
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 应用容器 - 全屏高度 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 主内容包装器 - 占据剩余空间并滚动 */
.main-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* 自定义滚动条样式 - main-content-wrapper */
.main-content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.main-content-wrapper::-webkit-scrollbar-track {
  background: #f5f5f7;
}

.main-content-wrapper::-webkit-scrollbar-thumb {
  background: #d2d2d7;
  border-radius: 4px;
}

.main-content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #86868b;
}

/* 暗黑模式滚动条 */
.dark .main-content-wrapper::-webkit-scrollbar-track {
  background: #1c1c1e;
}

.dark .main-content-wrapper::-webkit-scrollbar-thumb {
  background: #38383a;
}

.dark .main-content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #636366;
}

/* 主内容区 - 不滚动，自适应高度 */
.main-content-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
</style>