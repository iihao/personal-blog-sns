import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Toast from './components/Toast.vue'
import Icon from './components/Icon.vue'
import CodeBlock from './components/CodeBlock.vue'
import toastPlugin from './utils/toast.js'
import lazyLoad from './directives/lazyLoad.js'

import './assets/main.css'
import './assets/dark-mode.css'
import './assets/code-highlight.css'

const app = createApp(App)
const pinia = createPinia()

// 全局注册组件
app.component('Toast', Toast)
app.component('Icon', Icon)
app.component('CodeBlock', CodeBlock)

// 全局注册指令
app.directive('lazy', lazyLoad)

// 使用 Toast 插件
app.use(toastPlugin)

app.use(pinia)
app.use(router)
app.mount('#app')