<template>
  <div class="config-view">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-cogs"></i> 系统配置
      </h1>
      <p class="page-subtitle">管理系统全局配置（仅超级管理员）</p>
    </div>

    <div class="config-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载配置...</p>
      </div>

      <div v-else-if="!isSuperAdmin" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>需要超级管理员权限</p>
        <p class="error-hint">只有超级管理员可以访问系统配置</p>
      </div>

      <div v-else class="config-form">
        <div class="config-section">
          <h2 class="section-title">
            <i class="fas fa-info-circle"></i> 基本信息
          </h2>
          <div class="form-group">
            <label>网站名称</label>
            <input v-model="config.site_name" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>网站描述</label>
            <textarea v-model="config.site_description" class="form-textarea" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>SEO 关键词</label>
            <input v-model="config.site_keywords" type="text" class="form-input" placeholder="用逗号分隔" />
          </div>
        </div>

        <div class="config-section">
          <h2 class="section-title">
            <i class="fas fa-newspaper"></i> 内容设置
          </h2>
          <div class="form-group">
            <label>每页文章数</label>
            <input v-model.number="config.posts_per_page" type="number" class="form-input" min="1" max="50" />
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="config.allow_register" :true-value="'true'" :false-value="'false'" />
              <span>允许用户注册</span>
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="config.comment_need_audit" :true-value="'true'" :false-value="'false'" />
              <span>评论需要审核</span>
            </label>
          </div>
        </div>

        <div class="config-section">
          <h2 class="section-title">
            <i class="fas fa-upload"></i> 上传设置
          </h2>
          <div class="form-group">
            <label>最大上传文件大小</label>
            <input v-model.number="config.max_upload_size" type="number" class="form-input" step="1024" />
            <small class="form-hint">单位：字节 (当前：{{ formatSize(config.max_upload_size) }})</small>
          </div>
          <div class="form-group">
            <label>允许的文件类型</label>
            <input v-model="config.allowed_file_types" type="text" class="form-input" placeholder="用逗号分隔" />
            <small class="form-hint">例如：jpg,jpeg,png,gif,webp</small>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-secondary" @click="loadConfig">
            <i class="fas fa-undo"></i> 重置
          </button>
          <button class="btn-primary" @click="saveConfig" :disabled="saving">
            <i class="fas fa-save"></i> {{ saving ? '保存中...' : '保存配置' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../store'

const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.user?.role === 'super_admin')

const loading = ref(true)
const saving = ref(false)

const config = ref({
  site_name: '',
  site_description: '',
  site_keywords: '',
  posts_per_page: 10,
  allow_register: 'true',
  comment_need_audit: 'true',
  max_upload_size: 5242880,
  allowed_file_types: 'jpg,jpeg,png,gif,webp'
})

// 格式化文件大小
const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 加载配置
const loadConfig = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('blog_token')
    const res = await fetch('/api/auth/config', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (res.ok) {
      const data = await res.json()
      config.value = { ...config.value, ...data.config }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    showToast('加载配置失败', 'error')
  } finally {
    loading.value = false
  }
}

// 保存配置
const saveConfig = async () => {
  saving.value = true
  try {
    const token = localStorage.getItem('blog_token')
    
    // 逐个保存配置项
    for (const [key, value] of Object.entries(config.value)) {
      await fetch('/api/auth/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          config_key: key,
          config_value: String(value)
        })
      })
    }
    
    showToast('配置已保存', 'success')
  } catch (error) {
    console.error('保存配置失败:', error)
    showToast('保存失败：' + error.message, 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.config-view {
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

.config-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-hint {
  color: #86868b;
  margin-top: 8px;
}

.config-form {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.config-section {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e0e0e0;
}

.config-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
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

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  background: white;
  color: #1d1d1f;
}

.form-input:focus, .form-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-hint {
  font-size: 12px;
  color: #86868b;
  margin-top: 4px;
  display: block;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .config-view {
    padding: 16px 0;
  }
  
  .config-container {
    padding: 0 16px;
  }
  
  .config-form {
    padding: 24px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
