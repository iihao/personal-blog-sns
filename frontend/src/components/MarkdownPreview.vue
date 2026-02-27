<template>
  <article class="markdown-preview" v-html="renderedHtml"></article>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useMarkdown } from '../composables/useMarkdown'
import { useLazyLoad } from '../composables/useLazyLoad'

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
  font-size: 1.125rem;
  line-height: 1.8;
  color: #515154;
}

/* 标题 */
.markdown-preview :deep(h1) {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 1.5em 0 1em;
  line-height: 1.2;
}

.markdown-preview :deep(h2) {
  font-size: 2rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 1.5em 0 1em;
  padding-bottom: 0.5em;
  border-bottom: 2px solid #e0e0e0;
}

.markdown-preview :deep(h3) {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 1.5em 0 1em;
}

.markdown-preview :deep(h4) {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 1.5em 0 1em;
}

.markdown-preview :deep(h5) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 1.5em 0 1em;
}

.markdown-preview :deep(h6) {
  font-size: 1rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 1.5em 0 1em;
}

/* 段落 */
.markdown-preview :deep(p) {
  margin: 1.5em 0;
}

/* 链接 */
.markdown-preview :deep(a) {
  color: #007aff;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.markdown-preview :deep(a:hover) {
  border-bottom-color: #007aff;
}

/* 强调 */
.markdown-preview :deep(strong) {
  font-weight: 600;
  color: #1d1d1f;
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
  background: #f5f5f7;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 0.9em;
  color: #e07a00;
}

.markdown-preview :deep(pre) {
  background: #1e1e2e;
  color: #e0e0e0;
  padding: 1.5em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5em 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  border-left: 4px solid #007aff;
  margin: 1.5em 0;
  padding: 1em 1.5em;
  background: rgba(0, 122, 255, 0.08);
  border-radius: 0 8px 8px 0;
  color: #515154;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: block;
}

/* 水平线 */
.markdown-preview :deep(hr) {
  border: none;
  border-top: 2px solid #e0e0e0;
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
  border: 1px solid #e0e0e0;
  padding: 0.75em;
  text-align: left;
}

.markdown-preview :deep(th) {
  background: #f5f5f7;
  font-weight: 600;
  color: #1d1d1f;
}

.markdown-preview :deep(tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.02);
}
</style>
