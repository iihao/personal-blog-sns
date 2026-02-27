import { ref, watch, onMounted } from 'vue'

export function useTheme() {
  const isDark = ref(false)
  const isInitialized = ref(false)

  // 从 localStorage 获取主题偏好
  const getPreferredTheme = () => {
    const saved = localStorage.getItem('blog-theme')
    if (saved) {
      return saved === 'dark'
    }
    // 如果没有保存，使用系统偏好
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // 应用主题到 document
  const applyTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('blog-theme', isDark.value ? 'dark' : 'light')
    applyTheme(isDark.value)
  }

  // 设置为深色
  const setDark = () => {
    isDark.value = true
    localStorage.setItem('blog-theme', 'dark')
    applyTheme(true)
  }

  // 设置为浅色
  const setLight = () => {
    isDark.value = false
    localStorage.setItem('blog-theme', 'light')
    applyTheme(false)
  }

  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // 只有当用户没有手动设置过主题时才响应系统变化
      if (!localStorage.getItem('blog-theme')) {
        isDark.value = e.matches
        applyTheme(isDark.value)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }

  // 初始化
  onMounted(() => {
    isDark.value = getPreferredTheme()
    applyTheme(isDark.value)
    isInitialized.value = true
    setupSystemThemeListener()
  })

  return {
    isDark,
    isInitialized,
    toggleTheme,
    setDark,
    setLight
  }
}
