import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 图片懒加载指令
const lazyLoad = {
  mounted(el) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          if (img.dataset.src) {
            img.src = img.dataset.src
            observer.unobserve(img)
          }
        }
      })
    })
    observer.observe(el)
  }
}

const app = createApp(App)
app.directive('lazy', lazyLoad)
app.use(router)
app.mount('#app')
