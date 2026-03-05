<template>
  <div class="toast-container" v-if="visible">
    <div class="toast" :class="[type, position]">
      <div class="toast-content">
        <i v-if="showIcon" :class="iconClass"></i>
        <span class="toast-message">{{ message }}</span>
      </div>
      <button v-if="showClose" class="toast-close" @click="close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'].includes(value)
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const visible = ref(false)

const iconClass = computed(() => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return icons[props.type]
})

const close = () => {
  visible.value = false
  setTimeout(() => {
    emit('close')
  }, 300)
}

const show = () => {
  visible.value = true
  if (props.duration > 0) {
    setTimeout(close, props.duration)
  }
}

// 暴露方法给父组件调用
defineExpose({
  show,
  close
})

onMounted(() => {
  show()
})

onUnmounted(() => {
  visible.value = false
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  font-size: 14px;
  font-weight: 500;
  pointer-events: auto;
  transform: translateX(0) translateY(0);
  transition: all 0.3s ease;
  max-width: 90vw;
}

/* Position classes */
.toast.top-right {
  top: 20px;
  right: 20px;
}

.toast.top-left {
  top: 20px;
  left: 20px;
}

.toast.bottom-right {
  bottom: 20px;
  right: 20px;
}

.toast.bottom-left {
  bottom: 20px;
  left: 20px;
}

.toast.top-center {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.toast.bottom-center {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

/* Type colors */
.toast.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.toast.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.toast.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.toast.info {
  background: linear-gradient(135deg, #667eea, #4f46e5);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.toast-message {
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 16px;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .toast {
    padding: 10px 16px;
    font-size: 13px;
    max-width: calc(100vw - 40px);
  }
  
  .toast.top-center,
  .toast.bottom-center {
    left: 20px;
    right: 20px;
    transform: none;
    max-width: calc(100vw - 40px);
  }
}
</style>