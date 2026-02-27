<template>
  <div class="category-tag-widget">
    <!-- 分类 -->
    <div class="widget-section">
      <h3><i class="fas fa-folder"></i> 分类</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="categories.length === 0" class="empty">暂无分类</div>
      <ul v-else class="category-list">
        <li v-for="cat in categories" :key="cat.category">
          <button @click="selectCategory(cat.category)" :class="{ active: selectedCategory === cat.category }">
            <span class="name">{{ cat.category }}</span>
            <span class="count">{{ cat.count }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- 标签云 -->
    <div class="widget-section">
      <h3><i class="fas fa-tags"></i> 标签云</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="tags.length === 0" class="empty">暂无标签</div>
      <div v-else class="tag-cloud">
        <button 
          v-for="tag in tags" 
          :key="tag.name"
          @click="selectTag(tag.name)"
          :class="['tag-item', `size-${getSize(tag.count)}`]"
        >
          {{ tag.name }} <span class="count">{{ tag.count }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['category-select', 'tag-select'])

const categories = ref([])
const tags = ref([])
const loading = ref(true)
const selectedCategory = ref('')

const getSize = (count) => {
  if (count >= 5) return 'large'
  if (count >= 3) return 'medium'
  return 'small'
}

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/posts/categories')
    const data = await response.json()
    categories.value = data.categories || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const fetchTags = async () => {
  try {
    const response = await fetch('/api/posts/tags')
    const data = await response.json()
    tags.value = data.tags || []
  } catch (error) {
    console.error('Error fetching tags:', error)
  }
}

const selectCategory = (category) => {
  if (selectedCategory.value === category) {
    selectedCategory.value = ''
    emit('category-select', null)
  } else {
    selectedCategory.value = category
    emit('category-select', category)
  }
}

const selectTag = (tag) => {
  emit('tag-select', tag)
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchCategories(), fetchTags()])
  loading.value = false
})
</script>

<style scoped>
.category-tag-widget {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.widget-section {
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 20px;
}

:global(.dark) .widget-section {
  background: var(--bg-secondary, #1e293b);
}

.widget-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading, .empty {
  text-align: center;
  color: var(--text-secondary, #6b7280);
  padding: 20px;
  font-size: 0.95rem;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-list li button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--bg-tertiary, #f3f4f6);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

:global(.dark) .category-list li button {
  background: var(--bg-tertiary, #334155);
}

.category-list li button:hover {
  background: rgba(102, 126, 234, 0.1);
}

.category-list li button.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.category-list .name {
  font-weight: 500;
}

.category-list .count {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
}

:global(.dark) .category-list .count {
  background: rgba(255, 255, 255, 0.2);
}

.category-list li button.active .count {
  background: rgba(255, 255, 255, 0.3);
}

/* 标签云 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 6px 12px;
  background: var(--bg-tertiary, #f3f4f6);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

:global(.dark) .tag-item {
  background: var(--bg-tertiary, #334155);
}

.tag-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateY(-2px);
}

.tag-item.size-large {
  font-size: 1rem;
  font-weight: 600;
}

.tag-item.size-medium {
  font-size: 0.95rem;
  font-weight: 500;
}

.tag-item .count {
  margin-left: 4px;
  font-size: 0.75rem;
  opacity: 0.7;
}
</style>
