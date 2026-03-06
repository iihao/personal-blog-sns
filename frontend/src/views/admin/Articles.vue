<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-newspaper"></i> 文章管理</h1>
    </div>
    <!-- 搜索和筛选 -->
    <div class="filter-bar">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input v-model="searchQuery" type="text" placeholder="搜索文章标题..." @keyup.enter="loadPosts" />
      </div>
      <div class="filter-group">
        <select v-model="filterCategory" @change="loadPosts">
          <option value="">所有分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="filterStatus" @change="loadPosts">
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
          <option value="all">全部</option>
        </select>
        <button class="btn-primary" @click="navigateTo('/admin/editor')">
          <i class="fas fa-plus"></i> 新建文章
        </button>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>加载中...</p>
        </div>
        <div v-else-if="posts.length === 0" class="empty-state">
          <i class="fas fa-newspaper"></i>
          <p>暂无文章</p>
          <router-link to="/admin/editor" class="btn-primary">
            <i class="fas fa-plus"></i> 创建第一篇文章
          </router-link>
        </div>
        <div v-else>
          <!-- 桌面端表格 -->
          <div class="table-responsive hide-mobile">
            <table class="data-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>作者</th>
                  <th>分类</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="post in posts" :key="post.id">
                  <td>
                    <div class="post-title">{{ post.title }}</div>
                  </td>
                  <td>{{ post.author || 'Admin' }}</td>
                  <td>
                    <span v-if="post.category" class="category-tag">{{ post.category }}</span>
                    <span v-else class="text-gray">-</span>
                  </td>
                  <td>
                    <span :class="['status-badge', post.published ? 'published' : 'draft']">
                      {{ post.published ? '已发布' : '草稿' }}
                    </span>
                  </td>
                  <td>{{ formatDate(post.created_at) }}</td>
                  <td>
                    <div class="action-buttons">
                      <router-link :to="`/admin/articles/${post.id}/logs`" class="btn-icon" title="查看日志">
                        <i class="fas fa-history"></i>
                      </router-link>
                      <button class="btn-icon" @click="editPost(post.id)" title="编辑">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-icon btn-danger" @click="deletePost(post.id)" title="删除">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 移动端卡片布局 -->
          <div class="data-table-mobile show-mobile-only">
            <div v-for="post in posts" :key="post.id" class="article-card">
              <div class="article-card-header">
                <div class="article-card-title">{{ post.title }}</div>
                <span :class="['status-badge', 'article-card-status', post.published ? 'published' : 'draft']">
                  {{ post.published ? '已发布' : '草稿' }}
                </span>
              </div>
              <div v-if="post.category" class="article-card-category">
                <i class="fas fa-folder"></i> {{ post.category }}
              </div>
              <div class="article-card-meta">
                <div class="article-card-meta-item">
                  <i class="fas fa-user"></i>
                  <span>{{ post.author || 'Admin' }}</span>
                </div>
                <div class="article-card-meta-item">
                  <i class="fas fa-calendar"></i>
                  <span>{{ formatDate(post.created_at) }}</span>
                </div>
              </div>
              <div class="article-card-actions">
                <router-link :to="`/admin/articles/${post.id}/logs`" class="btn-icon" title="查看日志">
                  <i class="fas fa-history"></i>
                  <span>日志</span>
                </router-link>
                <button class="btn-icon" @click="editPost(post.id)">
                  <i class="fas fa-edit"></i>
                  <span>编辑</span>
                </button>
                <button class="btn-icon btn-danger" @click="deletePost(post.id)">
                  <i class="fas fa-trash"></i>
                  <span>删除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const posts = ref([])
const categories = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('published')
const currentPage = ref(1)
const totalPages = ref(1)

// 加载文章
const loadPosts = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: currentPage.value,
      limit: 20,
      search: searchQuery.value,
      status: filterStatus.value,
      category: filterCategory.value
    })
    
    const res = await fetch(`/api/posts?${params}`)
    const data = await res.json()
    posts.value = data.posts || []
    totalPages.value = data.pagination?.pages || 1
  } catch (error) {
    console.error('加载文章失败:', error)
    if (adminLayout.value) {
    }
  } finally {
    loading.value = false
  }
}

