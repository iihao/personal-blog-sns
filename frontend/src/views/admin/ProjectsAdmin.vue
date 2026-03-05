<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-folder-open"></i> 项目管理</h1>
      <button class="btn-primary" @click="showEditModal = true; editingProject = null">
        <i class="fas fa-plus"></i> 添加项目
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>加载项目中...</p>
    </div>

    <!-- 项目列表 -->
    <div v-else class="projects-table">
      <div class="table-header">
        <div class="table-title">项目列表 ({{ projects.length }})</div>
        <div class="table-actions">
          <button 
            v-if="selectedProjects.length > 0"
            class="btn-danger" 
            @click="batchDelete"
          >
            <i class="fas fa-trash"></i> 删除选中 ({{ selectedProjects.length }})
          </button>
        </div>
      </div>

      <div v-if="projects.length === 0" class="empty-state">
        <i class="fas fa-folder-open"></i>
        <h3>暂无项目</h3>
        <p>点击"添加项目"创建你的第一个项目作品</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th width="40">
              <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" />
            </th>
            <th>项目名称</th>
            <th>状态</th>
            <th>技术栈</th>
            <th>推荐</th>
            <th>排序</th>
            <th width="200">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in projects" :key="project.id">
            <td>
              <input type="checkbox" :value="project.id" v-model="selectedProjects" />
            </td>
            <td>
              <div class="project-name-cell">
                <span class="project-name">{{ project.name }}</span>
                <span v-if="project.github_url" class="github-badge">
                  <i class="fab fa-github"></i>
                </span>
              </div>
            </td>
            <td>
              <span class="status-badge" :class="project.status">
                {{ getStatusText(project.status) }}
              </span>
            </td>
            <td>
              <div class="tech-tags">
                <span 
                  v-for="(tech, i) in parseTechStack(project.tech_stack)" 
                  :key="i"
                  class="tech-tag"
                >
                  {{ tech }}
                </span>
              </div>
            </td>
            <td>
              <i 
                v-if="project.is_featured" 
                class="fas fa-star featured-icon"
                title="推荐项目"
              ></i>
            </td>
            <td>{{ project.sort_order }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon" @click="editProject(project)" title="编辑">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" @click="deleteProject(project.id)" title="删除">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 编辑/添加项目弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3>{{ editingProject ? '编辑项目' : '添加项目' }}</h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProject">
            <div class="form-group">
              <label class="form-label required">项目名称</label>
              <input v-model="formData.name" type="text" class="form-input" required placeholder="我的项目" />
            </div>

            <div class="form-group">
              <label class="form-label">项目描述</label>
              <textarea v-model="formData.description" class="form-textarea" rows="3" placeholder="简短描述这个项目"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">项目主页 URL</label>
                <input v-model="formData.url" type="url" class="form-input" placeholder="https://example.com" />
              </div>
              <div class="form-group">
                <label class="form-label">演示地址 URL</label>
                <input v-model="formData.demo_url" type="url" class="form-input" placeholder="https://demo.example.com" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fab fa-github"></i> GitHub 地址
              </label>
              <input v-model="formData.github_url" type="url" class="form-input" placeholder="https://github.com/username/repo" />
              <div class="form-hint">项目开源后填写 GitHub 地址</div>
            </div>

            <div class="form-group">
              <label class="form-label">技术栈</label>
              <input v-model="formData.tech_stack" type="text" class="form-input" placeholder="Vue3, Express, SQLite" />
              <div class="form-hint">多个技术用逗号分隔</div>
            </div>

            <div class="form-group">
              <label class="form-label">项目图片</label>
              <div class="image-upload-section">
                <div v-if="formData.image_url" class="image-preview">
                  <img :src="formData.image_url" alt="项目图片" />
                </div>
                <div class="image-upload-actions">
                  <input v-model="formData.image_url" type="text" class="form-input" placeholder="输入图片 URL 或点击上传" />
                  <button type="button" @click="uploadImage" class="btn-secondary" :disabled="uploading">
                    <i class="fas fa-upload"></i> {{ uploading ? '上传中...' : '上传图片' }}
                  </button>
                  <button v-if="formData.image_url" type="button" @click="formData.image_url = ''" class="btn-danger-outline">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">项目状态</label>
                <select v-model="formData.status" class="form-select">
                  <option value="completed">已完成</option>
                  <option value="in_progress">进行中</option>
                  <option value="planned">计划中</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">排序</label>
                <input v-model.number="formData.sort_order" type="number" class="form-input" min="0" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <input v-model="formData.is_featured" type="checkbox" class="form-checkbox" />
                设为推荐项目
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">取消</button>
          <button class="btn-primary" @click="saveProject" :disabled="saving">
            <i class="fas fa-save"></i> {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const projects = ref([])
const loading = ref(true)
const selectedProjects = ref([])
const showEditModal = ref(false)
const editingProject = ref(null)
const saving = ref(false)
const uploading = ref(false)

const formData = ref({
  name: '',
  description: '',
  url: '',
  github_url: '',
  demo_url: '',
  tech_stack: '',
  image_url: '',
  status: 'completed',
  sort_order: 0,
  is_featured: false
})

const isAllSelected = computed(() => {
  return projects.value.length > 0 && selectedProjects.value.length === projects.value.length
})

const parseTechStack = (techStack) => {
  if (!techStack) return []
  return techStack.split(',').map(t => t.trim()).filter(t => t)
}

const getStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'in_progress': '进行中',
    'planned': '计划中'
  }
  return statusMap[status] || status
}

