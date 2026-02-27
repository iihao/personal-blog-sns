import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// API 基础 URL
const API_BASE = '/api'

// 通用 API 请求处理
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`)
    }
    
    return data
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

// 博客配置 Store
export const useBlogStore = defineStore('blog', () => {
  const config = ref({
    blog_title: 'My Blog',
    blog_description: 'A personal blog'
  })
  const loading = ref(false)
  const error = ref(null)

  async function fetchConfig() {
    loading.value = true
    error.value = null
    try {
      const data = await apiRequest('/config/public')
      config.value = data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return { config, loading, error, fetchConfig }
})

// 文章 Store
export const usePostStore = defineStore('posts', () => {
  const posts = ref([])
  const currentPost = ref(null)
  const categories = ref([])
  const tags = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const publishedPosts = computed(() => 
    posts.value.filter(post => post.published || post.status === 'published')
  )

  // 获取分类列表
  async function fetchCategories() {
    try {
      const data = await apiRequest('/posts/categories')
      categories.value = data.categories || []
      return data.categories
    } catch (err) {
      console.error('Error fetching categories:', err)
      return []
    }
  }

  // 获取标签列表
  async function fetchTags() {
    try {
      const data = await apiRequest('/posts/tags')
      tags.value = data.tags || []
      return data.tags
    } catch (err) {
      console.error('Error fetching tags:', err)
      return []
    }
  }

  async function fetchPosts(page = 1, limit = 20, search = '', status = 'published', category = '') {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ page, limit, search, status })
      if (category) {
        params.append('category', category)
      }
      const data = await apiRequest(`/posts?${params}`)
      posts.value = data.posts || []
      pagination.value = data.pagination || { page, limit, total: 0, pages: 0 }
    } catch (err) {
      error.value = err.message
      posts.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchPost(id) {
    loading.value = true
    error.value = null
    try {
      const data = await apiRequest(`/posts/${id}`)
      currentPost.value = data.post
      return data.post
    } catch (err) {
      error.value = err.message
      currentPost.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPost(postData) {
    return await apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  }

  async function updatePost(id, postData) {
    return await apiRequest(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    })
  }

  async function deletePost(id) {
    return await apiRequest(`/posts/${id}`, {
      method: 'DELETE'
    })
  }

  async function batchDeletePosts(ids) {
    return await apiRequest('/posts/batch', {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    })
  }

  function clearCurrentPost() {
    currentPost.value = null
  }

  return {
    posts,
    currentPost,
    categories,
    tags,
    loading,
    error,
    pagination,
    publishedPosts,
    fetchPosts,
    fetchPost,
    fetchCategories,
    fetchTags,
    createPost,
    updatePost,
    deletePost,
    batchDeletePosts,
    clearCurrentPost
  }
})

// 评论 Store
export const useCommentStore = defineStore('comments', () => {
  const comments = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchComments(postId, approved = true) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ 
        post_id: postId, 
        approved: approved.toString() 
      })
      const data = await apiRequest(`/comments?${params}`)
      comments.value = data.comments || []
    } catch (err) {
      error.value = err.message
      comments.value = []
    } finally {
      loading.value = false
    }
  }

  async function submitComment(postId, commentData) {
    return await apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify({
        post_id: postId,
        ...commentData
      })
    })
  }

  async function approveComment(id) {
    return await apiRequest(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ approved: true })
    })
  }

  async function deleteComment(id) {
    return await apiRequest(`/comments/${id}`, {
      method: 'DELETE'
    })
  }

  function clearComments() {
    comments.value = []
  }

  return {
    comments,
    loading,
    error,
    fetchComments,
    submitComment,
    approveComment,
    deleteComment,
    clearComments
  }
})

// 媒体 Store
export const useMediaStore = defineStore('media', () => {
  const media = ref([])
  const loading = ref(false)
  const error = ref(null)
  const uploading = ref(false)
  const uploadProgress = ref(0)

  async function fetchMedia() {
    loading.value = true
    error.value = null
    try {
      const data = await apiRequest('/media')
      media.value = data.files || []
    } catch (err) {
      error.value = err.message
      media.value = []
    } finally {
      loading.value = false
    }
  }

  async function uploadMedia(file, onProgress) {
    uploading.value = true
    uploadProgress.value = 0
    error.value = null

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE}/media/upload`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      await fetchMedia()
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      uploading.value = false
      uploadProgress.value = 0
    }
  }

  async function deleteMedia(id) {
    return await apiRequest(`/media/${id}`, {
      method: 'DELETE'
    })
  }

  return {
    media,
    loading,
    error,
    uploading,
    uploadProgress,
    fetchMedia,
    uploadMedia,
    deleteMedia
  }
})

// 认证 Store
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('blog_token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('blog_token', newToken)
    } else {
      localStorage.removeItem('blog_token')
    }
  }

  async function login(username, password) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }
      
      setToken(data.token)
      user.value = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return null
    
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      if (!response.ok) {
        setToken(null)
        return null
      }
      
      const data = await response.json()
      user.value = data.user
      return data.user
    } catch (err) {
      setToken(null)
      return null
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setToken(null)
      user.value = null
    }
  }

  async function checkAuth() {
    if (!token.value) return false
    
    try {
      const userData = await fetchUser()
      return !!userData
    } catch (err) {
      setToken(null)
      return false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    fetchUser,
    checkAuth,
    setToken
  }
})