// 加载分类
const loadCategories = async () => {
  try {
    const res = await fetch('/api/posts/categories')
    const data = await res.json()
    categories.value = data.categories?.map(c => c.category) || []
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
}

// 导航
const navigateTo = (path) => {
  router.push(path)
}

// 编辑文章
const editPost = (id) => {
  router.push(`/admin/editor?id=${id}`)
}

// 删除文章
const deletePost = async (id) => {
  if (!confirm('确定要删除这篇文章吗？')) return
  
  try {
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      }
    })
    
    if (res.ok) {
      if (adminLayout.value) {
      }
      loadPosts()
    } else {
      throw new Error('删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    if (adminLayout.value) {
    }
  }
}

// 切换页码
const changePage = (page) => {
  currentPage.value = page
  loadPosts()
}

// 生命周期
onMounted(() => {
  Promise.all([loadPosts(), loadCategories()])
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  max-width: 400px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
}

.search-box input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #667eea;
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
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

.filter-group select:focus {
  border-color: #667eea;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
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

.empty-state .btn-primary {
  margin-top: 16px;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 16px;
  font-size: 13px;
  font-weight: 600;
  color: #86868b;
  border-bottom: 1px solid #e0e0e0;
}

.data-table td {
  padding: 16px;
  font-size: 14px;
  border-bottom: 1px solid #f5f5f7;
}

.post-title {
  font-weight: 600;
  color: #1d1d1f;
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-tag {
  padding: 4px 12px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.text-gray {
  color: #86868b;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.status-badge.published {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.status-badge.draft {
  background: rgba(255, 149, 0, 0.15);
  color: #ff9500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  transition: all 0.2s;
}

.btn-icon:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.btn-icon.btn-danger:hover {
  border-color: #ff3b30;
  color: #ff3b30;
  background: rgba(255, 59, 48, 0.05);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #86868b;
}

/* 移动端显示控制工具类 */
.hide-mobile {
  display: block;
}

.show-mobile-only {
  display: none;
}

/* 响应式 - 移动端优化 */
@media (max-width: 768px) {
  /* 移动端显示控制 */
  .hide-mobile {
    display: none !important;
  }
  
  .show-mobile-only {
    display: block !important;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .search-box {
    max-width: none;
    width: 100%;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .filter-group {
    flex-wrap: wrap;
    gap: 8px;
    display: flex;
  }
  
  .filter-group select {
    flex: 1;
    min-width: calc(50% - 4px);
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .filter-group .btn-primary {
    width: 100%;
    justify-content: center;
    margin-top: 4px;
  }
  
  /* 表格转卡片布局 */
  .table-responsive {
    overflow-x: visible;
  }
  
  .data-table {
    display: none; /* 隐藏表格 */
  }
  
  .data-table-mobile {
    display: block;
  }
  
  .article-card {
    background: #f5f5f7;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    transition: all 0.2s;
  }
  
  .article-card:hover {
    background: rgba(102, 126, 234, 0.05);
    transform: translateX(4px);
  }
  
  .article-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  .article-card-title {
    font-weight: 600;
    font-size: 15px;
    color: #1d1d1f;
    flex: 1;
    margin-right: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .article-card-status {
    flex-shrink: 0;
  }
  
  .article-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;
    font-size: 12px;
    color: #86868b;
  }
  
  .article-card-meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .article-card-meta-item i {
    font-size: 11px;
  }
  
  .article-card-category {
    display: inline-block;
    padding: 4px 12px;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 12px;
  }
  
  .article-card-actions {
    display: flex;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid #e0e0e0;
  }
  
  .article-card-actions .btn-icon {
    flex: 1;
    justify-content: center;
    padding: 10px;
    height: 40px;
  }
  
  .article-card-actions .btn-icon i {
    margin-right: 4px;
  }
}

/* 小屏幕手机优化 */
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
  
  .article-card {
    padding: 14px;
  }
  
  .article-card-title {
    font-size: 14px;
  }
  
  .article-card-meta {
    font-size: 11px;
    gap: 8px;
  }
  
  .article-card-actions {
    gap: 6px;
  }
  
  .article-card-actions .btn-icon {
    padding: 8px;
    height: 36px;
    font-size: 13px;
  }
  
  .pagination {
    gap: 12px;
    padding: 12px;
  }
  
  .pagination button {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .page-info {
    font-size: 12px;
  }
}

/* 横屏模式优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .filter-bar {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .search-box {
    flex: 1;
    min-width: 200px;
  }
  
  .filter-group {
    flex-wrap: nowrap;
  }
  
  .filter-group select {
    min-width: 120px;
  }
}
</style>
