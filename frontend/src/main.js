import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Toast from './components/Toast.vue'
import Icon from './components/Icon.vue'
import toastPlugin from './utils/toast.js'

import './assets/main.css'
import './assets/dark-mode.css'
import './assets/code-highlight.css'

const app = createApp(App)
const pinia = createPinia()

// 全局注册组件
app.component('Toast', Toast)
app.component('Icon', Icon)

// 使用 Toast 插件
app.use(toastPlugin)

app.use(pinia)
app.use(router)
app.mount('#app')