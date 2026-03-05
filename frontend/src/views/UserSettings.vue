<template>
  <div class="user-settings">
    <h2>
      <i class="fas fa-user-cog"></i> 个人设置
    </h2>

    <!-- 个人信息 -->
    <section class="settings-section">
      <h3>个人信息</h3>
      <form @submit.prevent="updateProfile">
        <div class="form-group">
          <label>用户名</label>
          <input 
            v-model="user.username" 
            type="text" 
            disabled
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>邮箱</label>
          <input 
            v-model="user.email" 
            type="email" 
            class="form-input"
            placeholder="your@email.com"
          />
        </div>

        <div class="form-group">
          <label>头像 URL</label>
          <input 
            v-model="user.avatar" 
            type="url" 
            class="form-input"
            placeholder="https://..."
          />
        </div>

        <div class="form-group">
          <label>个人简介</label>
          <textarea 
            v-model="user.bio" 
            rows="4"
            class="form-textarea"
            placeholder="介绍一下自己..."
          ></textarea>
        </div>

        <button type="submit" :disabled="saving" class="btn-primary">
          {{ saving ? '保存中...' : '保存修改' }}
        </button>
      </form>
    </section>

    <!-- 修改密码 -->
    <section class="settings-section">
      <h3>修改密码</h3>
      <form @submit.prevent="changePassword">
        <div class="form-group">
          <label>当前密码</label>
          <input 
            v-model="passwordForm.currentPassword" 
            type="password" 
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label>新密码</label>
          <input 
            v-model="passwordForm.newPassword" 
            type="password" 
            class="form-input"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label>确认新密码</label>
          <input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            class="form-input"
            required
          />
        </div>

        <button type="submit" :disabled="changingPassword" class="btn-primary">
          {{ changingPassword ? '修改中...' : '修改密码' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'

const router = useRouter()
const authStore = useAuthStore()

const user = ref({
  username: '',
  email: '',
  avatar: '',
  bio: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const saving = ref(false)
const changingPassword = ref(false)

// 检查登录状态
const checkAuth = async () => {
  const isAuthenticated = await authStore.checkAuth()
  if (!isAuthenticated) {
    // 重定向到登录页，并携带返回地址
    router.push(`/login?redirect=${encodeURIComponent('/settings')}`)
    return false
  }
  return true
}

// 加载用户信息
const loadUser = async () => {
  try {
    const userData = await authStore.fetchUser()
    if (userData) {
      user.value = {
        username: userData.username || '',
        email: userData.email || '',
        avatar: userData.avatar || '',
        bio: userData.bio || ''
      }
    }
  } catch (error) {
    console.error('Error loading user:', error)
  }
}

// 更新个人资料
const updateProfile = async () => {
  try {
    saving.value = true
    
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        email: user.value.email,
        avatar: user.value.avatar,
        bio: user.value.bio
      })
    })

    if (response.ok) {
      showToast('个人资料更新成功！', 'success')
      await loadUser()
    } else {
      const error = await response.json()
      showToast(`更新失败：${error.error}`, 'error')
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    showToast('更新失败，请稍后重试', 'error')
  } finally {
    saving.value = false
  }
}

// 修改密码
const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showToast('两次输入的新密码不一致', 'error')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    showToast('密码长度至少 6 位', 'error')
    return
  }

  try {
    changingPassword.value = true
    
    const response = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      })
    })

    if (response.ok) {
      showToast('密码修改成功！请重新登录', 'success')
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      authStore.logout()
      router.push('/login')
    } else {
      const error = await response.json()
      showToast(`修改失败：${error.error}`, 'error')
    }
  } catch (error) {
    console.error('Error changing password:', error)
    showToast('修改失败，请稍后重试', 'error')
  } finally {
    changingPassword.value = false
  }
}

// 生命周期
onBeforeMount(async () => {
  const isAuthenticated = await checkAuth()
  if (isAuthenticated) {
    await loadUser()
  }
})
</script>

<style scoped>
.user-settings {
  max-width: 640px;
  margin: 0 auto;
  padding: 60px 24px;
}

.user-settings h2 {
  font-size: clamp(1.5rem, 4vw, 1.75rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-settings h2 i {
  color: var(--accent-primary);
}

.settings-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: box-shadow 0.2s ease;
}

.settings-section:hover {
  box-shadow: 0 4px 16px var(--shadow-color);
}

.settings-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-of-type {
  margin-bottom: 24px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.form-group label .required {
  color: #ef4444;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--input-border);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: var(--input-bg);
  color: var(--text-primary);
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder, .form-textarea::placeholder {
  color: var(--text-tertiary);
}

.form-input:disabled {
  background: var(--bg-tertiary);
  cursor: not-allowed;
  opacity: 0.7;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.btn-primary {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 640px) {
  .user-settings {
    padding: 40px 16px;
  }

  .settings-section {
    padding: 20px;
  }
}
</style>
