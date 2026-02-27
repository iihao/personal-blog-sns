<template>
  <nav class="table-of-contents" v-if="headings.length > 0">
    <div class="toc-header">
      <h3>
        <i class="fas fa-list"></i> 目录
      </h3>
      <button 
        @click="toggleCollapse" 
        class="toc-toggle"
        :title="isCollapsed ? '展开目录' : '收起目录'"
      >
        <i :class="isCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
      </button>
    </div>
    
    <div class="toc-body" :class="{ collapsed: isCollapsed }">
      <ul class="toc-list">
        <li 
          v-for="heading in headings" 
          :key="heading.id"
          :class="['toc-item', `level-${heading.level}`]"
          :style="{ paddingLeft: `${(heading.level - 1) * 16}px` }"
        >
          <a 
            :href="`#${heading.id}`"
            @click="scrollToHeading(heading.id)"
            :class="{ active: activeHeading === heading.id }"
          >
            {{ heading.text }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useMarkdown } from '../composables/useMarkdown'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const { extractHeadings } = useMarkdown()
const headings = ref([])
const isCollapsed = ref(false)
const activeHeading = ref('')

// 提取目录
const updateHeadings = () => {
  if (props.content) {
    headings.value = extractHeadings(props.content)
  }
}

// 滚动到指定标题
const scrollToHeading = (id) => {
  const element = document.getElementById(id)
  if (element) {
    const offset = 80 // 固定头部高度
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = offset + elementPosition + window.pageYOffset - 80

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
    
    activeHeading.value = id
  }
}

// 切换收起/展开
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 监听滚动高亮当前章节
const handleScroll = () => {
  const scrollPosition = window.scrollY + 150
  
  for (const heading of headings.value) {
    const element = document.getElementById(heading.id)
    if (element) {
      const elementTop = element.offsetTop
      const elementBottom = elementTop + element.offsetHeight
      
      if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
        activeHeading.value = heading.id
        break
      }
    }
  }
}

// 监听内容变化
watch(() => props.content, updateHeadings, { immediate: true })

// 生命周期
onMounted(() => {
  updateHeadings()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.table-of-contents {
  position: sticky;
  top: 100px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px;
  margin: 20px 0;
  max-width: 280px;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.3s ease;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.toc-header h3 {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toc-header h3 i {
  color: var(--accent-primary);
}

.toc-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.toc-toggle:hover {
  background: var(--bg-tertiary);
  color: var(--accent-primary);
}

.toc-body {
  max-height: 450px;
  overflow-y: auto;
  transition: max-height 0.3s ease;
}

.toc-body.collapsed {
  max-height: 0;
  overflow: hidden;
  padding: 0;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin: 2px 0;
}

.toc-item a {
  display: block;
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.toc-item a:hover {
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-primary);
  transform: translateX(2px);
}

.toc-item a.active {
  background: rgba(124, 58, 237, 0.15);
  color: var(--accent-primary);
  font-weight: 600;
}

/* 层级缩进 */
.toc-item.level-2 {
  margin-left: 0;
}

.toc-item.level-3 {
  margin-left: 12px;
}

.toc-item.level-4 {
  margin-left: 24px;
}

/* 滚动条样式 */
.toc-body::-webkit-scrollbar {
  width: 4px;
}

.toc-body::-webkit-scrollbar-track {
  background: transparent;
}

.toc-body::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.toc-body::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

/* 响应式 */
@media (max-width: 1024px) {
  .table-of-contents {
    position: relative;
    top: 0;
    max-width: 100%;
  }
}
</style>
