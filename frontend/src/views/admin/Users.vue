<template>
  <div class="users-view">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-users"></i> 用户管理
      </h1>
      <p class="page-subtitle">管理博客系统用户账号</p>
    </div>

    <div class="users-container">
      <!-- 操作按钮 -->
      <div class="actions-bar">
        <button class="btn-primary" @click="showCreateModal = true">
          <i class="fas fa-plus"></i> 添加用户
        </button>
      </div>

      <!-- 用户列表 -->
      <div class="users-table">
        <div class="table-header">
          <div class="table-cell">用户名</div>
          <div class="table-cell">角色</div>
          <div class="table-cell">邮箱</div>
          <div class="table-cell">注册时间</div>
          <div class="table-cell">操作</div>
        </div>
        
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载用户数据...</p>
        </div>
        
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
        </div>
        
        <div v-else-if="users.length === 0" class="empty-state">
          <div class="empty-icon">👤</div>
          <p>暂无用户数据</p>
        </div>
        
        <div v-for="user in users" :key="user.id" class="table-row">
          <div class="table-cell">
            <div class="user-info">
              <div class="user-avatar">
                {{ user.username.charAt(0).toUpperCase() }}
              </div>
              <div class="user-details">
                <div class="username">{{ user.username }}</div>
                <div v-if="user.id === currentUser.id" class="current-user-tag">
                  当前用户
                </div>
              </div>
            </div>
          </div>
          <div class="table-cell">
            <span class="role-badge" :class="`role-${user.role}`">
              {{ getRoleName(user.role) }}
            </span>
            <span v-if="user.is_active === 0" class="status-badge inactive">已禁用</span>
          </div>
          <div class="table-cell">
            {{ user.email || '未设置' }}
          </div>
          <div class="table-cell">
            {{ formatDate(user.created_at) }}
          </div>
          <div class="table-cell actions">
            <button 
              class="action-btn edit-btn"
              @click="editUser(user)"
              title="编辑用户"
            >
              <i class="fas fa-edit"></i> 编辑
            </button>
            <button 
              v-if="user.id !== currentUser.id" 
              class="action-btn delete-btn"
              @click="deleteUser(user)"
              :disabled="deletingUserId === user.id"
            >
              <i class="fas fa-trash"></i> 删除
            </button>
            <button 
              v-else
              class="action-btn disabled"
              disabled
              title="无法删除自己"
            >
              <i class="fas fa-ban"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加用户模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>添加新用户</h2>
          <button class="close-btn" @click="showCreateModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createUser">
            <div class="form-group">
              <label>用户名 *</label>
              <input 
                v-model="newUser.username" 
                type="text" 
                required 
                placeholder="请输入用户名"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>密码 *</label>
              <input 
                v-model="newUser.password" 
                type="password" 
                required 
                placeholder="请输入密码"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>确认密码 *</label>
              <input 
                v-model="newUser.confirmPassword" 
                type="password" 
                required 
                placeholder="请再次输入密码"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input 
                v-model="newUser.email" 
                type="email" 
                placeholder="请输入邮箱（可选）"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>角色</label>
              <select v-model="newUser.role" class="form-input">
                <option value="admin">管理员</option>
                <option value="user">普通用户</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="showCreateModal = false">
                取消
              </button>
              <button type="submit" class="btn-primary" :disabled="creatingUser">
                {{ creatingUser ? '创建中...' : '创建用户' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 编辑用户模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>编辑用户</h2>
          <button class="close-btn" @click="showEditModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateUser">
            <div class="form-group">
              <label>用户名</label>
              <input :value="editingUser.username" disabled class="form-input" />
              <small class="form-hint">用户名不可修改</small>
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input v-model="editingUser.email" type="email" class="form-input" placeholder="请输入邮箱" />
            </div>
            <div class="form-group">
              <label>角色</label>
              <select v-model="editingUser.role" class="form-input">
                <option value="super_admin">超级管理员</option>
                <option value="admin">管理员</option>
                <option value="user">普通用户</option>
              </select>
            </div>
            <div class="form-group">
              <label>权限</label>
              <div class="permissions-grid">
                <label v-for="perm in availablePermissions" :key="perm.permission_name" class="permission-checkbox">
                  <input 
                    type="checkbox" 
                    :value="perm.permission_name"
                    v-model="editingUser.permissions"
                    :disabled="editingUser.role === 'super_admin'"
                  />
                  <span>{{ perm.description }}</span>
                </label>
              </div>
              <small v-if="editingUser.role === 'super_admin'" class="form-hint">超级管理员拥有所有权限</small>
            </div>
            <div class="form-group">
              <label>账号状态</label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="editingUser.is_active" :true-value="1" :false-value="0" />
                <span>启用账号</span>
              </label>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="showEditModal = false">
                取消
              </button>
              <button type="submit" class="btn-primary" :disabled="updatingUser">
                {{ updatingUser ? '保存中...' : '保存修改' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(false)
const error = ref(null)
const deletingUserId = ref(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const creatingUser = ref(false)
const updatingUser = ref(false)
const availablePermissions = ref([])

const currentUser = ref({
  id: 1,
  username: 'admin',
  role: 'super_admin'
})

const newUser = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  role: 'user'
})

const editingUser = ref({
  id: null,
  username: '',
  email: '',
  role: 'user',
  permissions: [],
  is_active: 1
})

// 从 localStorage 加载当前用户信息
const loadCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('blog_user')
    if (userStr) {
      currentUser.value = JSON.parse(userStr)
    }
  } catch (e) {
    console.error('加载用户信息失败:', e)
  }
}

const fetchUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('blog_token')
    const response = await fetch('/api/auth/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '获取用户列表失败')
    }
    
    const data = await response.json()
    console.log('用户数据:', data)
    users.value = data.users || []
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = err.message
    if (typeof showToast !== 'undefined') {
      showToast('加载用户失败：' + err.message, 'error')
    }
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  if (newUser.value.password !== newUser.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  
  if (!newUser.value.username || !newUser.value.password) {
    alert('用户名和密码不能为空')
    return
  }
  
  creatingUser.value = true
  
  try {
    const token = localStorage.getItem('blog_token')
    const response = await fetch('/api/auth/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        username: newUser.value.username,
        password: newUser.value.password,
        email: newUser.value.email || '',
        role: newUser.value.role
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '创建用户失败')
    }
    
    alert('用户创建成功！')
    showCreateModal.value = false
    newUser.value = {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      role: 'user'
    }
    await fetchUsers()
  } catch (err) {
    console.error('Error creating user:', err)
    alert('创建用户失败：' + err.message)
  } finally {
    creatingUser.value = false
  }
}

