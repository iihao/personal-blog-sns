<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="register-title">
        <i class="fas fa-user-plus"></i> 用户注册
      </h1>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username">
            <i class="fas fa-user"></i> 用户名
          </label>
          <input 
            id="username"
            v-model="form.username" 
            type="text" 
            placeholder="请输入用户名"
            required
            minlength="3"
            maxlength="20"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email">
            <i class="fas fa-envelope"></i> 邮箱
          </label>
          <input 
            id="email"
            v-model="form.email" 
            type="email" 
            placeholder="请输入邮箱"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i> 密码
          </label>
          <input 
            id="password"
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            required
            minlength="6"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">
            <i class="fas fa-lock"></i> 确认密码
          </label>
          <input 
            id="confirmPassword"
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
            required
            class="form-input"
          />
        </div>

        <div v-if="error" class="error-message">
          <i class="fas fa-exclamation-circle"></i> {{ error }}
        </div>

        <div v-if="success" class="success-message">
          <i class="fas fa-check-circle"></i> {{ success }}
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          <span v-if="!loading">
            <i class="fas fa-user-plus"></i> 注册
          </span>
          <span v-else>
            <i class="fas fa-spinner fa-spin"></i> 注册中...
          </span>
        </button>

        <div class="form-footer">
          <p>已有账号？<router-link to="/login">立即登录</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const handleRegister = async () => {
  error.value = ''
  success.value = ''

  // 验证密码
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (form.value.password.length < 6) {
    error.value = '密码长度至少 6 位'
    return
  }

  try {
    loading.value = true

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: form.value.username,
        email: form.value.email,
        password: form.value.password
      })
    })

    const data = await response.json()

    if (response.ok) {
      success.value = '注册成功！即将跳转到登录页面...'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = data.error || '注册失败，请稍后重试'
    }
  } catch (err) {
    console.error('Register error:', err)
    error.value = '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
}

:global(.dark) .register-page {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
}

.register-card {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: 0 20px 60px var(--shadow-color);
  padding: 48px;
  width: 100%;
  max-width: 440px;
  border: 1px solid var(--border-color);
  animation: slide-up 0.5s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-title {
  font-size: clamp(1.5rem, 4vw, 1.75rem);
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.register-title i {
  color: var(--accent-primary);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group label i {
  color: var(--accent-primary);
  font-size: 0.875rem;
}

.form-input {
  padding: 14px 18px;
  border: 2px solid var(--input-border);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: var(--input-bg);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.error-message, .success-message {
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.success-message {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.submit-btn {
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.form-footer a {
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.form-footer a:hover {
  color: var(--accent-secondary);
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 640px) {
  .register-card {
    padding: 36px 24px;
  }

  .register-title {
    font-size: 1.5rem;
  }

  .form-input {
    padding: 12px 16px;
  }
}
</style>
