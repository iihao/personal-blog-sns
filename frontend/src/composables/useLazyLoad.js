/**
 * 图片懒加载组合式函数
 */
export function useLazyLoad() {
  let observer = null

  const observeImages = (selector = 'img[data-src]') => {
    // 创建 Intersection Observer
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          const src = img.getAttribute('data-src')
          const srcset = img.getAttribute('data-srcset')

          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            
            // 如果有 srcset，也加载
            if (srcset) {
              img.srcset = srcset
              img.removeAttribute('data-srcset')
            }

            // 添加加载完成的 class
            img.classList.add('lazy-loaded')
            
            // 停止观察
            observer.unobserve(img)
          }
        }
      })
    }, {
      rootMargin: '50px 0px', // 提前 50px 开始加载
      threshold: 0.01
    })

    // 观察所有匹配的图片
    const images = document.querySelectorAll(selector)
    images.forEach(img => {
      observer.observe(img)
    })
  }

  const disconnect = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  return {
    observeImages,
    disconnect
  }
}

/**
 * 图片懒加载指令
 */
export const lazyImage = {
  mounted(el) {
    const src = el.getAttribute('data-src')
    const srcset = el.getAttribute('data-srcset')
    
    if (!src) return

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.src = src
          if (srcset) {
            el.srcset = srcset
          }
          el.classList.add('lazy-loaded')
          observer.unobserve(el)
        }
      })
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    })

    observer.observe(el)
    el._lazyObserver = observer
  },
  beforeUnmount(el) {
    if (el._lazyObserver) {
      el._lazyObserver.disconnect()
      el._lazyObserver = null
    }
  }
}
