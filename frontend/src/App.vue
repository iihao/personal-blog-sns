<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <template v-if="!isAdminRoute">
      <Header />
      <main class="container mx-auto px-4 py-8 max-w-4xl">
        <router-view />
      </main>
      <Footer />
      <BackToTop />
    </template>
    <template v-else>
      <router-view />
    </template>
    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Toast from './components/Toast.vue'
import BackToTop from './components/BackToTop.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const toast = ref(null)

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
</style>