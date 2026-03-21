<template>
  <div class="post-view">
    <!-- 阅读进度条 -->
    <ReadingProgress />

    <!-- 回到顶部按钮 -->
    <BackToTop />

    <!-- 主题切换按钮 -->
    <div class="theme-toggle-fixed">
      <ThemeToggle />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载文章...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button @click="fetchPost" class="retry-btn">重试</button>
    </div>

    <!-- Post Content -->
    <template v-else-if="post">
      <div class="post-layout">
        <!-- Main Content -->
        <article class="post-main">
          <header class="post-header">
            <div class="post-meta-top">
              <span v-if="post.category" class="post-category">
                <i class="fas fa-folder"></i> {{ post.category }}
              </span>
              <span class="post-date">
                <i class="fas fa-calendar"></i> {{ formatDate(post.created_at) }}
              </span>
              <span class="post-read-time" v-if="readTime">
                <i class="fas fa-clock"></i> 阅读约 {{ readTime }} 分钟
              </span>
            </div>
            
            <h1 class="post-title">{{ post.title }}</h1>
            
            <div class="post-author">
              <span class="author-name">
                <i class="fas fa-user"></i> {{ post.author || 'Admin' }}
              </span>
            </div>

            <!-- Tags -->
            <div v-if="post.tags" class="post-tags">
              <span v-for="(tag, index) in post.tags.split(',')" :key="index" class="tag">
                #{{ tag.trim() }}
              </span>
            </div>
          </header>
          
          <div class="post-content-wrapper">
            <div class="post-content">
              <!-- 自动判断内容格式：如果包含 HTML 标签则直接渲染 -->
              <template v-if="post.content_format === 'richText' || (post.content && post.content.trim().startsWith('<'))">
                <div class="rich-text-content" v-html="post.content"></div>
              </template>
              <template v-else>
                <MarkdownPreview :content="post.content" />
              </template>
            </div>
            
            <!-- 文章目录 -->
            <aside class="post-toc">
              <TableOfContents :content="post.content" />
            </aside>
          </div>
          
          <!-- Post Footer -->
          <div class="post-footer">
            <div class="post-stats">
              <span class="stat-item" v-if="viewCount">
                <i class="fas fa-eye"></i> {{ viewCount }} 次阅读
              </span>
              <button 
                class="stat-item like-btn" 
                :class="{ 'liked': isLiked }"
                @click="toggleLike"
                :disabled="liking"
              >
                <i :class="isLiked ? 'fas fa-heart' : 'far fa-heart'"></i> 
                {{ likeCount }} 次点赞
              </button>
            </div>
            <div v-if="liking" class="like-status">
              <i class="fas fa-spinner fa-spin"></i> 处理中...
            </div>
            <div v-else-if="likeError" class="like-error">
              <i class="fas fa-exclamation-circle"></i> {{ likeError }}
            </div>
          </div>

          <!-- Share Buttons -->
          <ShareButtons />

          <!-- Navigation -->
          <div class="post-navigation">
            <router-link 
              v-if="prevPost" 
              :to="`/post/${prevPost.id}`"
              class="nav-link prev"
            >
              <div class="nav-label">← 上一篇</div>
              <div class="nav-title">{{ prevPost.title }}</div>
            </router-link>
            <div v-else class="nav-link placeholder"></div>
            
            <router-link 
              v-if="nextPost" 
              :to="`/post/${nextPost.id}`"
              class="nav-link next"
            >
              <div class="nav-label">下一篇 →</div>
              <div class="nav-title">{{ nextPost.title }}</div>
            </router-link>
            <div v-else class="nav-link placeholder"></div>
          </div>

          <!-- Comments Section -->
          <section class="comments-section">
            <h2 class="comments-title">
              <i class="fas fa-comments"></i> 评论 ({{ countComments(comments) }})
            </h2>

            <!-- Comment Form -->
            <div class="comment-form">
              <h3>发表评论</h3>
              
              <!-- 未登录提示 -->
              <div v-if="!isAuthenticated" class="login-required">
                <p>请先<a href="/login" @click.prevent="goToLogin">登录</a>才能发表评论。</p>
              </div>
              
              <!-- 登录后评论表单 -->
              <form v-else @submit.prevent="submitComment">
                <div class="form-group">
                  <textarea 
                    v-model="commentForm.content" 
                    placeholder="写下您的评论..." 
                    required
                    rows="4"
                    class="form-textarea"
                  ></textarea>
                </div>
                <div class="form-actions">
                  <button type="submit" :disabled="submitting" class="submit-btn">
                    {{ submitting ? '提交中...' : '发表评论' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Comments List -->
            <div class="comments-list">
              <div v-if="!comments || comments.length === 0" class="no-comments">
                <p>暂无评论，快来抢沙发吧！</p>
              </div>
              <CommentTree 
                v-for="comment in comments" 
                :key="comment.id" 
                :comment="comment" 
                :post-id="route.params.id"
                :can-delete="false"
                @reply-submitted="fetchComments"
                @comment-deleted="fetchComments"
              />
            </div>
          </section>
        </article>

        <!-- Sidebar (Table of Contents) -->
        <aside class="post-sidebar">
          <TableOfContents :content="post.content" />
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store'
import ThemeToggle from '../components/ThemeToggle.vue'
import MarkdownPreview from '../components/MarkdownPreview.vue'
import TableOfContents from '../components/TableOfContents.vue'
import CommentTree from '../components/CommentTree.vue'
import ReadingProgress from '../components/ReadingProgress.vue'
import BackToTop from '../components/BackToTop.vue'
import ShareButtons from '../components/ShareButtons.vue'
import { useMarkdown } from '../composables/useMarkdown'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const post = ref(null)
const prevPost = ref(null)
const nextPost = ref(null)
const comments = ref([])
const loading = ref(true)
const error = ref(null)
const submitting = ref(false)
const viewCount = ref(0)

// 点赞相关
const likeCount = ref(0)
const isLiked = ref(false)
const liking = ref(false)
const likeError = ref(null)
const deviceId = ref('')

const { calculateReadTime } = useMarkdown()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.user)

// 生成设备 ID（用于未登录用户）
const generateDeviceId = () => {
  let id = localStorage.getItem('blog_device_id')
  if (!id) {
    id = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
    localStorage.setItem('blog_device_id', id)
  }
  deviceId.value = id
  return id
}

// 获取用户代理
const getDeviceName = () => {
  const ua = navigator.userAgent
  if (ua.includes('Mobile')) return '移动设备'
  if (ua.includes('Tablet')) return '平板设备'
  if (ua.includes('Mac')) return 'Mac'
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Linux')) return 'Linux'
  return '未知设备'
}

const commentForm = ref({
  content: ''
})

const goToLogin = () => {
  router.push('/login?redirect=' + encodeURIComponent(route.fullPath))
}

const readTime = computed(() => {
  if (!post.value?.content) return 0
  return calculateReadTime(post.value.content)
})

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

const fetchPost = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('Fetching post:', route.params.id)
    const response = await fetch(`/api/posts/${route.params.id}`)
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('Post data:', data)
    post.value = data.post
    
    if (!post.value) {
      error.value = '文章不存在'
      loading.value = false
      return
    }
    
    // 设置阅读量
    viewCount.value = data.viewCount || post.value.view_count || 0
    
    await fetchAllPosts()
    await fetchComments()
    await fetchLikeCount()
    await checkLikeStatus()
    
  } catch (err) {
    console.error('Error fetching post:', err)
    error.value = '加载文章失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const fetchAllPosts = async () => {
  try {
    const response = await fetch('/api/posts')
    const data = await response.json()
    const posts = data.posts || []
    
    const currentIndex = posts.findIndex(p => p.id === post.value.id)
    if (currentIndex !== -1) {
      prevPost.value = posts[currentIndex + 1] || null
      nextPost.value = posts[currentIndex - 1] || null
    }
  } catch (err) {
    console.error('Error fetching all posts:', err)
  }
}

