<template>
  <div class="dual-editor">
    <!-- 编辑器切换 -->
    <div class="editor-toolbar">
      <div class="editor-mode-switch">
        <button 
          :class="['mode-btn', { active: mode === 'markdown' }]"
          @click="switchMode('markdown')"
        >
          <i class="fab fa-markdown"></i> Markdown
        </button>
        <button 
          :class="['mode-btn', { active: mode === 'richText' }]"
          @click="switchMode('richText')"
        >
          <i class="fas fa-font"></i> 富文本
        </button>
      </div>
      <div class="editor-actions">
        <button 
          v-if="mode === 'markdown'"
          class="btn-preview"
          @click="togglePreview"
        >
          <i :class="showPreview ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          {{ showPreview ? '隐藏预览' : '预览' }}
        </button>
      </div>
    </div>

    <!-- Markdown 编辑器 -->
    <div v-if="mode === 'markdown'" class="markdown-editor-wrapper">
      <div class="markdown-editor-container" :class="{ 'split-view': showPreview }">
        <div class="editor-pane">
          <textarea
            ref="mdEditor"
            :value="content"
            @input="handleMarkdownInput"
            placeholder="使用 Markdown 格式编写内容..."
            class="markdown-editor"
          ></textarea>
        </div>
        <div v-if="showPreview" class="preview-pane">
          <div class="preview-header">预览</div>
          <div class="preview-content">
            <MarkdownPreview :content="content" />
          </div>
        </div>
      </div>
    </div>

    <!-- 富文本编辑器 -->
    <div v-else class="rich-text-editor-wrapper">
      <div ref="richTextEditor" class="rich-text-editor"></div>
    </div>

    <!-- 格式说明 -->
    <div class="editor-hint">
      <div v-if="mode === 'markdown'">
        <strong>Markdown 快捷键：</strong>
        <code>#</code> 标题 | 
        <code>**bold**</code> 粗体 | 
        <code>*italic*</code> 斜体 | 
        <code>[text](url)</code> 链接 | 
        <code>![alt](url)</code> 图片 | 
        <code>```</code> 代码块
      </div>
      <div v-else>
        <strong>富文本编辑器：</strong>
        使用工具栏格式化文本，支持插入图片、链接、代码块等
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import MarkdownPreview from './MarkdownPreview.vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  contentFormat: {
    type: String,
    default: 'markdown' // 'markdown' or 'richText'
  }
})

const emit = defineEmits(['update:modelValue', 'update:contentFormat', 'input'])

const mode = ref(props.contentFormat === 'richText' ? 'richText' : 'markdown')
const content = ref(props.modelValue)
const showPreview = ref(false)
const mdEditor = ref(null)
const richTextEditor = ref(null)
let quillInstance = null

// 切换编辑器模式
const switchMode = (newMode) => {
  if (mode.value === newMode) return
  
  mode.value = newMode
  emit('update:contentFormat', newMode)
  
  // 模式切换时同步内容
  if (newMode === 'richText' && quillInstance) {
    // Markdown 转 HTML（简单转换）
    quillInstance.root.innerHTML = simpleMarkdownToHtml(content.value)
  } else if (newMode === 'markdown') {
    // HTML 转 Markdown（简单转换）
    if (quillInstance) {
      content.value = simpleHtmlToMarkdown(quillInstance.root.innerHTML)
    }
  }
}

// 切换预览
const togglePreview = () => {
  showPreview.value = !showPreview.value
}

// Markdown 输入处理
const handleMarkdownInput = (e) => {
  content.value = e.target.value
  emit('update:modelValue', content.value)
  emit('input', content.value)
}

// 简单 Markdown 转 HTML（用于模式切换）
const simpleMarkdownToHtml = (md) => {
  if (!md) return ''
  
  let html = md
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // 链接
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
    // 图片
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" />')
    // 代码块
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // 行内代码
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // 换行
    .replace(/\n$/gim, '<br />')
  
  return html
}

// 简单 HTML 转 Markdown（用于模式切换）
const simpleHtmlToMarkdown = (html) => {
  if (!html) return ''
  
  let md = html
    // 标题
    .replace(/<h1>(.*?)<\/h1>/gim, '# $1\n')
    .replace(/<h2>(.*?)<\/h2>/gim, '## $1\n')
    .replace(/<h3>(.*?)<\/h3>/gim, '### $1\n')
    // 粗体
    .replace(/<strong>(.*?)<\/strong>/gim, '**$1**')
    .replace(/<b>(.*?)<\/b>/gim, '**$1**')
    // 斜体
    .replace(/<em>(.*?)<\/em>/gim, '*$1*')
    .replace(/<i>(.*?)<\/i>/gim, '*$1*')
    // 链接
    .replace(/<a href="(.*?)"[^>]*>(.*?)<\/a>/gim, '[$2]($1)')
    // 图片
    .replace(/<img src="(.*?)"[^>]*alt="(.*?)"[^>]*>/gim, '![$2]($1)')
    // 代码块
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gim, '```\n$1\n```')
    .replace(/<code>(.*?)<\/code>/gim, '`$1`')
    // 换行
    .replace(/<br \/>/gim, '\n')
    .replace(/<br>/gim, '\n')
    // 段落
    .replace(/<p>(.*?)<\/p>/gim, '$1\n\n')
  
  return md
}

// 监听外部内容变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== content.value) {
    content.value = newVal
    if (mode.value === 'richText' && quillInstance) {
      quillInstance.root.innerHTML = newVal
    }
  }
})

// 初始化富文本编辑器
onMounted(async () => {
  if (mode.value === 'richText' && richTextEditor.value) {
    quillInstance = new Quill(richTextEditor.value, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          ['blockquote', 'code-block'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      }
    })
    
    // 监听内容变化
    quillInstance.on('text-change', () => {
      const html = quillInstance.root.innerHTML
      content.value = html
      emit('update:modelValue', html)
      emit('input', html)
    })
    
    // 设置初始内容
    if (props.modelValue && props.contentFormat === 'richText') {
      quillInstance.root.innerHTML = props.modelValue
    }
  }
})
</script>

<style scoped>
.dual-editor {
  width: 100%;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid #e9ecef;
}

.editor-mode-switch {
  display: flex;
  gap: 8px;
}

.mode-btn {
  padding: 8px 16px;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mode-btn:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.mode-btn.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.btn-preview {
  padding: 8px 16px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-preview:hover {
  background: #667eea;
  color: white;
}

.markdown-editor-wrapper {
  border: 2px solid #e9ecef;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.markdown-editor-container {
  display: flex;
  height: 500px;
}

.markdown-editor-container.split-view {
  display: flex;
}

.editor-pane, .preview-pane {
  flex: 1;
  overflow-y: auto;
}

.editor-pane {
  border-right: 1px solid #e9ecef;
}

.markdown-editor {
  width: 100%;
  height: 500px;
  padding: 16px;
  border: none;
  resize: vertical;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
}

.preview-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #495057;
}

.preview-content {
  padding: 16px;
  min-height: 100%;
}

.rich-text-editor-wrapper {
  border: 2px solid #e9ecef;
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.rich-text-editor {
  height: 500px;
}

/* Quill 编辑器样式覆盖 */
:deep(.ql-toolbar) {
  border: none !important;
  border-bottom: 1px solid #e9ecef !important;
  background: #f8f9fa;
  border-radius: 0;
}

:deep(.ql-container) {
  border: none !important;
  font-family: inherit;
  font-size: 14px;
}

:deep(.ql-editor) {
  min-height: 400px;
  font-size: 15px;
  line-height: 1.6;
}

.editor-hint {
  margin-top: 12px;
  padding: 12px;
  background: #f0f4ff;
  border-radius: 6px;
  font-size: 13px;
  color: #495057;
  line-height: 1.8;
}

.editor-hint code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

@media (max-width: 768px) {
  .markdown-editor-container.split-view {
    flex-direction: column;
  }
  
  .editor-pane, .preview-pane {
    height: 300px;
  }
  
  .markdown-editor {
    height: 300px;
  }
  
  .rich-text-editor {
    height: 300px;
  }
}
</style>