const deleteUser = async (user) => {
  if (confirm(`确定要删除用户 "${user.username}" 吗？此操作不可恢复！`)) {
    deletingUserId.value = user.id
    
    try {
      const token = localStorage.getItem('blog_token')
      const response = await fetch(`/api/auth/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '删除用户失败')
      }
      
      alert('用户删除成功！')
      await fetchUsers()
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('删除用户失败：' + err.message)
    } finally {
      deletingUserId.value = null
    }
  }
}

// 获取角色名称
const getRoleName = (role) => {
  const roles = {
    'super_admin': '超级管理员',
    'admin': '管理员',
    'user': '普通用户'
  }
  return roles[role] || role
}

// 编辑用户
const editUser = (user) => {
  editingUser.value = {
    id: user.id,
    username: user.username,
    email: user.email || '',
    role: user.role,
    permissions: user.permissions ? JSON.parse(user.permissions) : [],
    is_active: user.is_active
  }
  showEditModal.value = true
}

// 更新用户
const updateUser = async () => {
  updatingUser.value = true
  
  try {
    const token = localStorage.getItem('blog_token')
    const response = await fetch(`/api/auth/users/${editingUser.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: editingUser.value.email,
        role: editingUser.value.role,
        permissions: editingUser.value.permissions,
        is_active: editingUser.value.is_active
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '更新用户失败')
    }
    
    showToast('用户信息已更新', 'success')
    showEditModal.value = false
    await fetchUsers()
  } catch (err) {
    console.error('Error updating user:', err)
    showToast('更新失败：' + err.message, 'error')
  } finally {
    updatingUser.value = false
  }
}

// 加载权限列表
const loadPermissions = async () => {
  try {
    const token = localStorage.getItem('blog_token')
    const response = await fetch('/api/auth/permissions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      availablePermissions.value = data.permissions || []
    }
  } catch (err) {
    console.error('加载权限列表失败:', err)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadCurrentUser()
  fetchUsers()
  loadPermissions()
})
</script>

<style scoped>
.users-view {
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

.users-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.actions-bar {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-secondary {
  padding: 12px 24px;
  background: #f5f5f7;
  color: #1d1d1f;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.users-table {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1.5fr 1fr;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.table-header {
  background: #f5f5f7;
  font-weight: 600;
  color: #1d1d1f;
  border-bottom: 2px solid #e0e0e0;
}

.table-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 600;
  color: #1d1d1f;
}

.current-user-tag {
  font-size: 12px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.role-admin {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.role-user {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.actions {
  justify-content: flex-end;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
}

.disabled {
  background: #f5f5f7;
  color: #86868b;
  cursor: not-allowed;
}

.loading-state,
.error-state,
.empty-state {
  padding: 40px;
  text-align: center;
  color: #86868b;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #86868b;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f5f5f7;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
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

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.form-hint {
  font-size: 12px;
  color: #86868b;
  margin-top: 4px;
  display: block;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  background: #f5f5f7;
  border-radius: 10px;
}

.permission-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
}

.permission-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  margin-left: 8px;
}

.status-badge.inactive {
  background: rgba(255, 59, 48, 0.15);
  color: #ff3b30;
}

.edit-btn {
  background: #667eea;
  color: white;
}

.edit-btn:hover {
  background: #5568d3;
}

@media (max-width: 768px) {
  .users-view {
    padding: 16px 0;
  }
  
  .page-header {
    margin-bottom: 24px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 2fr 1fr 1fr;
  }
  
  .table-cell:nth-child(3),
  .table-cell:nth-child(4) {
    display: none;
  }
  
  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .modal-content {
    width: 90%;
    max-width: none;
    margin: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
  }
  
  .table-header {
    display: none;
  }
  
  .table-row {
    background: #f5f5f7;
    border-radius: 12px;
    margin-bottom: 12px;
  }
  
  .table-cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
  }
  
  .table-cell::before {
    font-weight: 600;
    color: #86868b;
  }
  
  .table-cell:nth-child(1)::before { content: '用户名'; }
  .table-cell:nth-child(2)::before { content: '角色'; }
  .table-cell:nth-child(5)::before { content: '操作'; }
  
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>