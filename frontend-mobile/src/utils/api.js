import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const postApi = {
  // 获取文章列表
  getPosts(params) {
    return api.get('/posts', { params })
  },
  
  // 获取单篇文章
  getPost(id) {
    return api.get(`/posts/${id}`)
  },
  
  // 获取项目列表
  getProjects() {
    return api.get('/projects')
  }
}

export default api
