<template>
  <div class="project-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载项目...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button @click="fetchProject" class="retry-btn">重试</button>
    </div>

    <!-- 项目详情 -->
    <div v-else-if="project" class="project-content">
      <!-- 项目头部 -->
      <div class="project-header">
        <div class="project-banner">
          <img 
            v-if="project.image_url" 
            :src="project.image_url" 
            :alt="project.name"
          />
          <div v-else class="banner-placeholder">
            <i class="fas fa-project-diagram"></i>
          </div>
        </div>
        
        <div class="project-info-header">
          <div class="project-badges">
            <span class="status-badge" :class="project.status">
              {{ getStatusText(project.status) }}
            </span>
            <span v-if="project.is_featured" class="featured-badge">
              <i class="fas fa-star"></i> 推荐项目
            </span>
          </div>
          
          <h1 class="project-title">{{ project.name }}</h1>
          
          <div class="project-links">
            <a 
              v-if="project.demo_url" 
              :href="project.demo_url" 
              target="_blank"
              class="link-btn primary"
            >
              <i class="fas fa-external-link-alt"></i> 在线演示
            </a>
            <a 
              v-if="project.github_url" 
              :href="project.github_url" 
              target="_blank"
              class="link-btn github"
            >
              <i class="fab fa-github"></i> GitHub
            </a>
            <a 
              v-if="project.url" 
              :href="project.url" 
              target="_blank"
              class="link-btn"
            >
              <i class="fas fa-link"></i> 项目主页
            </a>
          </div>
        </div>
      </div>

      <!-- 项目描述 -->
      <div class="project-section">
        <h2 class="section-title">
          <i class="fas fa-align-left"></i> 项目描述
        </h2>
        <p class="project-description">
          {{ project.description || '暂无描述' }}
        </p>
      </div>

      <!-- 技术栈 -->
      <div class="project-section">
        <h2 class="section-title">
          <i class="fas fa-code"></i> 技术栈
        </h2>
        <div class="tech-stack">
          <span 
            v-for="(tech, index) in parseTechStack(project.tech_stack)" 
            :key="index"
            class="tech-item"
          >
            <i class="fas fa-circle"></i>
            {{ tech }}
          </span>
        </div>
      </div>

      <!-- 项目信息 -->
      <div class="project-section">
        <h2 class="section-title">
          <i class="fas fa-info-circle"></i> 项目信息
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <label>创建时间</label>
            <span>{{ formatDate(project.created_at) }}</span>
          </div>
          <div class="info-item">
            <label>更新时间</label>
            <span>{{ formatDate(project.updated_at) }}</span>
          </div>
          <div class="info-item">
            <label>项目状态</label>
            <span class="status-badge" :class="project.status">
              {{ getStatusText(project.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- GitHub 准备提示 -->
      <div class="github-notice">
        <i class="fab fa-github"></i>
        <div>
          <h3>GitHub 准备中</h3>
          <p>该项目计划开源到 GitHub，敬请期待！</p>
        </div>
      </div>

      <!-- 返回按钮 -->
      <div class="back-section">
        <button @click="goBack" class="back-btn">
          <i class="fas fa-arrow-left"></i> 返回项目列表
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const project = ref(null)
const loading = ref(true)
const error = ref(null)

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

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchProject = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch(`/api/projects/${route.params.id}`)
    if (!response.ok) {
      throw new Error('项目不存在')
    }
    
    const data = await response.json()
    project.value = data.project
  } catch (err) {
    console.error('Error fetching project:', err)
    error.value = '加载项目失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/projects')
}

onMounted(() => {
  fetchProject()
})
</script>

<style scoped>
.project-detail-page {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: 60px 24px;
}

.loading-state, .error-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.project-content {
  max-width: 1000px;
  margin: 0 auto;
}

.project-header {
  background: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 24px var(--shadow-color);
  margin-bottom: 32px;
}

.project-banner {
  width: 100%;
  height: 400px;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.project-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 96px;
  color: var(--text-secondary);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.project-info-header {
  padding: 40px;
}

.project-badges {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.status-badge, .featured-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
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

.featured-badge {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.project-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.project-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.link-btn {
  padding: 12px 24px;
  background: white;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-color);
}

.link-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.link-btn.primary {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.link-btn.github {
  background: #333;
  color: white;
  border-color: #333;
}

.project-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.project-description {
  color: var(--text-secondary);
  font-size: 1.0625rem;
  line-height: 1.8;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  color: var(--accent-primary);
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
}

.tech-item i {
  font-size: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.info-item span {
  font-size: 1rem;
  color: var(--text-primary);
}

.github-notice {
  background: linear-gradient(135deg, rgba(33, 33, 33, 0.95), rgba(51, 51, 51, 0.95));
  border-radius: 16px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  color: white;
  margin-bottom: 32px;
}

.github-notice i {
  font-size: 48px;
}

.github-notice h3 {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.github-notice p {
  opacity: 0.8;
}

.back-section {
  text-align: center;
  padding: 20px;
}

.back-btn {
  padding: 12px 24px;
  background: transparent;
  color: var(--accent-primary);
  border: 2px solid var(--accent-primary);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
}

/* 响应式 */
@media (max-width: 768px) {
  .project-detail-page {
    padding: 40px 20px;
  }

  .project-banner {
    height: 250px;
  }

  .project-info-header {
    padding: 24px;
  }

  .project-title {
    font-size: 1.75rem;
  }

  .project-section {
    padding: 24px;
  }

  .github-notice {
    flex-direction: column;
    text-align: center;
  }
}
</style>
