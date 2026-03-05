<template>
  <div class="forbidden-page">
    <div class="forbidden-content">
      <div class="forbidden-icon">
        <i class="fas fa-lock"></i>
      </div>
      <h1>403</h1>
      <h2>无权限访问</h2>
      <p class="forbidden-message">抱歉，您没有权限访问此页面</p>
      <p class="forbidden-hint">此页面仅限管理员访问</p>
      <div class="forbidden-actions">
        <router-link to="/" class="btn btn-primary">
          <i class="fas fa-home"></i> 返回首页
        </router-link>
        <button @click="goBack" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> 返回上一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.forbidden-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.forbidden-content {
  text-align: center;
  color: white;
  max-width: 500px;
}

.forbidden-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.9;
}

.forbidden-content h1 {
  font-size: 120px;
  margin: 0;
  font-weight: 700;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.forbidden-content h2 {
  font-size: 32px;
  margin: 10px 0 20px;
  font-weight: 600;
}

.forbidden-message {
  font-size: 18px;
  opacity: 0.95;
  margin-bottom: 10px;
}

.forbidden-hint {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 30px;
}

.forbidden-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .forbidden-content h1 {
    font-size: 80px;
  }
  
  .forbidden-content h2 {
    font-size: 24px;
  }
  
  .forbidden-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
