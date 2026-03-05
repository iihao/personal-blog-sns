<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧装饰 -->
      <div class="login-visual">
        <div class="visual-content">
          <h1>欢迎回来</h1>
          <p>登录以管理您的博客内容</p>
          <div class="visual-features">
            <div class="feature">
              <i class="fas fa-pen-fancy"></i>
              <span>文章管理</span>
            </div>
            <div class="feature">
              <i class="fas fa-comments"></i>
              <span>评论审核</span>
            </div>
            <div class="feature">
              <i class="fas fa-chart-line"></i>
              <span>数据统计</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="login-form-wrapper">
        <div class="login-form-container">
          <div class="form-header">
            <h2>账号登录</h2>
            <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <!-- 账号输入 -->
            <div class="form-group">
              <label for="username">
                <i class="fas fa-user"></i>
                账号
              </label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                placeholder="请输入用户名或邮箱"
                required
                class="form-input"
                :class="{ error: errors.username }"
              />
              <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
            </div>

            <!-- 密码输入 -->
            <div class="form-group">
              <label for="password">
                <i class="fas fa-lock"></i>
                密码
              </label>
              <div class="password-input-wrapper">
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  required
                  class="form-input"
                  :class="{ error: errors.password }"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>

            <!-- 记住我 & 忘记密码 -->
            <div class="form-options">
              <label class="checkbox-label">
                <input v-model="formData.remember" type="checkbox" />
                <span>记住我</span>
              </label>
              <router-link to="/forgot-password" class="forgot-link">忘记密码？</router-link>
            </div>

            <!-- 提交按钮 -->
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="!isLoading">
                <i class="fas fa-sign-in-alt"></i>
                登录
              </span>
              <span v-else class="loading-spinner">
                <i class="fas fa-circle-notch fa-spin"></i>
                登录中...
              </span>
            </button>

            <!-- 错误提示 -->
            <div v-if="loginError" class="login-error">
              <i class="fas fa-exclamation-circle"></i>
              {{ loginError }}
            </div>
          </form>

          <!-- 第三方登录占位（待实现） -->
          <!-- 
          <div class="social-login">
            <div class="divider">
              <span>或使用以下方式登录</span>
            </div>
            <div class="social-buttons">
              <button class="social-btn github" title="GitHub 登录">
                <i class="fab fa-github"></i>
              </button>
              <button class="social-btn google" title="Google 登录">
                <i class="fab fa-google"></i>
              </button>
            </div>
          </div>
          -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  username: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const isLoading = ref(false)
const loginError = ref('')
const errors = ref({})

// 表单验证
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.username.trim()) {
    errors.value.username = '请输入账号'
  }
  
  if (!formData.value.password) {
    errors.value.password = '请输入密码'
  } else if (formData.value.password.length < 6) {
    errors.value.password = '密码长度至少 6 位'
  }
  
  return Object.keys(errors.value).length === 0
}

