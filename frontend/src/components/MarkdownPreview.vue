<template>
  <article class="markdown-preview" v-html="renderedHtml"></article>
</template>

<script setup>
import { computed } from 'vue'
import { useMarkdown } from '../composables/useMarkdown'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const { parseMarkdown } = useMarkdown()

const renderedHtml = computed(() => {
  return parseMarkdown(props.content)
})
</script>

<style scoped>
.markdown-preview {
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--text-secondary);
}

/* 标题 */
.markdown-preview :deep(h1) {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 1.5em 0 1em;
  line-height: 1.2;
}

.markdown-preview :deep(h2) {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 1.5em 0 1em;
  padding-bottom: 0.5em;
  border-bottom: 2px solid var(--border-color);
}

.markdown-preview :deep(h3) {
  font-size: 1.75rem;
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
  color: #60a5fa;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.markdown-preview :deep(a:hover) {
  border-bottom-color: #60a5fa;
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
  opacity: 0.7;
}

/* 代码 */
.markdown-preview :deep(code) {
  background: var(--bg-tertiary);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 0.9em;
  color: #fbbf24;
}

.markdown-preview :deep(pre) {
  background: #1e1e2e;
  color: #e0e0e0;
  padding: 1.5em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5em 0;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.markdown-preview :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.875rem;
  line-height: 1.6;
}

/* 引用 */
.markdown-preview :deep(blockquote) {
  border-left: 4px solid #60a5fa;
  margin: 1.5em 0;
  padding: 1em 1.5em;
  background: rgba(96, 165, 250, 0.1);
  border-radius: 0 8px 8px 0;
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
  border-radius: 8px;
  margin: 1.5em 0;
  box-shadow: 0 4px 12px var(--shadow-color);
  display: block;
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
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.75em;
  text-align: left;
}

.markdown-preview :deep(th) {
  background: var(--bg-tertiary);
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-preview :deep(tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.02);
}

.dark .markdown-preview :deep(tr:nth-child(even)) {
  background: rgba(255, 255, 255, 0.02);
}

/* 深色模式适配 */
:global(.dark) .markdown-preview :deep(code) {
  background: var(--bg-tertiary);
  color: #fbbf24;
}

:global(.dark) .markdown-preview :deep(pre) {
  background: #1e1e2e;
  border: 1px solid var(--border-color);
}
</style>
