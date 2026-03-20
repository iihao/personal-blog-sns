import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PostView from '../views/PostView.vue'
import CheckinView from '../views/CheckinView.vue'
import WalletView from '../views/WalletView.vue'
import UserView from '../views/UserView.vue'
import DiscoverView from '../views/DiscoverView.vue'
import MessagesView from '../views/MessagesView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import CategoryView from '../views/CategoryView.vue'
import TagsView from '../views/TagsView.vue'
import TagView from '../views/TagView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue'
import SearchView from '../views/SearchView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ChangelogView from '../views/ChangelogView.vue'
import UserSettingsView from '../views/UserSettingsView.vue'
import UserWriteView from '../views/UserWriteView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/discover', name: 'discover', component: DiscoverView },
  { path: '/messages', name: 'messages', component: MessagesView },
  { path: '/post/:id', name: 'post', component: PostView },
  { path: '/checkin', name: 'checkin', component: CheckinView },
  { path: '/wallet', name: 'wallet', component: WalletView },
  { path: '/user', name: 'user', component: UserView },
  { path: '/categories', name: 'categories', component: CategoriesView },
  { path: '/categories/:name', name: 'category', component: CategoryView },
  { path: '/tags', name: 'tags', component: TagsView },
  { path: '/tags/:name', name: 'tag', component: TagView },
  { path: '/projects', name: 'projects', component: ProjectsView },
  { path: '/projects/:id', name: 'project-detail', component: ProjectDetailView },
  { path: '/search', name: 'search', component: SearchView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/changelog', name: 'changelog', component: ChangelogView },
  { path: '/settings', name: 'settings', component: UserSettingsView },
  { path: '/write', name: 'write', component: UserWriteView }
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
