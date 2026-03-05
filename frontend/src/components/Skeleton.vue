<template>
  <div class="skeleton-wrapper" :style="{ width, height }">
    <div class="skeleton" :class="variant"></div>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'rect', // rect, circle, text
    validator: (v) => ['rect', 'circle', 'text'].includes(v)
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '20px'
  }
})
</script>

<style scoped>
.skeleton-wrapper {
  display: inline-block;
  overflow: hidden;
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--border-color) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

.skeleton.rect {
  border-radius: 12px;
}

.skeleton.circle {
  border-radius: 50%;
}

.skeleton.text {
  border-radius: 4px;
  height: 16px !important;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
