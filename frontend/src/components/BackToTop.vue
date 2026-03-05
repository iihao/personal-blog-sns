<template>
  <button
    v-show="visible"
    @click="scrollToTop"
    class="back-to-top"
    :class="{ 'visible': visible }"
    aria-label="回到顶部"
  >
    <i class="fas fa-arrow-up"></i>
  </button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const visible = ref(false)
const scrollThreshold = 300 // 滚动超过 300px 显示

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
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // 初始检查
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: -60px;
  right: 32px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  opacity: 0;
}

.back-to-top.visible {
  bottom: 32px;
  opacity: 1;
}

.back-to-top:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
}

.back-to-top:active {
  transform: translateY(-2px);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .back-to-top {
    right: 20px;
    bottom: -60px;
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  .back-to-top.visible {
    bottom: 20px;
  }
}
</style>
