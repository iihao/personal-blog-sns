/**
 * API 请求工具函数
 * 统一处理 token 失效和自动退出
 */

// 强制退出登录并跳转
export function forceLogout(reason = '登录已过期') {
  console.log('[API] 强制退出登录:', reason)
  localStorage.removeItem('blog_user')
  localStorage.removeItem('blog_token')
  localStorage.removeItem('blog_token_expiry')
  
  // 显示提示并跳转到登录页
  alert(reason + '，请重新登录')
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
  }
}

/**
 * 通用的 API 请求函数
 * @param {string} url - 请求 URL
 * @param {object} options - fetch 选项
 * @returns {Promise} fetch Promise
 */
export async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('blog_token')
  
  // 默认配置
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }
  
  // 如果有 token，添加到请求头
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  
  try {
    const response = await fetch(url, config)
    
    // 处理 401 未授权（token 失效）
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[API] Token 失效:', errorData)
      forceLogout(errorData.error || '登录已过期')
      throw new Error('Token 失效')
    }
    
    // 处理 403 禁止访问
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[API] 权限不足:', errorData)
      forceLogout('权限不足，请重新登录')
      throw new Error('权限不足')
    }
    
    return response
  } catch (error) {
    // 网络错误或其他错误
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error('[API] 网络错误')
      // 不强制退出，可能是网络问题
    }
    throw error
  }
}

/**
 * 带 JSON 解析的 API 请求
 * @param {string} url - 请求 URL
 * @param {object} options - fetch 选项
 * @returns {Promise<any>} 响应数据
 */
export async function apiFetch(url, options = {}) {
  const response = await apiRequest(url, options)
  return response.json()
}
