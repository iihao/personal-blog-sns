<template>
  <div class="code-block-wrapper" :class="{ 'copied': showCopied }">
    <div class="code-header">
      <span class="language-label" v-if="language">{{ language }}</span>
      <button class="copy-btn" @click="copyCode" title="复制代码">
        <svg v-if="!showCopied" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="copy-text">{{ showCopied ? '已复制' : '复制' }}</span>
      </button>
    </div>
    <div class="code-content-wrapper">
      <div class="line-numbers" v-if="showLineNumbers">
        <span v-for="n in lineCount" :key="n">{{ n }}</span>
      </div>
      <pre class="code-content"><code :class="`language-${language}`"><slot></slot></code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: ''
  },
  showLineNumbers: {
    type: Boolean,
    default: true
  },
  code: {
    type: String,
    default: ''
  }
})

const showCopied = ref(false)
const lineCount = computed(() => {
  const slots = useSlots()
  const codeSlot = slots.default?.()
  const codeText = codeSlot?.[0]?.children || props.code || ''
  return codeText.split('\n').length
})

const copyCode = async () => {
  const slots = useSlots()
  const codeSlot = slots.default?.()
  const codeText = codeSlot?.[0]?.children || props.code || ''
  
  try {
    await navigator.clipboard.writeText(codeText)
    showCopied.value = true
    setTimeout(() => {
      showCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = codeText
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      showCopied.value = true
      setTimeout(() => {
        showCopied.value = false
      }, 2000)
    } catch (err2) {
      console.error('复制失败:', err2)
    }
    document.body.removeChild(textarea)
  }
}
</script>

<style scoped>
.code-block-wrapper {
  position: relative;
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #1e1e1e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
}

.language-label {
  font-size: 12px;
  color: #9cdcfe;
  font-weight: 600;
  text-transform: uppercase;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #9cdcfe;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #404040;
  border-color: #9cdcfe;
}

.copy-btn svg {
  width: 14px;
  height: 14px;
}

.copy-text {
  font-size: 12px;
}

.code-content-wrapper {
  display: flex;
  overflow-x: auto;
}

.line-numbers {
  display: flex;
  flex-direction: column;
  padding: 16px 8px;
  background: #2d2d2d;
  border-right: 1px solid #404040;
  user-select: none;
  min-width: 50px;
  text-align: right;
}

.line-numbers span {
  font-size: 14px;
  line-height: 1.6;
  color: #858585;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.code-content {
  flex: 1;
  padding: 16px;
  margin: 0;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.6;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  white-space: pre;
}

.code-content::-webkit-scrollbar,
.code-content-wrapper::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.code-content::-webkit-scrollbar-track,
.code-content-wrapper::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.code-content::-webkit-scrollbar-thumb,
.code-content-wrapper::-webkit-scrollbar-thumb {
  background: #404040;
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb:hover,
.code-content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #505050;
}

/* 复制成功动画 */
.code-block-wrapper.copied::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(76, 175, 80, 0.1);
  animation: flash 0.5s ease-out;
  pointer-events: none;
}

@keyframes flash {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* 深色模式适配 */
:global(.dark) .code-block-wrapper {
  background: #1a1a1a;
}

:global(.dark) .code-header {
  background: #252525;
  border-bottom-color: #3a3a3a;
}

:global(.dark) .line-numbers {
  background: #252525;
  border-right-color: #3a3a3a;
}
</style>
