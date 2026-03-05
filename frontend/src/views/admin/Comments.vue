<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-comments"></i> 评论管理</h1>
    </div>
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <select v-model="filterStatus" @change="loadComments">
          <option value="all">全部</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
        </select>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>加载中...</p>
        </div>
        <div v-else-if="comments.length === 0" class="empty-state">
          <i class="fas fa-comments"></i>
          <p>暂无评论</p>
        </div>
        <div v-else class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">
              {{ (comment.author_name || '匿名').charAt(0).toUpperCase() }}
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <div class="comment-author">{{ comment.author_name || '匿名用户' }}</div>
                <div class="comment-meta">
                  <span :class="['status-badge', comment.status || 'pending']">
                    {{ comment.status === 'approved' ? '已通过' : '待审核' }}
                  </span>
                  <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                </div>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
              <div class="comment-post">
                <i class="fas fa-newspaper"></i> 评论于：{{ comment.post_title || '文章' }}
              </div>
              <div class="comment-actions">
                <button v-if="comment.status !== 'approved'" class="btn-success btn-sm" @click="approveComment(comment.id)">
                  <i class="fas fa-check"></i> 通过
                </button>
                <button class="btn-danger btn-sm" @click="deleteComment(comment.id)">
                  <i class="fas fa-trash"></i> 删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const comments = ref([])
const loading = ref(true)
const filterStatus = ref('all')

// 加载评论
const loadComments = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      limit: 50,
      approved: filterStatus.value === 'all' ? 'all' : filterStatus.value
    })
    
    const res = await fetch(`/api/comments?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      }
    })
    const data = await res.json()
    console.log('评论数据:', data)
    comments.value = data.comments || []
  } catch (error) {
    console.error('加载评论失败:', error)
    // 使用全局 Toast 组件
    if (typeof showToast !== 'undefined') {
      showToast('加载评论失败，请稍后重试', 'error')
    } else {
      alert('加载评论失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 通过评论
const approveComment = async (id) => {
  try {
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      },
      body: JSON.stringify({ approved: true })
    })
    
    if (res.ok) {
      showToast('评论已通过', 'success')
      loadComments()
    } else {
      const errorData = await res.json()
      showToast(`操作失败：${errorData.error}`, 'error')
    }
  } catch (error) {
    console.error('通过失败:', error)
    showToast('操作失败，请稍后重试', 'error')
  }
}

// 删除评论
const deleteComment = async (id) => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    const res = await fetch(`/api/comments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      }
    })
    
    if (res.ok) {
      showToast('评论已删除', 'success')
      loadComments()
    } else {
      const errorData = await res.json()
      showToast(`删除失败：${errorData.error}`, 'error')
    }
  } catch (error) {
    console.error('删除失败:', error)
    showToast('删除失败，请稍后重试', 'error')
  }
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.filter-bar {
  margin-bottom: 24px;
}

.filter-group select {
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  outline: none;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-body {
  padding: 24px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
}

.loading-state i, .empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f5f5f7;
  border-radius: 12px;
  transition: all 0.2s;
}

.comment-item:hover {
  background: rgba(102, 126, 234, 0.05);
}

.comment-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.comment-author {
  font-weight: 600;
  font-size: 15px;
  color: #1d1d1f;
}

.comment-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 13px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.approved {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.status-badge.pending {
  background: rgba(255, 149, 0, 0.15);
  color: #ff9500;
}

.comment-date {
  color: #86868b;
}

.comment-text {
  font-size: 14px;
  color: #1d1d1f;
  line-height: 1.6;
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.comment-post {
  font-size: 13px;
  color: #86868b;
  margin-bottom: 12px;
}

.comment-post i {
  margin-right: 4px;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-success {
  background: #34c759;
  color: white;
}

.btn-success:hover {
  background: #2db350;
  transform: translateY(-1px);
}

.btn-danger {
  background: #ff3b30;
  color: white;
}

.btn-danger:hover {
  background: #e6352b;
  transform: translateY(-1px);
}

/* 响应式 - 移动端优化 */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .filter-group {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .filter-group select {
    flex: 1;
    min-width: calc(50% - 4px);
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .comment-list {
    display: block;
  }
  
  .comment-item {
    flex-direction: column;
    padding: 16px;
    gap: 12px;
  }
  
  .comment-avatar {
    width: 44px;
    height: 44px;
    font-size: 16px;
  }
  
  .comment-content {
    width: 100%;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .comment-author {
    font-size: 14px;
  }
  
  .comment-meta {
    width: 100%;
    justify-content: space-between;
    font-size: 11px;
  }
  
  .status-badge {
    font-size: 10px;
    padding: 2px 8px;
  }
  
  .comment-date {
    font-size: 11px;
  }
  
  .comment-text {
    font-size: 13px;
    line-height: 1.5;
  }
  
  .comment-post {
    font-size: 12px;
  }
  
  .comment-actions {
    width: 100%;
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid #e0e0e0;
  }
  
  .btn-sm {
    flex: 1;
    justify-content: center;
    padding: 10px 16px;
    font-size: 13px;
    min-height: 40px;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .filter-group select {
    min-width: 100%;
    font-size: 13px;
  }
  
  .comment-item {
    padding: 14px;
  }
  
  .comment-avatar {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
  
  .comment-author {
    font-size: 13px;
  }
  
  .comment-text {
    font-size: 12px;
  }
  
  .comment-meta {
    font-size: 10px;
  }
  
  .btn-sm {
    padding: 8px 12px;
    font-size: 12px;
    min-height: 36px;
  }
}
</style>