const fetchComments = async () => {
  try {
    // 只显示已审核的评论
    const response = await fetch(`/api/comments?post_id=${route.params.id}&approved=true`)
    const data = await response.json()
    // 过滤：只显示已审核评论
    comments.value = (data.comments || []).filter(c => c.status === 'approved')
  } catch (err) {
    console.error('Error fetching comments:', err)
  }
}

const submitComment = async () => {
  if (!commentForm.value.content) {
    showToast('请输入评论内容', 'error')
    return
  }

  try {
    submitting.value = true
    
    // 从 localStorage 获取用户信息
    const userStr = localStorage.getItem('blog_user')
    let authorName = '游客'
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        authorName = userData.name || userData.username || '游客'
      } catch (e) {
        console.error('解析用户数据失败:', e)
      }
    }
    
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_id: parseInt(route.params.id),
        author_name: authorName,
        content: commentForm.value.content
      })
    })

    if (response.ok) {
      showToast('评论提交成功！等待审核后显示。', 'success')
      commentForm.value = { content: '' }
      await fetchComments()
    } else {
      const error = await response.json()
      showToast(`评论失败：${error.error}`, 'error')
    }
  } catch (err) {
    console.error('Error submitting comment:', err)
    showToast('评论提交失败，请稍后重试', 'error')
  } finally {
    submitting.value = false
  }
}

