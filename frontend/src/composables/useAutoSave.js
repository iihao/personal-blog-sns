/**
 * 草稿自动保存 Composable
 * 支持本地存储 + 服务端保存
 */

export function useAutoSave(options = {}) {
  const {
    onSave,
    interval = 30000, // 默认 30 秒保存一次
    storageKey = 'blog_draft',
    enabled = true
  } = options

  let timer = null
  let lastSaved = null
  let hasUnsavedChanges = false

  // 保存到本地存储
  const saveToLocalStorage = (data) => {
    if (!enabled) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        ...data,
        savedAt: Date.now()
      }))
      lastSaved = new Date()
      hasUnsavedChanges = false
    } catch (error) {
      console.error('Auto-save to localStorage failed:', error)
    }
  }

  // 从本地存储恢复
  const restoreFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const data = JSON.parse(saved)
        // 只恢复 24 小时内的草稿
        const isRecent = Date.now() - data.savedAt < 24 * 60 * 60 * 1000
        if (isRecent) {
          return data
        } else {
          // 清除过期草稿
          localStorage.removeItem(storageKey)
        }
      }
    } catch (error) {
      console.error('Restore from localStorage failed:', error)
    }
    return null
  }

  // 清除本地存储
  const clearLocalStorage = () => {
    localStorage.removeItem(storageKey)
  }

  // 保存到服务端
  const saveToServer = async (data) => {
    if (!onSave || !enabled) return
    
    try {
      await onSave(data)
      saveToLocalStorage(data)
      return true
    } catch (error) {
      console.error('Auto-save to server failed:', error)
      // 服务端保存失败时，至少保存到本地
      saveToLocalStorage(data)
      return false
    }
  }

  // 标记为有未保存的更改
  const markAsUnsaved = () => {
    hasUnsavedChanges = true
  }

  // 启动自动保存
  const startAutoSave = (getData) => {
    if (!enabled) return

    stopAutoSave()
    
    timer = setInterval(() => {
      if (hasUnsavedChanges && getData) {
        const data = getData()
        if (data) {
          saveToServer(data)
        }
      }
    }, interval)
  }

  // 停止自动保存
  const stopAutoSave = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  // 获取最后保存时间
  const getLastSaved = () => lastSaved

  // 获取是否有未保存的更改
  const getHasUnsavedChanges = () => hasUnsavedChanges

  return {
    saveToLocalStorage,
    restoreFromLocalStorage,
    clearLocalStorage,
    saveToServer,
    markAsUnsaved,
    startAutoSave,
    stopAutoSave,
    getLastSaved,
    getHasUnsavedChanges
  }
}
