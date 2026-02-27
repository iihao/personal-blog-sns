<template>
  <div class="markdown-editor">
    <div class="editor-toolbar">
      <button @click="insertBold" title="粗体"><i class="fas fa-bold"></i></button>
      <button @click="insertItalic" title="斜体"><i class="fas fa-italic"></i></button>
      <button @click="insertHeading" title="标题"><i class="fas fa-heading"></i></button>
      <button @click="insertLink" title="链接"><i class="fas fa-link"></i></button>
      <button @click="insertImage" title="图片"><i class="fas fa-image"></i></button>
      <button @click="insertCode" title="代码块"><i class="fas fa-code"></i></button>
      <button @click="insertQuote" title="引用"><i class="fas fa-quote-left"></i></button>
      <button @click="insertList" title="列表"><i class="fas fa-list"></i></button>
      <button @click="togglePreview" :class="{ active: showPreview }" title="预览">
        <i class="fas fa-eye"></i>
      </button>
    </div>

    <div class="editor-container" :class="{ 'preview-mode': showPreview }">
      <textarea 
        v-model="content"
        @input="handleInput"
        placeholder="输入 Markdown 内容..."
        class="editor-textarea"
      ></textarea>
      
      <div v-show="showPreview" class="editor-preview">
        <MarkdownPreview :content="content" />
      </div>
    </div>

    <div class="editor-footer">
      <span class="char-count">{{ charCount }} 字</span>
      <span class="read-time">阅读约 {{ readTime }} 分钟</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MarkdownPreview from './MarkdownPreview.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const content = ref(props.modelValue)
const showPreview = ref(false)

const charCount = computed(() => content.value.length)
const readTime = computed(() => Math.ceil(content.value.length / 300) || 1)

const handleInput = () => {
  emit('update:modelValue', content.value)
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const insertAtCursor = (before, after = '') => {
  const textarea = document.querySelector('.editor-textarea')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = content.value
  const selected = text.substring(start, end)

  content.value = text.substring(0, start) + before + selected + after + text.substring(end)
  emit('update:modelValue', content.value)

  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
  }, 0)
}

const insertBold = () => insertAtCursor('**', '**')
const insertItalic = () => insertAtCursor('*', '*')
const insertHeading = () => insertAtCursor('### ')
const insertLink = () => insertAtCursor('[', '](url)')
const insertImage = () => insertAtCursor('![alt](', ')')
const insertCode = () => insertAtCursor('```\n', '\n```')
const insertQuote = () => insertAtCursor('> ')
const insertList = () => insertAtCursor('- ')
</script>

<style scoped>
.markdown-editor {
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: 0 2px 8px var(--shadow-color);
}

.editor-toolbar {
  display: flex;
  gap: 4px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.editor-toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.editor-toolbar button:hover {
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-primary);
}

.editor-toolbar button.active {
  background: var(--accent-primary);
  color: white;
}

.editor-toolbar button i {
  font-size: 1rem;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 450px;
}

.editor-container.preview-mode {
  grid-template-columns: 1fr 1fr;
}

.editor-textarea {
  width: 100%;
  min-height: 450px;
  padding: 20px;
  border: none;
  resize: vertical;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 0.95rem;
  line-height: 1.7;
  background: transparent;
  color: var(--text-primary);
}

.editor-textarea::placeholder {
  color: var(--text-tertiary);
}

.editor-textarea:focus {
  outline: none;
}

.editor-preview {
  padding: 20px;
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
  max-height: 600px;
  background: var(--bg-secondary);
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.char-count, .read-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 响应式 */
@media (max-width: 640px) {
  .editor-toolbar {
    padding: 8px;
  }

  .editor-toolbar button {
    width: 36px;
    height: 36px;
  }

  .editor-container.preview-mode {
    grid-template-columns: 1fr;
  }

  .editor-preview {
    border-left: none;
    border-top: 1px solid var(--border-color);
  }
}
</style>
