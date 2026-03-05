<template>
  <div class="projects-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-folder-open"></i> 个人项目
      </h1>
      <p class="page-subtitle">探索我的个人项目与作品</p>
    </div>

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
      <button @click="fetchProjects" class="retry-btn">重试</button>
    </div>

    <!-- 项目列表 -->
    <div v-else-if="projects.length === 0" class="empty-state">
      <i class="fas fa-folder-open"></i>
      <h3>暂无项目</h3>
      <p>还没有添加任何项目作品</p>
    </div>

    <div v-else class="projects-grid">
      <!-- 重点项目 -->
      <div v-if="featuredProjects.length > 0" class="featured-section">
        <h2 class="section-title">
          <i class="fas fa-star"></i> 推荐项目
        </h2>
        <div class="featured-grid">
          <div 
            v-for="project in featuredProjects" 
            :key="project.id" 
            class="project-card featured"
            @click="viewProject(project)"
          >
            <div class="project-image">
              <img 
                v-if="project.image_url" 
                :src="project.image_url" 
                :alt="project.name"
              />
              <div v-else class="image-placeholder">
                <i class="fas fa-project-diagram"></i>
              </div>
              <div class="project-status" :class="project.status">
                {{ getStatusText(project.status) }}
              </div>
            </div>
            <div class="project-content">
              <h3 class="project-name">{{ project.name }}</h3>
              <p class="project-description">{{ project.description }}</p>
              <div class="project-tech">
                <span 
                  v-for="(tech, index) in parseTechStack(project.tech_stack)" 
                  :key="index"
                  class="tech-tag"
                >
                  {{ tech }}
                </span>
              </div>
              <div class="project-links">
                <a 
                  v-if="project.url || project.demo_url" 
                  :href="project.demo_url || project.url" 
                  target="_blank"
                  class="link-btn"
                  @click.stop
                >
                  <i class="fas fa-external-link-alt"></i> 在线访问
                </a>
                <a 
                  v-if="project.github_url" 
                  :href="project.github_url" 
                  target="_blank"
                  class="link-btn github"
                  @click.stop
                >
                  <i class="fab fa-github"></i> GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 所有项目 -->
      <div class="all-projects-section">
        <h2 class="section-title">
          <i class="fas fa-list"></i> 全部项目
        </h2>
        <div class="projects-list">
          <div 
            v-for="project in projects" 
            :key="project.id" 
            class="project-item"
            @click="viewProject(project)"
          >
            <div class="project-info">
              <h3 class="project-name">{{ project.name }}</h3>
              <p class="project-description">{{ project.description }}</p>
              <div class="project-meta">
                <span class="status-badge" :class="project.status">
                  {{ getStatusText(project.status) }}
                </span>
                <span v-if="project.is_featured" class="featured-badge">
                  <i class="fas fa-star"></i> 推荐
                </span>
              </div>
            </div>
            <div class="project-actions">
              <a 
                v-if="project.url || project.demo_url" 
                :href="project.demo_url || project.url" 
                target="_blank"
                class="action-btn"
                @click.stop
              >
                <i class="fas fa-external-link-alt"></i>
              </a>
              <a 
                v-if="project.github_url" 
                :href="project.github_url" 
                target="_blank"
                class="action-btn github"
                @click.stop
              >
                <i class="fab fa-github"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const projects = ref([])
const loading = ref(true)
const error = ref(null)

const featuredProjects = computed(() => 
  projects.value.filter(p => p.is_featured)
)

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
    error.value = null
    
    const response = await fetch('/api/projects')
    if (!response.ok) {
      throw new Error('加载失败')
    }
    
    const data = await response.json()
    projects.value = data.projects || []
  } catch (err) {
    console.error('Error fetching projects:', err)
    error.value = '加载项目失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const viewProject = (project) => {
  router.push(`/projects/${project.id}`)
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.projects-page {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: 60px 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.loading-state, .error-state, .empty-state {
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

.empty-state {
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 64px;
  opacity: 0.3;
  margin-bottom: 16px;
}

.projects-grid {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.featured-section {
  margin-bottom: 60px;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 32px;
}

.project-card {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px var(--shadow-color);
  transition: all 0.3s;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px var(--shadow-color);
}

.project-image {
  position: relative;
  width: 100%;
  height: 220px;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: var(--text-secondary);
}

.project-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.7);
  color: white;
}

.project-status.completed {
  background: rgba(52, 199, 89, 0.9);
}

.project-status.in_progress {
  background: rgba(255, 149, 0, 0.9);
}

.project-content {
  padding: 24px;
}

.project-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.project-description {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin-bottom: 16px;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tech-tag {
  padding: 4px 12px;
  background: rgba(102, 126, 234, 0.1);
  color: var(--accent-primary);
  border-radius: 16px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.project-links {
  display: flex;
  gap: 12px;
}

.link-btn {
  flex: 1;
  padding: 10px 16px;
  background: var(--accent-primary);
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.link-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.link-btn.github {
  background: #333;
}

.all-projects-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.project-item:hover {
  background: var(--bg-hover);
  transform: translateX(4px);
}

.project-info {
  flex: 1;
}

.project-meta {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.status-badge, .featured-badge {
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

.featured-badge {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: white;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: translateY(-2px);
}

.action-btn.github:hover {
  border-color: #333;
  color: #333;
}

/* 响应式 */
@media (max-width: 768px) {
  .projects-page {
    padding: 40px 20px;
  }

  .page-title {
    font-size: 2rem;
  }

  .featured-grid {
    grid-template-columns: 1fr;
  }

  .project-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .project-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
