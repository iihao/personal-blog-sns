<template>
  <div class="user-write-article">
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-pen-fancy"></i> 写文章</h1>
      <p class="page-subtitle">分享你的想法和经验</p>
    </div>
    
    <div class="write-container">
      <!-- 文章表单 -->
      <div class="article-form">
        <div class="form-group">
          <label class="form-label">文章标题 *</label>
          <input 
            v-model="form.title" 
            type="text" 
            class="form-input" 
            placeholder="输入文章标题..." 
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">分类</label>
            <select 
              v-model="form.category" 
              class="form-input"
              :disabled="isSubmitting"
            >
              <option value="">选择分类（可选）</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">标签（用逗号分隔）</label>
            <input 
              v-model="form.tags" 
              type="text" 
              class="form-input" 
              placeholder="Vue, JavaScript, 教程" 
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">文章内容 *</label>
          <div 
            ref="editorContainer" 
            class="quill-editor"
            :class="{ 'disabled': isSubmitting }"
          ></div>
          <div class="form-hint">支持富文本格式，可直接粘贴内容</div>
        </div>

        <div class="form-group">
          <label class="form-label">
            <input 
              v-model="form.published" 
              type="checkbox" 
              class="checkbox" 
              :disabled="isSubmitting"
            />
            立即发布
          </label>
          <div class="form-hint">取消勾选将保存为草稿</div>
        </div>

        <div class="form-actions">
          <button 
            class="btn-secondary" 
            @click="saveDraft"
            :disabled="isSubmitting"
          >
            <i class="fas fa-save"></i> 保存草稿
          </button>
          <button 
            class="btn-primary" 
            @click="publishArticle"
            :disabled="isSubmitting || !form.title.trim()"
          >
            <i class="fas fa-check"></i> {{ isSubmitting ? '提交中...' : '发布文章' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const router = useRouter()

// 表单数据
const form = ref({
  title: '',
  content: '',
  category: '',
  tags: '',
  published: true
})

const categories = ref([])
const isSubmitting = ref(false)
const quillEditor = ref(null)
const editorContainer = ref(null)

// 加载分类 - 修复：使用正确的 admin API
const loadCategories = async () => {
  try {
    const token = localStorage.getItem('blog_token')
    if (!token) {
      // 如果没有登录，先跳转到登录页
      router.push('/login?redirect=/write')
      return
    }
    
    const res = await fetch('/api/admin/posts/categories', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    categories.value = data.categories?.map(c => c.category) || []
  } catch (error) {
    console.error('加载分类失败:', error)
    // 即使分类加载失败，也不影响写文章
  }
}

// 初始化 Quill 编辑器
const initQuillEditor = () => {
  if (!editorContainer.value) return
  
  // 配置 Quill
  const options = {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ]
    },
    placeholder: '开始编写你的文章...',
    readOnly: false
  }
  
  quillEditor.value = new Quill(editorContainer.value, options)
  
  // 监听内容变化
  quillEditor.value.on('text-change', () => {
    form.value.content = quillEditor.value.root.innerHTML
  })
}

// 保存文章 - 修复：使用正确的 admin API
const saveArticle = async (published = false) => {
  if (!form.value.title.trim()) {
    showToast('请输入文章标题', 'warning')
    return false
  }
  
  if (!form.value.content.trim() || form.value.content === '<p><br></p>') {
    showToast('请输入文章内容', 'warning')
    return false
  }
  
  isSubmitting.value = true
  
  try {
    const token = localStorage.getItem('blog_token')
    if (!token) {
      showToast('请先登录', 'warning')
      router.push('/login?redirect=/write')
      return false
    }
    
    const url = '/api/admin/posts'
    const method = 'POST'
    
    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...form.value,
        published
      })
    })
    
    const data = await res.json()
    
    if (res.ok) {
      showToast(published ? '文章发布成功！' : '草稿保存成功！', 'success')
      router.push('/')
      return true
    } else {
      throw new Error(data.error || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    showToast(`保存失败：${error.message}`, 'error')
    return false
  } finally {
    isSubmitting.value = false
  }
}

// 保存草稿
const saveDraft = () => {
  saveArticle(false)
}

// 发布文章
const publishArticle = () => {
  saveArticle(true)
}

// 生命周期
onMounted(() => {
  loadCategories()
  initQuillEditor()
})

onBeforeUnmount(() => {
  // 清理 Quill 实例
  if (quillEditor.value) {
    quillEditor.value = null
  }
})
</script>

<style scoped>
.user-write-article {
  min-height: 100vh;
  padding: 24px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-subtitle {
  font-size: 16px;
  color: #86868b;
  margin: 0;
}

.write-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.article-form {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 600;
  font-size: 14px;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #667eea;
}

.form-input:disabled {
  background-color: #f5f5f7;
  cursor: not-allowed;
}

.quill-editor {
  height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.quill-editor.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-hint {
  font-size: 12px;
  color: #86868b;
  margin-top: 4px;
}

.checkbox {
  margin-right: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Quill 自定义样式 */
:deep(.ql-toolbar) {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.ql-container) {
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

:deep(.ql-editor) {
  min-height: 300px;
  padding: 16px;
}

@media (max-width: 768px) {
  .article-form {
    padding: 24px 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>