import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PostView from '../views/PostView.vue'
import NotFound from '../views/NotFound.vue'
import UserSettings from '../views/UserSettings.vue'
import Register from '../views/Register.vue'
import Login from '../views/Login.vue'
// 新增视图导入
import CategoryView from '../views/CategoryView.vue'
import TagView from '../views/TagView.vue'
import SearchView from '../views/SearchView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/post/:id',
    name: 'post',
    component: PostView,
    props: true
  },
  // 分类页面
  {
    path: '/categories/:name',
    name: 'category',
    component: CategoryView,
    props: true
  },
  // 标签页面
  {
    path: '/tags/:name',
    name: 'tag',
    component: TagView,
    props: true
  },
  // 搜索页面
  {
    path: '/search',
    name: 'search',
    component: SearchView,
    props: (route) => ({ q: route.query.q })
  },
  {
    path: '/settings',
    name: 'settings',
    component: UserSettings
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router