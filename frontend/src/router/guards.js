import { useAuthStore } from '../store'

// 路由守卫：需要认证
export const requireAuth = async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查是否已登录
  if (!authStore.isAuthenticated) {
    // 尝试从 localStorage 恢复 token
    const token = localStorage.getItem('blog_token')
    if (token) {
      authStore.setToken(token)
      try {
        await authStore.fetchUser()
        if (authStore.isAuthenticated) {
          next()
          return
        }
      } catch (error) {
        console.error('Token validation failed:', error)
      }
    }
    
    // 重定向到登录页
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  
  // 已登录，继续
  next()
}

// 路由守卫：管理员权限
export const requireAdmin = async (to, from, next) => {
  const authStore = useAuthStore()
  
  console.log('[Admin Guard] 开始检查权限')
  console.log('[Admin Guard] 初始状态:', {
    isAuthenticated: authStore.isAuthenticated,
    hasToken: !!authStore.token,
    hasUser: !!authStore.user,
    userRole: authStore.user?.role
  })
  
  // 优先从 localStorage 恢复
  const token = localStorage.getItem('blog_token')
  const userStr = localStorage.getItem('blog_user')
  
  if (token && !authStore.token) {
    console.log('[Admin Guard] 从 localStorage 恢复 token')
    authStore.setToken(token)
  }
  
  if (userStr && !authStore.user) {
    try {
      const userData = JSON.parse(userStr)
      console.log('[Admin Guard] 从 localStorage 恢复用户:', userData)
      authStore.user = userData
    } catch (e) {
      console.error('[Admin Guard] 解析用户数据失败:', e)
    }
  }
  
  // 如果 store 有用户信息，直接检查角色
  if (authStore.user) {
    const userRole = authStore.user.role
    console.log('[Admin Guard] Store 中有用户信息，角色:', userRole)
    
    if (userRole === 'admin' || userRole === 'super_admin') {
      console.log('[Admin Guard] ✅ 权限验证通过')
      return next()
    } else {
      console.log('[Admin Guard] ❌ 权限不足，角色:', userRole)
      return next({ path: '/forbidden' })
    }
  }
  
  // 如果 store 没有用户信息但有 token，尝试从 API 获取
  if (authStore.token && !authStore.user) {
    console.log('[Admin Guard] 尝试从 API 获取用户信息')
    try {
      await authStore.fetchUser()
      if (authStore.user) {
        const userRole = authStore.user.role
        console.log('[Admin Guard] API 获取成功，角色:', userRole)
        
        if (userRole === 'admin' || userRole === 'super_admin') {
          console.log('[Admin Guard] ✅ 权限验证通过')
          return next()
        }
      }
    } catch (error) {
      console.error('[Admin Guard] API 获取用户失败:', error)
    }
  }
  
  // 最后检查：如果还是没有用户信息，但从 localStorage 恢复了 token
  // 并且 localStorage 中的用户角色是管理员，也允许通过
  if (userStr) {
    try {
      const userData = JSON.parse(userStr)
      const userRole = userData.role
      console.log('[Admin Guard] 最终检查 localStorage 角色:', userRole)
      
      if (userRole === 'admin' || userRole === 'super_admin') {
        console.log('[Admin Guard] ✅ 最终检查通过')
        authStore.user = userData
        return next()
      }
    } catch (e) {
      console.error('[Admin Guard] 最终检查失败:', e)
    }
  }
  
  // 所有检查都失败，重定向到登录
  console.log('[Admin Guard] ❌ 所有检查失败，重定向到登录')
  return next({ path: '/login', query: { redirect: to.fullPath } })
}