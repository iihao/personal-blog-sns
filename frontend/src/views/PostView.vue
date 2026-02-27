<template>
  <div class="post-view">
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
          
          <div class="post-content">
            <MarkdownPreview :content="post.content" />
          </div>
          
          <!-- Post Footer -->
          <div class="post-footer">
            <div class="post-stats">
              <span class="stat-item" v-if="viewCount">
                <i class="fas fa-eye"></i> {{ viewCount }} 次阅读
              </span>
            </div>
          </div>

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
              <form @submit.prevent="submitComment">
                <div class="form-group">
                  <input 
                    v-model="commentForm.name" 
                    type="text" 
                    placeholder="您的昵称 *" 
                    required
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <input 
                    v-model="commentForm.email" 
                    type="email" 
                    placeholder="您的邮箱 (可选)"
                    class="form-input"
                  />
                </div>
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
import { useRoute } from 'vue-router'
import ThemeToggle from '../components/ThemeToggle.vue'
import MarkdownPreview from '../components/MarkdownPreview.vue'
import TableOfContents from '../components/TableOfContents.vue'
import CommentTree from '../components/CommentTree.vue'
import { useMarkdown } from '../composables/useMarkdown'

const route = useRoute()
const post = ref(null)
const prevPost = ref(null)
const nextPost = ref(null)
const comments = ref([])
const loading = ref(true)
const error = ref(null)
const submitting = ref(false)
const viewCount = ref(0)

const { calculateReadTime } = useMarkdown()

const commentForm = ref({
  name: '',
  email: '',
  content: ''
})

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
    
    await fetchAllPosts()
    await fetchComments()
    
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
    // 获取所有评论（包括待审核），后端会过滤显示
    // 使用 approved=all 让后端返回所有顶级评论
    const response = await fetch(`/api/comments?post_id=${route.params.id}&approved=all`)
    const data = await response.json()
    // 过滤：显示已审核评论 + 顶级评论（pending 也显示，适合个人博客）
    comments.value = (data.comments || []).filter(c => 
      c.status === 'approved' || c.parent_id === null
    )
  } catch (err) {
    console.error('Error fetching comments:', err)
  }
}

const submitComment = async () => {
  if (!commentForm.value.name || !commentForm.value.content) {
    alert('请填写昵称和评论内容')
    return
  }

  try {
    submitting.value = true
    
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_id: parseInt(route.params.id),
        author_name: commentForm.value.name,
        author_email: commentForm.value.email || '',
        content: commentForm.value.content
      })
    })

    if (response.ok) {
      alert('评论提交成功！等待审核后显示。')
      commentForm.value = { name: '', email: '', content: '' }
      await fetchComments()
    } else {
      const error = await response.json()
      alert(`评论失败：${error.error}`)
    }
  } catch (err) {
    console.error('Error submitting comment:', err)
    alert('评论提交失败，请稍后重试')
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
    fetchPost()
  }
})
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
  grid-template-columns: 1fr 320px;
  gap: 48px;
  align-items: start;
}

@media (max-width: 968px) {
  .post-layout {
    grid-template-columns: 1fr;
    padding: 40px 20px;
    gap: 32px;
  }
}

.post-main {
  min-width: 0;
}

.post-sidebar {
  position: sticky;
  top: 100px;
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
.post-content {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 48px;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px var(--shadow-color);
  font-size: 1.0625rem;
  line-height: 1.9;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .post-content {
    padding: 28px 20px;
    font-size: 1rem;
  }
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
</style>