// 登录处理
const handleLogin = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  loginError.value = ''
  
  try {
    console.log('开始登录...', formData.value.username)
    
    // 重试逻辑（最多 3 次）
    let response
    let lastError
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: formData.value.username,
            password: formData.value.password
          })
        })
        
        // 如果是 502/503/504 错误，等待后重试
        if ([502, 503, 504].includes(response.status) && attempt < 3) {
          console.log(`请求失败 (${response.status})，${attempt}/3，等待重试...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }
        
        break
      } catch (err) {
        lastError = err
        if (attempt < 3) {
          console.log(`请求出错，${attempt}/3，等待重试...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
    
    if (!response) {
      throw new Error(lastError?.message || '网络连接失败，请检查网络或服务状态')
    }
    
    console.log('响应状态:', response.status)
    
    // 检查响应类型
    const contentType = response.headers.get('content-type')
    console.log('Content-Type:', contentType)
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('非 JSON 响应:', text.substring(0, 200))
      
      if (response.status === 502) {
        throw new Error('服务暂时不可用，请稍后重试（502 Bad Gateway）')
      } else if (response.status === 503) {
        throw new Error('服务维护中，请稍后重试（503 Service Unavailable）')
      } else {
        throw new Error('服务器返回了非 JSON 响应，请联系管理员')
      }
    }
    
    const data = await response.json()
    console.log('响应数据:', data)
    
    if (!response.ok) {
      throw new Error(data.error || '登录失败')
    }
    
    if (!data.success) {
      throw new Error(data.error || '登录失败')
    }
    
    // 保存用户信息和 Token
    const userData = {
      id: data.user.id || 1,
      username: data.user.username,
      name: data.user.name || data.user.username,
      email: data.user.email || '',
      avatar: data.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.username)}&background=667eea&color=fff&size=128`,
      role: data.user.role || 'user',
      permissions: data.user.permissions || []
    }
    
    // 保存到 localStorage
    localStorage.setItem('blog_user', JSON.stringify(userData))
    localStorage.setItem('blog_token', data.token)
    localStorage.setItem('blog_token_expiry', Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 天
    
    // 如果选择记住我
    if (formData.value.remember) {
      localStorage.setItem('blog_remember', 'true')
    }
    
    // 更新 Pinia store 状态（关键修复！）
    authStore.setToken(data.token)
    authStore.user = userData
    
    // 触发 storage 事件（通知其他组件登录状态已改变）
    window.dispatchEvent(new Event('storage'))
    
    console.log('登录成功:', userData)
    console.log('Auth store 状态:', {
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user,
      token: authStore.token
    })
    
    // 跳转到首页或之前访问的页面
    const redirect = router.currentRoute.value.query.redirect || '/'
    router.push(redirect)
    
  } catch (error) {
    console.error('Login error:', error)
    loginError.value = error.message || '登录失败，请检查账号密码'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
}

.login-container {
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;
}

/* 左侧视觉区域 */
.login-visual {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  display: flex;
  align-items: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.login-visual::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(180deg); }
}

.visual-content {
  position: relative;
  z-index: 1;
}

.visual-content h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
}

.visual-content p {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 40px;
}

.visual-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
}

.feature i {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

/* 右侧表单区域 */
.login-form-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: white;
}

.login-form-container {
  width: 100%;
  max-width: 360px;
}

.form-header {
  margin-bottom: 32px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.form-header p {
  color: #86868b;
  font-size: 14px;
}

.form-header a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.form-header a:hover {
  text-decoration: underline;
}

/* 表单样式 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.form-group label i {
  color: #667eea;
}

.form-input {
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #ff3b30;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #86868b;
  padding: 4px;
}

.password-toggle:hover {
  color: #1d1d1f;
}

.error-message {
  font-size: 13px;
  color: #ff3b30;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #86868b;
  cursor: pointer;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.forgot-link {
  font-size: 14px;
  color: #667eea;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* 提交按钮 */
.submit-btn {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner i {
  margin-right: 8px;
}

/* 错误提示 */
.login-error {
  padding: 14px 16px;
  background: rgba(255, 59, 48, 0.1);
  border-radius: 12px;
  color: #ff3b30;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 第三方登录 */
.social-login {
  margin-top: 32px;
}

.divider {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  position: relative;
  background: white;
  padding: 0 12px;
  color: #86868b;
  font-size: 13px;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.social-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.social-btn.github { color: #333; }
.social-btn.github:hover { border-color: #333; background: #333; color: white; }

.social-btn.google { color: #db4437; }
.social-btn.google:hover { border-color: #db4437; background: #db4437; color: white; }

.social-btn.wechat { color: #07c160; }
.social-btn.wechat:hover { border-color: #07c160; background: #07c160; color: white; }

/* 响应式 */
@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
  }
  
  .login-visual {
    display: none;
  }
  
  .login-form-wrapper {
    padding: 40px 24px;
  }
}
</style>
