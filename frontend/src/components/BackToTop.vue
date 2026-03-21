<template>
  <button 
    v-show="visible" 
    class="back-to-top"
    @click="scrollToTop"
    :style="{ opacity: visible ? 1 : 0 }"
    title="返回顶部"
  >
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const scrollThreshold = 300

const handleScroll = () => {
  visible.value = window.scrollY > scrollThreshold
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-to-top:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.6);
}

.back-to-top:active {
  transform: translateY(-2px);
}

.back-to-top svg {
  width: 24px;
  height: 24px;
}

@media (max-width: 768px) {
  .back-to-top {
    bottom: 80px;
    right: 20px;
    width: 44px;
    height: 44px;
  }
  
  .back-to-top svg {
    width: 20px;
    height: 20px;
  }
}

/* 深色模式适配 */
:global(.dark) .back-to-top {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  box-shadow: 0 4px 12px rgba(90, 103, 216, 0.4);
}

:global(.dark) .back-to-top:hover {
  box-shadow: 0 8px 20px rgba(90, 103, 216, 0.6);
}
</style>
