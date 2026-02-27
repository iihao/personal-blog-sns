import { defineStore } from 'pinia'

export const useBlogStore = defineStore('blog', {
  state: () => ({
    posts: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchPosts() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('/api/posts')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        this.posts = data.posts || []
      } catch (error) {
        console.error('Failed to fetch posts:', error)
        this.error = error.message
        // 添加一些示例数据以防API不可用
        this.posts = [
          {
            id: 1,
            title: '欢迎使用现代化博客',
            content: '这是一个基于Vue3和Tailwind CSS构建的现代化博客系统。界面简洁优雅，响应式设计，支持暗色主题。',
            created_at: new Date().toISOString(),
            author: 'Admin'
          },
          {
            id: 2,
            title: '技术栈介绍',
            content: '本博客使用Vue3 + Pinia + Vue Router + Tailwind CSS构建，后端使用Express.js提供API服务。',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            author: 'Admin'
          }
        ]
      } finally {
        this.loading = false
      }
    },
    
    async fetchPostById(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`/api/posts/${id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const post = await response.json()
        return post
      } catch (error) {
        console.error('Failed to fetch post:', error)
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    }
  }
})