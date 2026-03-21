import { ref, watch, onMounted, onUnmounted } from 'vue'

export function useAuth() {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const checkAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken) {
      token.value = storedToken
      isAuthenticated.value = true
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        } catch (e) {
          user.value = null
        }
      }
    } else {
      token.value = null
      isAuthenticated.value = false
      user.value = null
    }
  }

  const setAuth = (newToken, newUser) => {
    localStorage.setItem('token', newToken)
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    }
    token.value = newToken
    user.value = newUser
    isAuthenticated.value = true
    
    // 触发自定义事件
    window.dispatchEvent(new Event('user-logged-in'))
  }

  const clearAuth = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    token.value = null
    user.value = null
    isAuthenticated.value = false
    
    // 触发自定义事件
    window.dispatchEvent(new Event('user-logged-out'))
  }

  const handleStorageChange = (e) => {
    if (e.key === 'token' || e.type === 'storage') {
      checkAuth()
    }
  }

  onMounted(() => {
    checkAuth()
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('user-logged-in', checkAuth)
    window.addEventListener('user-logged-out', checkAuth)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
    window.removeEventListener('user-logged-in', checkAuth)
    window.removeEventListener('user-logged-out', checkAuth)
  })

  // 监听 token 变化
  watch(() => localStorage.getItem('token'), checkAuth)

  return {
    isAuthenticated,
    user,
    token,
    checkAuth,
    setAuth,
    clearAuth
  }
}
