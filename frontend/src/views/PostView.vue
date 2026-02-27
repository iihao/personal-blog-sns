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
      
      <article class="post-content">
        <MarkdownPreview :content="post.content" />
      </article>
      
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
          <i class="fas fa-comments"></i> 评论 ({{ comments.length }})
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
          <div v-if="comments.length === 0" class="no-comments">
            <p>暂无评论，快来抢沙发吧！</p>
          </div>
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">
              {{ comment.author_name.charAt(0).toUpperCase() }}
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.author_name }}</span>
                <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from '../components/ThemeToggle.vue'
import MarkdownPreview from '../components/MarkdownPreview.vue'
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
const headings = ref([])

const { parseMarkdown, calculateReadTime, extractHeadings } = useMarkdown()

const commentForm = ref({
  name: '',
  email: '',
  content: ''
})

// 计算阅读时间 (使用 Markdown 解析)
const readTime = computed(() => {
  if (!post.value?.content) return 0
  return calculateReadTime(post.value.content)
})

// 文章目录
const tableOfContents = computed(() => {
  if (!post.value?.content) return []
  return extractHeadings(post.value.content)
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
    
    const response = await fetch(`/api/posts/${route.params.id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    post.value = data.post
    
    // 获取所有文章用于导航
    await fetchAllPosts()
    
    // 获取评论
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
    const response = await fetch(`/api/comments?post_id=${route.params.id}&approved=true`)
    const data = await response.json()
    comments.value = data.comments || []
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

onMounted(() => {
  fetchPost()
})
</script>

<style scoped>
.post-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 主题切换按钮固定位置 */
.theme-toggle-fixed {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

/* Loading & Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 20px;
  padding: 10px 24px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.retry-btn:hover {
  background: #0056cc;
}

/* Post Header */
.post-header {
  margin-bottom: 40px;
  text-align: center;
}

.post-meta-top {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
  color: #86868b;
  font-size: 0.875rem;
  flex-wrap: wrap;
}

.post-category {
  color: #007aff;
  font-weight: 500;
}

.post-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 16px 0;
  line-height: 1.3;
}

.post-author {
  color: #86868b;
  font-size: 0.95rem;
  margin-bottom: 16px;
}

.post-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.tag {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

.tag:hover {
  background: rgba(0, 122, 255, 0.2);
}

/* Post Content */
.post-content {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #3c3c43;
  margin-bottom: 40px;
}

.post-content :deep(h1) {
  font-size: 2rem;
  margin: 2.5em 0 1em;
}

.post-content :deep(h2) {
  font-size: 1.75rem;
  margin: 2em 0 0.8em;
}

.post-content :deep(h3) {
  font-size: 1.5rem;
  margin: 1.5em 0 0.6em;
}

.post-content :deep(p) {
  margin-bottom: 1.5em;
}

.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5em 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.post-content :deep(code) {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}

.post-content :deep(pre) {
  background: #1d1d1f;
  color: #f8f8f2;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5em 0;
}

.post-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}

.post-content :deep(blockquote) {
  border-left: 4px solid #007aff;
  margin: 1.5em 0;
  padding: 10px 20px;
  background: rgba(0, 122, 255, 0.05);
  color: #666;
}

.post-content :deep(ul), .post-content :deep(ol) {
  margin-bottom: 1.5em;
  padding-left: 2em;
}

.post-content :deep(li) {
  margin-bottom: 0.5em;
}

.post-content :deep(a) {
  color: #007aff;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.post-content :deep(a:hover) {
  border-bottom-color: #007aff;
}

/* Post Footer */
.post-footer {
  padding: 20px 0;
  border-top: 1px solid #e0e0e0;
  margin-bottom: 30px;
}

.post-stats {
  color: #86868b;
  font-size: 0.9rem;
}

/* Navigation */
.post-navigation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 40px 0;
  padding-top: 30px;
  border-top: 1px solid #e0e0e0;
}

.nav-link {
  text-decoration: none;
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(0, 122, 255, 0.05);
  transition: all 0.3s ease;
  display: block;
}

.nav-link:hover {
  background: rgba(0, 122, 255, 0.15);
  transform: translateY(-2px);
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
  font-size: 0.875rem;
  color: #86868b;
  margin-bottom: 4px;
}

.nav-title {
  font-size: 1rem;
  color: #007aff;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Comments Section */
.comments-section {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 2px solid #e0e0e0;
}

.comments-title {
  font-size: 1.5rem;
  color: #1d1d1f;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Comment Form */
.comment-form {
  background: #f9f9f9;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.comment-form h3 {
  margin-bottom: 20px;
  font-size: 1.25rem;
  color: #1d1d1f;
}

.form-group {
  margin-bottom: 16px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #007aff;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  text-align: right;
}

.submit-btn {
  padding: 12px 32px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #0056cc;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.no-comments {
  text-align: center;
  color: #86868b;
  padding: 40px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  transition: transform 0.2s;
}

.comment-item:hover {
  transform: translateX(4px);
}

.comment-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007aff, #5ac8fa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: #1d1d1f;
}

.comment-date {
  font-size: 0.875rem;
  color: #86868b;
}

.comment-text {
  color: #3c3c43;
  line-height: 1.6;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .post-view {
    padding: 20px 16px;
  }

  .post-title {
    font-size: 1.75rem;
  }

  .post-meta-top {
    flex-direction: column;
    gap: 8px;
  }

  .post-navigation {
    grid-template-columns: 1fr;
  }

  .nav-link.prev,
  .nav-link.next {
    text-align: center;
  }

  .comment-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .comment-header {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
