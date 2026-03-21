<template>
  <div class="table-of-contents" :class="{ 'collapsed': isCollapsed, 'mobile': isMobile }">
    <div class="toc-header" @click="toggleCollapse">
      <h3>📑 目录</h3>
      <button class="toggle-btn" :class="{ 'collapsed': isCollapsed }">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    
    <div class="toc-body" v-show="!isCollapsed">
      <nav v-if="headings.length > 0">
        <ul>
          <li v-for="heading in headings" :key="heading.id" 
              :class="['toc-item', `level-${heading.level}`, { 'active': activeId === heading.id }]">
            <a :href="`#${heading.id}`" @click="handleClick($event, heading.id)">
              {{ heading.text }}
            </a>
          </li>
        </ul>
      </nav>
      <p v-else class="no-toc">暂无目录</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const headings = ref([])
const activeId = ref('')
const isCollapsed = ref(false)
const isMobile = ref(false)

// 提取标题
const extractHeadings = () => {
  const contentEl = document.querySelector('.post-content') || document.querySelector('.article-content')
  if (!contentEl) return

  const headingElements = contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headings.value = Array.from(headingElements).map((heading, index) => {
    // 如果没有 ID，添加一个
    if (!heading.id) {
      heading.id = `heading-${index}`
    }
    
    return {
      id: heading.id,
      text: heading.textContent.trim(),
      level: parseInt(heading.tagName.charAt(1))
    }
  })
}

// 滚动监听
const handleScroll = () => {
  const scrollPosition = window.scrollY + 100
  
  for (let i = headings.value.length - 1; i >= 0; i--) {
    const heading = headings.value[i]
    const element = document.getElementById(heading.id)
    
    if (element && element.offsetTop <= scrollPosition) {
      activeId.value = heading.id
      break
    }
  }
}

// 点击处理
const handleClick = (event, id) => {
  event.preventDefault()
  const element = document.getElementById(id)
  if (element) {
    const offset = 80 // 头部高度
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = offset + elementPosition + window.pageYOffset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
    
    // 更新 URL hash
    history.pushState(null, null, `#${id}`)
  }
}

// 切换折叠
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('toc-collapsed', isCollapsed.value)
}

// 检查移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  // 等待内容渲染
  setTimeout(() => {
    extractHeadings()
  }, 100)
  
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', checkMobile)
  checkMobile()
  
  // 恢复折叠状态
  const saved = localStorage.getItem('toc-collapsed')
  if (saved !== null) {
    isCollapsed.value = saved === 'true'
  }
  
  // 如果有 hash，滚动到对应位置
  if (window.location.hash) {
    const id = window.location.hash.slice(1)
    setTimeout(() => {
      handleClick({ preventDefault: () => {} }, id)
    }, 200)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.table-of-contents {
  position: sticky;
  top: 80px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.toc-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.toggle-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: transform 0.3s;
}

.toggle-btn.collapsed {
  transform: rotate(-180deg);
}

.toggle-btn svg {
  width: 16px;
  height: 16px;
}

.toc-body {
  max-height: 500px;
  overflow-y: auto;
}

.toc-body nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin: 0;
}

.toc-item a {
  display: block;
  padding: 8px 12px;
  color: #4b5563;
  text-decoration: none;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.2s;
  line-height: 1.5;
}

.toc-item a:hover {
  background: #f3f4f6;
  color: #667eea;
}

.toc-item.active a {
  background: #667eea;
  color: white;
}

/* 不同层级的缩进 */
.level-2 {
  padding-left: 0;
}

.level-3 {
  padding-left: 16px;
}

.level-4 {
  padding-left: 32px;
}

.level-5,
.level-6 {
  padding-left: 48px;
}

.no-toc {
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

/* 移动端样式 */
.table-of-contents.mobile {
  position: fixed;
  bottom: 70px;
  right: 16px;
  top: auto;
  max-height: 300px;
  z-index: 100;
  width: 280px;
}

/* 滚动条美化 */
.toc-body::-webkit-scrollbar {
  width: 4px;
}

.toc-body::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 2px;
}

.toc-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.toc-body::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
