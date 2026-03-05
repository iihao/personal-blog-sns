<template>
  <div class="comment-tree">
    <div class="comment-item" :class="{ 'is-reply': isReply }">
      <!-- 头像 -->
      <div class="comment-avatar">
        {{ comment.author_name.charAt(0).toUpperCase() }}
      </div>

      <!-- 评论内容 -->
      <div class="comment-body">
        <div class="comment-header">
          <span class="comment-author">{{ comment.author_name }}</span>
          <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
        </div>

        <div class="comment-content">
          <p>{{ comment.content }}</p>
        </div>

        <div class="comment-actions">
          <button 
            v-if="isAuthenticated && depth < MAX_DEPTH"
            @click="showReplyForm = !showReplyForm" 
            class="action-btn reply-btn"
          >
            <i class="fas fa-reply"></i> 回复
          </button>
          <button 
            v-else-if="!isAuthenticated && depth < MAX_DEPTH"
            @click="promptLogin"
            class="action-btn reply-btn"
          >
            <i class="fas fa-reply"></i> 登录后回复
          </button>
          <button 
            v-if="canDelete"
            @click="deleteComment" 
            class="action-btn delete-btn"
          >
            <i class="fas fa-trash"></i> 删除
          </button>
        </div>

        <!-- 回复表单 -->
        <transition name="slide">
          <form v-if="showReplyForm && isAuthenticated" @submit.prevent="submitReply" class="reply-form">
            <div class="form-group">
              <textarea 
                v-model="replyForm.content" 
                placeholder="写下您的回复..." 
                required
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" :disabled="submitting" class="submit-btn">
                {{ submitting ? '提交中...' : '提交回复' }}
              </button>
              <button type="button" @click="showReplyForm = false" class="cancel-btn">
                取消
              </button>
            </div>
          </form>
        </transition>

        <!-- 嵌套回复 - 限制最大深度 -->
        <div v-if="comment.replies && comment.replies.length > 0 && depth < MAX_DEPTH" class="replies">
          <CommentTree 
            v-for="reply in comment.replies" 
            :key="reply.id" 
            :comment="reply" 
            :post-id="postId"
            :is-reply="true"
            :can-delete="canDelete"
            :depth="depth + 1"
            @reply-submitted="handleReplySubmitted"
            @comment-deleted="handleCommentDeleted"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../store'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  postId: {
    type: [String, Number],
    required: true
  },
  isReply: {
    type: Boolean,
    default: false
  },
  canDelete: {
    type: Boolean,
    default: false
  },
  depth: {
    type: Number,
    default: 0
  }
})

const MAX_DEPTH = 2 // 最大嵌套层级：0=主评论，1=一级回复，2=二级回复（最深层级）

const emit = defineEmits(['reply-submitted', 'comment-deleted'])

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const showReplyForm = ref(false)
const submitting = ref(false)

const replyForm = ref({
  content: ''
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const promptLogin = () => {
  if (confirm('需要登录才能发表评论，是否前往登录页面？')) {
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
  }
}

const submitReply = async () => {
  if (!replyForm.value.content.trim()) {
    alert('请输入回复内容')
    return
  }

  try {
    submitting.value = true
    
    // 从 localStorage 获取用户信息
    const userStr = localStorage.getItem('blog_user')
    let authorName = 'Anonymous'
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        authorName = userData.name || userData.username || 'Anonymous'
      } catch (e) {
        console.error('解析用户数据失败:', e)
      }
    }
    
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        post_id: parseInt(props.postId),
        parent_id: props.comment.id,
        author_name: authorName,
        content: replyForm.value.content
      })
    })

    if (response.ok) {
      showReplyForm.value = false
      replyForm.value = { content: '' }
      emit('reply-submitted')
    } else {
      const error = await response.json()
      alert(`回复失败：${error.error}`)
    }
  } catch (error) {
    console.error('Error submitting reply:', error)
    alert('回复提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const deleteComment = async () => {
  if (!confirm('确定要删除这条评论及其所有回复吗？')) {
    return
  }

  try {
    const response = await fetch(`/api/comments/${props.comment.id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      emit('comment-deleted', props.comment.id)
    } else {
      const error = await response.json()
      alert(`删除失败：${error.error}`)
    }
  } catch (error) {
    console.error('Error deleting comment:', error)
    alert('删除失败，请稍后重试')
  }
}

const handleReplySubmitted = () => {
  emit('reply-submitted')
}

const handleCommentDeleted = (commentId) => {
  emit('comment-deleted', commentId)
}
</script>

<style scoped>
.comment-tree {
  margin: 0;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 16px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  border: 1px solid var(--border-color);
}

.comment-item.is-reply {
  background: var(--bg-primary);
  padding: 16px;
  margin-left: 24px;
  border-left: 2px solid var(--accent-primary);
}

/* 二级回复样式 */
.replies .comment-item.is-reply {
  margin-left: 24px;
  border-left-width: 2px;
  border-left-color: var(--accent-secondary);
}

.comment-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.comment-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.comment-author {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.comment-date {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.comment-content {
  margin-bottom: 12px;
}

.comment-content p {
  color: var(--text-secondary, #3c3c43);
  line-height: 1.6;
  margin: 0;
  word-wrap: break-word;
}

.comment-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--bg-tertiary, #f3f4f6);
  color: var(--text-primary, #111827);
}

.reply-btn:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.delete-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* 回复表单 */
.reply-form {
  margin-top: 16px;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  animation: slide-down 0.3s ease-out;
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-group {
  margin-bottom: 12px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--input-border);
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: var(--input-bg);
  color: var(--text-primary);
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
}

.form-textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.submit-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  padding: 10px 24px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

/* 嵌套回复 */
.replies {
  margin-top: 16px;
  padding-left: 16px;
  border-left: 2px solid var(--border-color, #e5e7eb);
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 响应式 */
@media (max-width: 640px) {
  .comment-item {
    flex-direction: column;
  }

  .comment-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .comment-item.is-reply {
    margin-left: 12px;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
