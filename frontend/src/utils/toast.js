// 全局 Toast 工具函数
let toastContainer = null

// 创建 Toast 容器
const createContainer = () => {
  if (toastContainer) return toastContainer
  
  toastContainer = document.createElement('div')
  toastContainer.id = 'toast-container'
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  `
  document.body.appendChild(toastContainer)
  return toastContainer
}

// 显示 Toast
export const showToast = (message, type = 'info', duration = 3000) => {
  const container = createContainer()
  
  // 创建 Toast 元素
  const toast = document.createElement('div')
  
  // 根据类型设置颜色
  const colors = {
    success: { bg: '#10b981', icon: '✓' },
    error: { bg: '#ef4444', icon: '✕' },
    warning: { bg: '#f59e0b', icon: '!' },
    info: { bg: '#667eea', icon: 'i' }
  }
  
  const color = colors[type] || colors.info
  
  toast.style.cssText = `
    background: ${color.bg};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
    min-width: 200px;
    max-width: 400px;
    animation: slideIn 0.3s ease;
    pointer-events: auto;
  `
  
  toast.innerHTML = `
    <span style="font-size: 16px; font-weight: bold;">${color.icon}</span>
    <span>${message}</span>
  `
  
  // 添加动画样式
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style')
    style.id = 'toast-styles'
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }
  
  container.appendChild(toast)
  
  // 自动移除
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards'
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, duration)
}

// 挂载到全局
export default {
  install(app) {
    app.config.globalProperties.$toast = showToast
    window.showToast = showToast
  }
}