const fetchProjects = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/projects/admin/all', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      }
    })
    const data = await response.json()
    projects.value = data.projects || []
  } catch (error) {
    console.error('Error fetching projects:', error)
    showToast('加载项目失败', 'error')
  } finally {
    loading.value = false
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedProjects.value = []
  } else {
    selectedProjects.value = projects.value.map(p => p.id)
  }
}

const editProject = (project) => {
  editingProject.value = project
  formData.value = {
    name: project.name,
    description: project.description || '',
    url: project.url || '',
    github_url: project.github_url || '',
    demo_url: project.demo_url || '',
    tech_stack: project.tech_stack || '',
    image_url: project.image_url || '',
    status: project.status,
    sort_order: project.sort_order,
    is_featured: !!project.is_featured
  }
  showEditModal.value = true
}

const closeModal = () => {
  showEditModal.value = false
  editingProject.value = null
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    url: '',
    github_url: '',
    demo_url: '',
    tech_stack: '',
    image_url: '',
    status: 'completed',
    sort_order: 0,
    is_featured: false
  }
}

const saveProject = async () => {
  if (!formData.value.name) {
    showToast('请输入项目名称', 'error')
    return
  }

  try {
    saving.value = true
    const url = editingProject.value 
      ? `/api/projects/${editingProject.value.id}`
      : '/api/projects'
    
    const method = editingProject.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      },
      body: JSON.stringify(formData.value)
    })

    if (response.ok) {
      showToast(editingProject.value ? '项目已更新' : '项目已创建', 'success')
      closeModal()
      fetchProjects()
    } else {
      const data = await response.json()
      throw new Error(data.error || '保存失败')
    }
  } catch (error) {
    console.error('Error saving project:', error)
    showToast(error.message, 'error')
  } finally {
    saving.value = false
  }
}

const deleteProject = async (id) => {
  if (!confirm('确定要删除这个项目吗？')) return

  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      }
    })

    if (response.ok) {
      showToast('项目已删除', 'success')
      fetchProjects()
    } else {
      throw new Error('删除失败')
    }
  } catch (error) {
    console.error('Error deleting project:', error)
    showToast('删除失败', 'error')
  }
}

const batchDelete = async () => {
  if (!confirm(`确定要删除选中的 ${selectedProjects.value.length} 个项目吗？`)) return

  try {
    const response = await fetch('/api/projects/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      },
      body: JSON.stringify({ ids: selectedProjects.value })
    })

    if (response.ok) {
      showToast('项目已删除', 'success')
      selectedProjects.value = []
      fetchProjects()
    } else {
      throw new Error('删除失败')
    }
  } catch (error) {
    console.error('Error batch deleting projects:', error)
    showToast('删除失败', 'error')
  }
}

const uploadImage = async () => {
  try {
    uploading.value = true
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
        },
        body: formDataUpload
      })
      
      if (response.ok) {
        const data = await response.json()
        formData.value.image_url = data.file_path
        showToast('图片上传成功', 'success')
      } else {
        throw new Error('上传失败')
      }
    }
    
    input.click()
  } catch (error) {
    console.error('Error uploading image:', error)
    showToast('图片上传失败', 'error')
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  fetchProjects()
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
  margin-bottom: 32px;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-state i {
  font-size: 32px;
  margin-bottom: 12px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 64px;
  opacity: 0.3;
  margin-bottom: 16px;
}

.projects-table {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.table-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 16px 24px;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  background: var(--bg-tertiary);
  border-bottom: 2px solid var(--border-color);
}

.data-table td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
}

.data-table tr:hover {
  background: var(--bg-hover);
}

.project-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-name {
  font-weight: 600;
  color: var(--text-primary);
}

.github-badge {
  padding: 2px 6px;
  background: #333;
  color: white;
  border-radius: 4px;
  font-size: 0.625rem;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.completed {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.status-badge.in_progress {
  background: rgba(255, 149, 0, 0.15);
  color: #ff9500;
}

.status-badge.planned {
  background: rgba(142, 142, 147, 0.15);
  color: #8e8e93;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-tag {
  padding: 2px 8px;
  background: rgba(102, 126, 234, 0.1);
  color: var(--accent-primary);
  border-radius: 8px;
  font-size: 0.6875rem;
  font-weight: 600;
}

.featured-icon {
  color: #ffc107;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-dialog {
  background: var(--card-bg);
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.modal-close:hover {
  border-color: #ff3b30;
  color: #ff3b30;
  background: rgba(255, 59, 48, 0.05);
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-label.required::after {
  content: ' *';
  color: #ff3b30;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.9375rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.2s;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  margin-top: 6px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-checkbox {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.image-upload-section {
  margin-top: 8px;
}

.image-preview {
  margin-bottom: 12px;
  border-radius: 10px;
  overflow: hidden;
  max-width: 400px;
  border: 1px solid var(--border-color);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.image-upload-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.image-upload-actions .form-input {
  flex: 1;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .table-header {
    flex-direction: column;
    gap: 12px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .image-upload-actions {
    flex-direction: column;
  }

  .image-upload-actions .form-input {
    width: 100%;
  }
}
</style>
