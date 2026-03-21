<template>
  <div class="reading-progress-bar" :style="{ opacity: show ? 1 : 0 }">
    <div class="progress-fill" :style="{ width: progress + '%' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const progress = ref(0)
const show = ref(false)

const updateProgress = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const scrollPercent = scrollTop / docHeight
  
  progress.value = Math.min(100, Math.max(0, scrollPercent * 100))
  show.value = scrollTop > 100
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress)
  updateProgress()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<style scoped>
.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: opacity 0.3s;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.1s ease-out;
}

:global(.dark) .reading-progress-bar {
  background: rgba(255, 255, 255, 0.1);
}

:global(.dark) .progress-fill {
  background: linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%);
}
</style>
