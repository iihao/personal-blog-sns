import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载 - 减少初始包大小
const HomeView = () => import('../views/HomeView.vue')
const PostView = () => import('../views/PostView.vue')
const CheckinView = () => import('../views/CheckinView.vue')
const WalletView = () => import('../views/WalletView.vue')
const UserView = () => import('../views/UserView.vue')
const DiscoverView = () => import('../views/DiscoverView.vue')
const MessagesView = () => import('../views/MessagesView.vue')
const CategoriesView = () => import('../views/CategoriesView.vue')
const CategoryView = () => import('../views/CategoryView.vue')
const TagsView = () => import('../views/TagsView.vue')
const TagView = () => import('../views/TagView.vue')
const ProjectsView = () => import('../views/ProjectsView.vue')
const ProjectDetailView = () => import('../views/ProjectDetailView.vue')
const SearchView = () => import('../views/SearchView.vue')
const LoginView = () => import('../views/LoginView.vue')
const RegisterView = () => import('../views/RegisterView.vue')
const ChangelogView = () => import('../views/ChangelogView.vue')
const UserSettingsView = () => import('../views/UserSettingsView.vue')
const UserWriteView = () => import('../views/UserWriteView.vue')

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '首页' } },
  { path: '/discover', name: 'discover', component: DiscoverView, meta: { title: '发现' } },
  { path: '/messages', name: 'messages', component: MessagesView, meta: { title: '消息' } },
  { path: '/post/:id', name: 'post', component: PostView, meta: { title: '文章详情' } },
  { path: '/checkin', name: 'checkin', component: CheckinView, meta: { title: '签到' } },
  { path: '/wallet', name: 'wallet', component: WalletView, meta: { title: '钱包' } },
  { path: '/user', name: 'user', component: UserView, meta: { title: '我的' } },
  { path: '/categories', name: 'categories', component: CategoriesView, meta: { title: '分类' } },
  { path: '/categories/:name', name: 'category', component: CategoryView, meta: { title: '分类文章' } },
  { path: '/tags', name: 'tags', component: TagsView, meta: { title: '标签' } },
  { path: '/tags/:name', name: 'tag', component: TagView, meta: { title: '标签文章' } },
  { path: '/projects', name: 'projects', component: ProjectsView, meta: { title: '项目' } },
  { path: '/projects/:id', name: 'project-detail', component: ProjectDetailView, meta: { title: '项目详情' } },
  { path: '/search', name: 'search', component: SearchView, meta: { title: '搜索' } },
  { path: '/login', name: 'login', component: LoginView, meta: { title: '登录' } },
  { path: '/register', name: 'register', component: RegisterView, meta: { title: '注册' } },
  { path: '/changelog', name: 'changelog', component: ChangelogView, meta: { title: '更新日志' } },
  { path: '/settings', name: 'settings', component: UserSettingsView, meta: { title: '设置' } },
  { path: '/write', name: 'write', component: UserWriteView, meta: { title: '写文章' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫 - 动态设置页面标题
router.beforeEach((to, from, next) => {
  const baseTitle = '博客'
  const pageTitle = to.meta.title || '首页'
  document.title = `${pageTitle} - ${baseTitle}`
  next()
})

export default router