const countComments = (comments) => {
  if (!comments || comments.length === 0) return 0
  
  let count = comments.length
  comments.forEach(comment => {
    if (comment.replies && comment.replies.length > 0) {
      count += countComments(comment.replies)
    }
  })
  return count
}

onMounted(() => {
  generateDeviceId()
  fetchPost()
})

// 监听路由参数变化，解决组件复用时数据不刷新的问题
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    console.log('Route param changed, reloading post:', newId)
    post.value = null
    prevPost.value = null
    nextPost.value = null
    comments.value = []
    loading.value = true
    error.value = null
    isLiked.value = false
    likeCount.value = 0
    fetchPost()
  }
})

// ===== 点赞功能 =====

// 获取点赞数
const fetchLikeCount = async () => {
  try {
    const response = await fetch(`/api/likes/post/${route.params.id}`)
    const data = await response.json()
    likeCount.value = data.count || 0
  } catch (err) {
    console.error('Error fetching like count:', err)
  }
}

// 检查是否已点赞
const checkLikeStatus = async () => {
  try {
    const headers = {}
    const token = localStorage.getItem('blog_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    if (deviceId.value) {
      headers['X-Device-Id'] = deviceId.value
    }
    
    const response = await fetch(`/api/likes/post/${route.params.id}/check`, { headers })
    const data = await response.json()
    isLiked.value = data.liked || false
  } catch (err) {
    console.error('Error checking like status:', err)
  }
}

// 点赞/取消点赞
const toggleLike = async () => {
  if (liking.value) return
  
  liking.value = true
  likeError.value = null
  
  try {
    if (isLiked.value) {
      // 取消点赞（需要登录）
      if (!authStore.isAuthenticated) {
        likeError.value = '取消点赞需要登录'
        liking.value = false
        return
      }
      
      const response = await fetch(`/api/likes/post/${route.params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        likeCount.value = data.count
        isLiked.value = false
        showToast('已取消点赞', 'success')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || '取消点赞失败')
      }
    } else {
      // 点赞
      const headers = {
        'Content-Type': 'application/json'
      }
      const token = localStorage.getItem('blog_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const body = {
        device_id: deviceId.value,
        device_name: getDeviceName()
      }
      
      const response = await fetch(`/api/likes/post/${route.params.id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })
      
      if (response.ok) {
        const data = await response.json()
        likeCount.value = data.count
        isLiked.value = true
        showToast(authStore.isAuthenticated ? '点赞成功' : '点赞成功（未登录）', 'success')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || '点赞失败')
      }
    }
  } catch (err) {
    console.error('Error toggling like:', err)
    likeError.value = err.message
    showToast(err.message, 'error')
  } finally {
    liking.value = false
  }
}
</script>

<style scoped>
/* ===== 页面基础 ===== */
.post-view {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.theme-toggle-fixed {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.theme-toggle-fixed:hover {
  opacity: 1;
}

/* ===== 加载/错误状态 ===== */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(124, 58, 237, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.retry-btn {
  margin-top: 24px;
  padding: 12px 32px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
}

/* ===== 主布局 ===== */
.post-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  align-items: start;
}

@media (min-width: 1400px) {
  .post-layout {
    max-width: 1200px;
  }
}

@media (max-width: 1024px) {
  .post-layout {
    padding: 40px 20px;
  }
}

.post-main {
  min-width: 0;
  max-width: 100%;
}

/* 侧边栏在移动端隐藏，桌面端固定定位 */
.post-sidebar {
  display: none;
}

@media (min-width: 1025px) {
  .post-sidebar {
    display: block;
  }
}

/* ===== 文章头部 ===== */
.post-header {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px var(--shadow-color);
  text-align: center;
  transition: transform 0.3s ease;
}

.post-header:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .post-header {
    padding: 24px;
  }
}

.post-meta-top {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  flex-wrap: wrap;
}

.post-category {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-primary);
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8125rem;
  transition: all 0.2s;
}

.post-category:hover {
  background: rgba(124, 58, 237, 0.15);
}

.post-date, .post-read-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.post-title {
  font-size: clamp(2rem, 5vw, 2.75rem);
  font-weight: 800;
  background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 20px 0;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.post-author {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--bg-tertiary);
  border-radius: 24px;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  margin-bottom: 20px;
}

.author-name i {
  color: var(--accent-primary);
}

.post-tags {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-primary);
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tag:hover {
  background: rgba(124, 58, 237, 0.15);
  transform: translateY(-1px);
}

/* ===== 文章内容 ===== */
.post-content-wrapper {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
  margin-bottom: 32px;
}

@media (max-width: 1024px) {
  .post-content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .post-toc {
    display: none;
  }
}

