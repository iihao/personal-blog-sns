<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-history"></i> 更新日志管理</h1>
      <button class="btn-primary" @click="showAddModal = true">
        <i class="fas fa-plus"></i> 新增日志
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>加载中...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="changelog.length === 0" class="empty-state">
      <i class="fas fa-history"></i>
      <p>暂无更新日志</p>
      <p class="empty-hint">点击"新增日志"创建第一条更新记录</p>
    </div>

    <!-- Changelog List -->
    <div v-else class="changelog-list">
      <div v-for="entry in changelog" :key="entry.id" class="changelog-card">
        <div class="card-header">
          <div class="version-badge">{{ entry.version }}</div>
          <div class="card-date">{{ formatDate(entry.date) }}</div>
        </div>
        <div class="card-body">
          <div v-for="(change, index) in entry.changes" :key="index" class="change-item">
            <span class="change-tag" :class="getTypeTagClass(change.type)">{{ getTypeLabel(change.type) }}</span>
            <span class="change-text">{{ change.content }}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-icon" @click="editEntry(entry)" title="编辑">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-danger" @click="deleteEntry(entry.id)" title="删除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? '编辑更新日志' : '新增更新日志' }}</h2>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">版本号</label>
            <input v-model="form.version" type="text" class="form-input" placeholder="如：1.4.0" />
          </div>
          <div class="form-group">
            <label class="form-label">发布日期</label>
            <input v-model="form.date" type="datetime-local" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">更新内容</label>
            <div class="changes-editor">
              <div v-for="(change, index) in form.changes" :key="index" class="change-row">
                <select v-model="change.type" class="form-select">
                  <option value="feature">功能新增</option>
                  <option value="fix">Bug 修复</option>
                  <option value="improvement">功能完善</option>
                  <option value="security">安全加固</option>
                  <option value="docs">文档更新</option>
                  <option value="performance">性能优化</option>
                </select>
                <input v-model="change.content" type="text" class="form-input" placeholder="更新内容描述" />
                <button class="btn-icon btn-danger" @click="removeChange(index)" title="删除">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <button class="btn-secondary btn-block" @click="addChange">
                <i class="fas fa-plus"></i> 添加更新内容
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">取消</button>
          <button class="btn-primary" @click="saveEntry" :disabled="saving">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            {{ isEditing ? '保存修改' : '创建日志' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const saving = ref(false)
const changelog = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)

const form = ref({
  id: null,
  version: '',
  date: '',
  changes: []
})

const isEditing = computed(() => !!form.value.id)

// 加载更新日志
const loadChangelog = async () => {
  try {
    loading.value = true
    const res = await fetch('/api/changelog')
    const data = await res.json()
    changelog.value = data.changelog || []
  } catch (error) {
    console.error('加载更新日志失败:', error)
    showToast('加载失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

// 添加更新内容行
const addChange = () => {
  form.value.changes.push({ type: 'feature', content: '' })
}

// 删除更新内容行
const removeChange = (index) => {
  form.value.changes.splice(index, 1)
}

// 编辑条目
const editEntry = (entry) => {
  form.value = {
    id: entry.id,
    version: entry.version,
    date: entry.date,
    changes: JSON.parse(JSON.stringify(entry.changes))
  }
  showEditModal.value = true
}

// 删除条目
const deleteEntry = async (id) => {
  if (!confirm('确定要删除这条更新日志吗？')) return
  
  try {
    const res = await fetch(`/api/changelog/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      }
    })
    
    if (res.ok) {
      showToast('删除成功', 'success')
      loadChangelog()
    } else {
      throw new Error('删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    showToast('删除失败，请稍后重试', 'error')
  }
}

// 保存条目
const saveEntry = async () => {
  if (!form.value.version || !form.value.date || form.value.changes.length === 0) {
    showToast('请填写完整信息', 'warning')
    return
  }
  
  try {
    saving.value = true
    const url = isEditing.value ? `/api/changelog/${form.value.id}` : '/api/changelog'
    const method = isEditing.value ? 'PUT' : 'POST'
    
    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      },
      body: JSON.stringify(form.value)
    })
    
    if (res.ok) {
      showToast(isEditing.value ? '修改成功' : '创建成功', 'success')
      closeModal()
      loadChangelog()
    } else {
      const data = await res.json()
      throw new Error(data.error || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    showToast(`保存失败：${error.message}`, 'error')
  } finally {
    saving.value = false
  }
}

// 关闭弹窗
const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  form.value = { id: null, version: '', date: '', changes: [] }
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取标签类型
const getTypeLabel = (type) => {
  const map = {
    feature: '功能新增',
    fix: 'Bug 修复',
    improvement: '功能完善',
    security: '安全加固',
    docs: '文档更新',
    performance: '性能优化'
  }
  return map[type] || '更新'
}

const getTypeTagClass = (type) => {
  const map = {
    feature: 'tag-feature',
    fix: 'tag-fix',
    improvement: 'tag-improvement',
    security: 'tag-security',
    docs: 'tag-docs',
    performance: 'tag-performance'
  }
  return map[type] || 'tag-default'
}

// Toast 通知
const showToast = (message, type = 'info') => {
  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

onMounted(() => {
  loadChangelog()
})
</script>

<style scoped>
.admin-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-block {
  width: 100%;
  justify-content: center;
  margin-top: 12px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-icon.btn-danger:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Loading & Empty States */
.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-state i {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 12px;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-hint {
  font-size: 0.875rem;
  color: #9ca3af;
}

/* Changelog List */
.changelog-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.changelog-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.changelog-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.version-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.card-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.change-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.9375rem;
  color: #374151;
}

.change-tag {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.change-tag.tag-feature { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.change-tag.tag-fix { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.change-tag.tag-improvement { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.change-tag.tag-security { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.change-tag.tag-docs { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.change-tag.tag-performance { background: rgba(236, 72, 153, 0.1); color: #ec4899; }

.change-text {
  flex: 1;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input, .form-select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.changes-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.change-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.change-row .form-select {
  width: 140px;
  flex-shrink: 0;
}

.change-row .form-input {
  flex: 1;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
