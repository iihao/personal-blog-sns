import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PostView from '../views/PostView.vue'
import NotFound from '../views/NotFound.vue'
import Forbidden from '../views/Forbidden.vue'
import UserSettings from '../views/UserSettings.vue'
import Register from '../views/Register.vue'
import Login from '../views/Login.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import ArticlesView from '../views/admin/Articles.vue'
import CommentsView from '../views/admin/Comments.vue'
import MediaView from '../views/admin/Media.vue'
import EditorView from '../views/admin/Editor.vue'
import SettingsView from '../views/admin/Settings.vue'
import UsersView from '../views/admin/Users.vue'
import SystemConfigView from '../views/admin/SystemConfig.vue'
import ChangelogAdminView from '../views/admin/ChangelogAdmin.vue'
// 新增视图导入
import CategoryView from '../views/CategoryView.vue'
import TagView from '../views/TagView.vue'
import CategoriesView from '../views/Categories.vue'
import TagsView from '../views/Tags.vue'
import SearchView from '../views/SearchView.vue'
import UserWriteArticle from '../views/UserWriteArticle.vue'
import ChangelogView from '../views/ChangelogView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue'
import ProjectsAdminView from '../views/admin/ProjectsAdmin.vue'

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
    path: '/write',
    name: 'write-article',
    component: UserWriteArticle,
    beforeEnter: requireAuth
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
    path: '/admin',
    name: 'admin',
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
        path: 'editor',
        name: 'admin-editor',
        component: EditorView
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