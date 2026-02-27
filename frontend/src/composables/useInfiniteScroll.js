/**
 * 无限滚动加载 Composable
 * 使用 Intersection Observer API 实现
 */

export function useInfiniteScroll(options = {}) {
  const {
    onLoadMore,
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true
  } = options

  let observer = null
  let isLoading = false
  let hasMore = true

  // 创建观察器
  const createObserver = (element) => {
    if (!element || !enabled || !hasMore || isLoading) return

    observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      
      if (entry.isIntersecting && !isLoading && hasMore) {
        loadMore()
      }
    }, {
      root: null,
      rootMargin,
      threshold
    })

    observer.observe(element)
  }

  // 加载更多
  const loadMore = async () => {
    if (isLoading || !hasMore || !onLoadMore) return

    isLoading = true
    
    try {
      const result = await onLoadMore()
      hasMore = result !== false
    } catch (error) {
      console.error('Infinite scroll error:', error)
      hasMore = false
    } finally {
      isLoading = false
    }
  }

  // 停止观察
  const disconnect = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  // 重置状态
  const reset = () => {
    disconnect()
    isLoading = false
    hasMore = true
  }

  // 设置是否有更多数据
  const setHasMore = (value) => {
    hasMore = value
  }

  return {
    createObserver,
    disconnect,
    loadMore,
    reset,
    setHasMore,
    getIsLoading: () => isLoading,
    getHasMore: () => hasMore
  }
}
