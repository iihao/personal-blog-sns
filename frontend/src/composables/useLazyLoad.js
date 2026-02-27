/**
 * 图片懒加载 Composable
 * 使用 Intersection Observer API 实现
 */

export function useLazyLoad() {
  let observer = null

  // 初始化懒加载观察器
  const initObserver = (options = {}) => {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          const dataSrc = img.getAttribute('data-src')
          
          if (dataSrc) {
            img.src = dataSrc
            img.removeAttribute('data-src')
            img.classList.add('loaded')
          }
          
          observer.unobserve(img)
        }
      })
    }, { ...defaultOptions, ...options })

    return observer
  }

  // 观察单个图片
  const observeImage = (img) => {
    if (!observer) {
      initObserver()
    }
    if (img && img.hasAttribute('data-src')) {
      observer.observe(img)
    }
  }

  // 观察多个图片
  const observeImages = (selector = 'img[data-src]') => {
    if (!observer) {
      initObserver()
    }
    
    const images = document.querySelectorAll(selector)
    images.forEach(observeImage)
    
    return images.length
  }

  // 停止观察
  const disconnect = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  // 预处理 Markdown 内容中的图片
  const processMarkdownImages = (html) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    
    const images = temp.querySelectorAll('img')
    images.forEach((img) => {
      const src = img.getAttribute('src')
      if (src) {
        img.setAttribute('data-src', src)
        img.removeAttribute('src')
        img.classList.add('lazy')
        img.setAttribute('loading', 'lazy')
      }
    })
    
    return temp.innerHTML
  }

  // 自动初始化
  const autoInit = () => {
    initObserver()
    observeImages()
  }

  return {
    initObserver,
    observeImage,
    observeImages,
    disconnect,
    processMarkdownImages,
    autoInit
  }
}