.post-content {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 2px 12px var(--shadow-color);
  font-size: 1.0625rem;
  line-height: 1.9;
  color: var(--text-primary);
}

.post-toc {
  position: sticky;
  top: 100px;
  height: fit-content;
}

@media (max-width: 768px) {
  .post-content {
    padding: 28px 20px;
    font-size: 1rem;
  }
}

/* 富文本内容样式 */
.rich-text-content {
  font-size: 1.0625rem;
  line-height: 1.9;
}

.rich-text-content h1,
.rich-text-content h2,
.rich-text-content h3,
.rich-text-content h4,
.rich-text-content h5,
.rich-text-content h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary);
}

.rich-text-content h1 { font-size: 2em; }
.rich-text-content h2 { font-size: 1.5em; }
.rich-text-content h3 { font-size: 1.25em; }

.rich-text-content p {
  margin-bottom: 1.2em;
}

.rich-text-content strong,
.rich-text-content b {
  font-weight: 600;
  color: var(--text-primary);
}

.rich-text-content em,
.rich-text-content i {
  font-style: italic;
}

.rich-text-content a {
  color: var(--accent-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.rich-text-content a:hover {
  border-bottom-color: var(--accent-primary);
}

.rich-text-content ul,
.rich-text-content ol {
  margin-bottom: 1.2em;
  padding-left: 2em;
}

.rich-text-content li {
  margin-bottom: 0.5em;
}

.rich-text-content blockquote {
  border-left: 4px solid var(--accent-primary);
  padding-left: 1em;
  margin: 1.5em 0;
  color: var(--text-secondary);
  font-style: italic;
  background: rgba(124, 58, 237, 0.05);
  padding: 1em 1.5em;
  border-radius: 0 8px 8px 0;
}

.rich-text-content pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1.5em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5em 0;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.9em;
  line-height: 1.5;
}

.rich-text-content code {
  background: rgba(124, 58, 237, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.9em;
}

.rich-text-content pre code {
  background: transparent;
  padding: 0;
}

.rich-text-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5em 0;
  display: block;
}

.rich-text-content hr {
  border: none;
  border-top: 2px solid var(--border-color);
  margin: 2em 0;
}

/* ===== 文章底部 ===== */
.post-footer {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px var(--shadow-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-stats {
  color: var(--text-secondary);
  font-size: 0.875rem;
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-item i {
  color: var(--accent-primary);
}

/* 点赞按钮 */
.like-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.like-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: translateY(-1px);
}

.like-btn.liked {
  background: rgba(255, 59, 48, 0.1);
  border-color: #ff3b30;
  color: #ff3b30;
}

.like-btn.liked i {
  color: #ff3b30;
}

.like-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.like-status, .like-error {
  font-size: 0.8125rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.like-status {
  color: var(--accent-primary);
}

.like-error {
  color: var(--danger-color, #ff3b30);
}

/* ===== 文章导航 ===== */
.post-navigation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 40px 0;
  padding: 0;
}

@media (max-width: 768px) {
  .post-navigation {
    grid-template-columns: 1fr;
  }
}

.nav-link {
  text-decoration: none;
  padding: 20px 24px;
  border-radius: 16px;
  background: rgba(124, 58, 237, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
  border: 1px solid transparent;
}

.nav-link:hover {
  background: rgba(124, 58, 237, 0.12);
  border-color: rgba(124, 58, 237, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.15);
}

.nav-link.prev {
  text-align: left;
}

.nav-link.next {
  text-align: right;
}

.nav-link.placeholder {
  visibility: hidden;
}

.nav-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.nav-title {
  font-size: 1.0625rem;
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* ===== 评论区 ===== */
.comments-section {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 40px;
  margin-top: 40px;
  box-shadow: 0 2px 12px var(--shadow-color);
}

@media (max-width: 768px) {
  .comments-section {
    padding: 28px 20px;
  }
}

.comments-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-color);
}

.comments-title i {
  color: var(--accent-primary);
}

.comment-form {
  background: var(--bg-tertiary);
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 40px;
  border: 1px solid var(--border-color);
}

.comment-form h3 {
  margin-bottom: 24px;
  font-size: 1.25rem;
  color: var(--text-primary);
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 14px 18px;
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

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-comments {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 1rem;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .post-header {
    padding: 24px !important;
  }
  
  .post-content {
    padding: 24px !important;
  }
  
  .comment-form {
    padding: 24px !important;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .submit-btn {
    width: 100%;
  }
  
  .comment-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .comment-avatar {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .comment-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .comment-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .post-header,
  .post-content,
  .comment-form {
    padding: 16px !important;
  }
  
  .post-meta-top {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
