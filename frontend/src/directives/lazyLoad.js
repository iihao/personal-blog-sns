/**
 * 图片懒加载指令
 * 使用 Intersection Observer API 实现
 */
export default {
  mounted(el, binding) {
    // 如果是普通图片，使用 data-src
    if (el.tagName === 'IMG') {
      el.setAttribute('data-src', binding.value || el.src)
      el.removeAttribute('src')
      el.classList.add('lazy-image')
    }
    
    // 创建观察者
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          const src = img.getAttribute('data-src')
          
          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            img.classList.add('loaded')
            
            // 添加淡入效果
            img.style.opacity = '0'
            img.onload = () => {
              img.style.transition = 'opacity 0.3s'
              img.style.opacity = '1'
            }
            
            // 停止观察
            observer.unobserve(img)
          }
        }
      })
    }, {
      rootMargin: '50px 0px', // 提前 50px 开始加载
      threshold: 0.01
    })
    
    // 开始观察
    observer.observe(el)
    
    // 保存观察者实例，方便清理
    el._lazyObserver = observer
  },
  
  beforeUnmount(el) {
    // 清理观察者
    if (el._lazyObserver) {
      el._lazyObserver.disconnect()
      el._lazyObserver = null
    }
  }
}
