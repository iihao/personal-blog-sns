<template>
  <article class="markdown-preview" v-html="renderedHtml"></article>
</template>

<script setup>
import { computed, onMounted, watch, h } from 'vue'
import { useMarkdown } from '../composables/useMarkdown'
import { useLazyLoad } from '../composables/useLazyLoad'
import CodeBlock from './CodeBlock.vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const { parseMarkdown } = useMarkdown()
const { observeImages, disconnect } = useLazyLoad()

const renderedHtml = computed(() => {
  return parseMarkdown(props.content)
})

// 初始化懒加载
onMounted(() => {
  observeImages('img[data-src]')
})

// 内容变化时重新观察
watch(() => props.content, () => {
  disconnect()
  observeImages('img[data-src]')
})
</script>

<style scoped>
.markdown-preview {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--text-primary);
}

/* 标题 */
.markdown-preview :deep(h1) {
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 1.5em 0 1em;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.markdown-preview :deep(h2) {
  font-size: clamp(1.75rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 1.5em 0 1em;
  padding-bottom: 0.5em;
  border-bottom: 2px solid var(--border-color);
}

.markdown-preview :deep(h3) {
  font-size: clamp(1.5rem, 3vw, 1.75rem);
  font-weight: 600;
  color: var(--text-primary);
  margin: 1.5em 0 1em;
}

.markdown-preview :deep(h4) {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 1.5em 0 1em;
}

.markdown-preview :deep(h5) {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 1.5em 0 1em;
}

.markdown-preview :deep(h6) {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 1.5em 0 1em;
}

/* 段落 */
.markdown-preview :deep(p) {
  margin: 1.5em 0;
}

/* 链接 */
.markdown-preview :deep(a) {
  color: var(--accent-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
  font-weight: 500;
}

.markdown-preview :deep(a:hover) {
  border-bottom-color: var(--accent-primary);
  opacity: 0.8;
}

/* 强调 */
.markdown-preview :deep(strong) {
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-preview :deep(em) {
  font-style: italic;
}

.markdown-preview :deep(del) {
  text-decoration: line-through;
  opacity: 0.6;
}

/* 代码 */
.markdown-preview :deep(code) {
  background: var(--bg-tertiary);
  padding: 0.2em 0.5em;
  border-radius: 6px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 0.875em;
  color: var(--accent-primary);
  border: 1px solid var(--border-color);
}

.markdown-preview :deep(pre) {
  background: #1e1e2e;
  color: #e0e0e0;
  padding: 1.5em;
  border-radius: 12px;
  overflow-x: auto;
  margin: 1.5em 0;
  box-shadow: 0 4px 12px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.markdown-preview :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.875rem;
  line-height: 1.6;
  border: none;
}

/* 引用 */
.markdown-preview :deep(blockquote) {
  border-left: 4px solid var(--accent-primary);
  margin: 1.5em 0;
  padding: 1em 1.5em;
  background: rgba(124, 58, 237, 0.08);
  border-radius: 0 12px 12px 0;
  color: var(--text-secondary);
}

.markdown-preview :deep(blockquote p) {
  margin: 0.5em 0;
}

/* 列表 */
.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin: 1.5em 0;
  padding-left: 2em;
}

.markdown-preview :deep(li) {
  margin: 0.5em 0;
}

.markdown-preview :deep(ul) {
  list-style-type: disc;
}

.markdown-preview :deep(ol) {
  list-style-type: decimal;
}

.markdown-preview :deep(li > ul),
.markdown-preview :deep(li > ol) {
  margin: 0.5em 0;
}

/* 图片 */
.markdown-preview :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 1.5em 0;
  box-shadow: 0 4px 12px var(--shadow-color);
  display: block;
  transition: transform 0.3s ease;
}

.markdown-preview :deep(img:hover) {
  transform: scale(1.02);
}

/* 水平线 */
.markdown-preview :deep(hr) {
  border: none;
  border-top: 2px solid var(--border-color);
  margin: 2em 0;
}

/* 表格 */
.markdown-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.875em 1em;
  text-align: left;
}

.markdown-preview :deep(th) {
  background: var(--bg-tertiary);
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  font-size: 0.8125rem;
  letter-spacing: 0.05em;
}

.markdown-preview :deep(td) {
  color: var(--text-secondary);
}

.markdown-preview :deep(tr:nth-child(even)) {
  background: rgba(124, 58, 237, 0.03);
}

.markdown-preview :deep(tr:hover) {
  background: rgba(124, 58, 237, 0.06);
}

/* 深色模式适配 */
:global(.dark) .markdown-preview :deep(pre) {
  background: #1a1a2e;
}

:global(.dark) .markdown-preview :deep(blockquote) {
  background: rgba(124, 58, 237, 0.12);
}
</style>
