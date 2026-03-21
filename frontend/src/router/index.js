import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载 - 减少初始包大小
const HomeView = () => import('../views/HomeView.vue')
const PostView = () => import('../views/PostView.vue')
const NotFound = () => import('../views/NotFound.vue')
const Forbidden = () => import('../views/Forbidden.vue')
const UserSettings = () => import('../views/UserSettings.vue')
const Register = () => import('../views/Register.vue')
const Login = () => import('../views/Login.vue')
const AdminDashboard = () => import('../views/admin/Dashboard.vue')
const AdminLayout = () => import('../layouts/AdminLayout.vue')
const ArticlesView = () => import('../views/admin/Articles.vue')
const ArticleLogsView = () => import('../views/admin/ArticleLogs.vue')
const CommentsView = () => import('../views/admin/Comments.vue')
const MediaView = () => import('../views/admin/Media.vue')
const EditorView = () => import('../views/admin/Editor.vue')
const SettingsView = () => import('../views/admin/Settings.vue')
const UsersView = () => import('../views/admin/Users.vue')
const SystemConfigView = () => import('../views/admin/SystemConfig.vue')
const ChangelogAdminView = () => import('../views/admin/ChangelogAdmin.vue')
const CategoryView = () => import('../views/CategoryView.vue')
const TagView = () => import('../views/TagView.vue')
const CategoriesView = () => import('../views/Categories.vue')
const TagsView = () => import('../views/Tags.vue')
const SearchView = () => import('../views/SearchView.vue')
const UserWriteArticle = () => import('../views/UserWriteArticle.vue')
const ChangelogView = () => import('../views/ChangelogView.vue')
const ProjectsView = () => import('../views/ProjectsView.vue')
const ProjectDetailView = () => import('../views/ProjectDetailView.vue')
const ProjectsAdminView = () => import('../views/admin/ProjectsAdmin.vue')
const CheckinView = () => import('../views/Checkin.vue')
const WalletView = () => import('../views/Wallet.vue')

// 导入路由守卫
import { requireAuth, requireAdmin } from './guards'

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
    path: '/categories',
    name: 'categories',
    component: CategoriesView
  },
  {
    path: '/categories/:name',
    name: 'category',
    component: CategoryView,
    props: true
  },
  // 标签页面
  {
    path: '/tags',
    name: 'tags',
    component: TagsView
  },
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
    component: UserSettings,
    beforeEnter: requireAuth
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
    path: '/forbidden',
    name: 'forbidden',
    component: Forbidden
  },
  {
    path: '/not-found',
    name: 'not-found',
    component: NotFound
  },
  {
    path: '/changelog',
    name: 'changelog',
    component: ChangelogView
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: ProjectDetailView,
    props: true
  },
  {
    path: '/checkin',
    name: 'checkin',
    component: CheckinView
  },
  {
    path: '/wallet',
    name: 'wallet',
    component: WalletView,
    beforeEnter: requireAuth
  },
  {
    path: '/write',
    name: 'write',
    component: UserWriteArticle,
    beforeEnter: requireAuth
  },
  // 管理后台路由
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: requireAdmin,
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard
      },
      {
        path: 'articles',
        name: 'admin-articles',
        component: ArticlesView
      },
      {
        path: 'article-logs',
        name: 'admin-article-logs',
        component: ArticleLogsView
      },
      {
        path: 'comments',
        name: 'admin-comments',
        component: CommentsView
      },
      {
        path: 'media',
        name: 'admin-media',
        component: MediaView
      },
      {
        path: 'editor',
        name: 'admin-editor',
        component: EditorView
      },
      {
        path: 'editor/:id',
        name: 'admin-editor-edit',
        component: EditorView,
        props: true
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: SettingsView
      },
      {
        path: 'users',
        name: 'admin-users',
        component: UsersView
      },
      {
        path: 'system-config',
        name: 'admin-system-config',
        component: SystemConfigView
      },
      {
        path: 'changelog',
        name: 'admin-changelog',
        component: ChangelogAdminView
      },
      {
        path: 'projects',
        name: 'admin-projects',
        component: ProjectsAdminView
      }
    ]
  },
  // 通配符路由 - 必须放在最后
  {
    path: '/:pathMatch(.*)*',
    redirect: '/not-found'
  }
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

export default router
