<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-pen-fancy"></i> 写文章</h1>
    </div>
    <div class="editor-container">
      <!-- 文章表单 -->
      <div class="article-form">
        <div class="form-group">
          <label class="form-label">文章标题</label>
          <input v-model="form.title" type="text" class="form-input" placeholder="输入文章标题..." />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">分类</label>
            <select v-model="form.category" class="form-input">
              <option value="">选择分类</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">标签（用逗号分隔）</label>
            <input v-model="form.tags" type="text" class="form-input" placeholder="Vue, JavaScript, 教程" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">内容</label>
          <DualEditor 
            v-model="form.content"
            v-model:content-format="form.contentFormat"
          />
        </div>

        <div class="form-group">
          <div class="form-label-row">
            <label class="form-label">立即发布</label>
            <ToggleSwitch v-model="form.published" />
          </div>
          <div class="form-hint">取消勾选将保存为草稿</div>
        </div>

        <div class="form-actions">
          <button class="btn-secondary" @click="saveDraft">
            <i class="fas fa-save"></i> 保存草稿
          </button>
          <button class="btn-primary" @click="publishArticle">
            <i class="fas fa-check"></i> 发布文章
          </button>
          <button class="btn-danger" @click="deleteArticle" v-if="articleId">
            <i class="fas fa-trash"></i> 删除文章
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DualEditor from '../../components/DualEditor.vue'
import ToggleSwitch from '../../components/ToggleSwitch.vue'

const router = useRouter()
const route = useRoute()

const articleId = ref(route.query.id)
const form = ref({
  title: '',
  content: '',
  contentFormat: 'markdown',
  category: '',
  tags: '',
  published: false
})

const categories = ref([])
const showPreview = ref(false)

// 加载分类
const loadCategories = async () => {
  try {
    const res = await fetch('/api/posts/categories')
    const data = await res.json()
    categories.value = data.categories?.map(c => c.category) || []
  } catch (error) {
    console.error('加载分类失败:', error)
    showToast('加载分类失败，请稍后重试', 'error')
  }
}

// 加载文章
const loadArticle = async () => {
  if (!articleId.value) return
  
  try {
    const res = await fetch(`/api/posts/${articleId.value}`)
    const data = await res.json()
    if (data.post) {
      form.value = {
        title: data.post.title,
        content: data.post.content,
        contentFormat: data.post.content_format || 'markdown',
        category: data.post.category || '',
        tags: data.post.tags || '',
        published: data.post.published
      }
    }
  } catch (error) {
    console.error('加载文章失败:', error)
    showToast('加载文章失败，请稍后重试', 'error')
  }
}

// 保存文章
const saveArticle = async (published = false) => {
  if (!form.value.title.trim()) {
    showToast('请输入文章标题', 'warning')
    return
  }
  
  if (!form.value.content.trim()) {
    showToast('请输入文章内容', 'warning')
    return
  }
  
  try {
    const url = articleId.value ? `/api/admin/posts/${articleId.value}` : '/api/admin/posts'
    const method = articleId.value ? 'PUT' : 'POST'
    
    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      },
      body: JSON.stringify({
        ...form.value,
        published
      })
    })
    
    const data = await res.json()
    
    if (res.ok) {
      showToast(published ? '文章发布成功！' : '草稿保存成功！', 'success')
      router.push('/admin/articles')
    } else {
      throw new Error(data.error || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    showToast(`保存失败：${error.message}`, 'error')
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

// 删除文章
const deleteArticle = async () => {
  if (!confirm('确定要删除这篇文章吗？')) return
  
  try {
    const res = await fetch(`/api/admin/posts/${articleId.value}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      }
    })
    
    if (res.ok) {
      showToast('文章删除成功！', 'success')
      router.push('/admin/articles')
    } else {
      const error = await res.json()
      throw new Error(error.error || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    showToast(`删除失败：${error.message}`, 'error')
  }
}

onMounted(() => {
  loadCategories()
  loadArticle()
})
</script>

<style scoped>
.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.article-form {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-group {
  margin-bottom: 20px;
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

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', monospace;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  border-color: #667eea;
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

.btn-primary, .btn-secondary, .btn-danger {
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

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-danger {
  background: #ff3b30;
  color: white;
  margin-left: auto;
}

.btn-danger:hover {
  background: #e6352b;
}

.preview-panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: fit-content;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.preview-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1d1d1f;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  transition: all 0.2s;
}

.btn-icon:hover {
  border-color: #667eea;
  color: #667eea;
}

.preview-content {
  line-height: 1.8;
  color: #1d1d1f;
}

.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

.preview-content :deep(p) {
  margin-bottom: 16px;
}

.preview-content :deep(code) {
  background: #f5f5f7;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.preview-content :deep(pre) {
  background: #f5f5f7;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

/* 响应式 - 移动端优化 */
@media (max-width: 1024px) {
  .editor-container {
    grid-template-columns: 1fr;
  }
  
  .preview-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .article-form {
    padding: 20px 16px;
    border-radius: 12px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-label {
    font-size: 13px;
  }
  
  .form-input {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .form-textarea {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .form-hint {
    font-size: 11px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
  }
  
  .form-actions .btn-primary,
  .form-actions .btn-secondary {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
    font-size: 14px;
    min-height: 44px;
  }
  
  .form-actions .btn-danger {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
  
  .page-header {
    margin-bottom: 20px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .page-subtitle {
    font-size: 13px;
  }
  
  /* Quill 编辑器移动端优化 */
  .quill-editor {
    height: 300px;
    border-radius: 10px;
  }
  
  .quill-editor .ql-toolbar {
    padding: 8px;
  }
  
  .quill-editor .ql-container {
    font-size: 14px;
  }
  
  .quill-editor .ql-editor {
    padding: 12px;
    min-height: 250px;
  }
}

@media (max-width: 480px) {
  .article-form {
    padding: 16px 12px;
  }
  
  .form-input,
  .form-textarea {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .form-label {
    font-size: 12px;
  }
  
  .form-hint {
    font-size: 10px;
  }
  
  .quill-editor {
    height: 250px;
  }
  
  .quill-editor .ql-editor {
    font-size: 13px;
    padding: 10px;
  }
  
  .page-title {
    font-size: 18px;
  }
}

/* 横屏模式优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .quill-editor {
    height: 200px;
  }
  
  .form-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .form-actions .btn-primary,
  .form-actions .btn-secondary,
  .form-actions .btn-danger {
    flex: 1;
    min-width: 120px;
  }
}
</style>