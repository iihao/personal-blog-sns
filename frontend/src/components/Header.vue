<template>
  <header class="header sticky top-0 z-50">
    <div class="container-custom flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="logo-section">
        <router-link to="/" class="logo-link" aria-label="返回首页">
          <span class="logo-text">blog.sqlboy.top</span>
        </router-link>
      </div>

      <!-- Desktop Navigation -->
      <nav class="desktop-nav hidden md:flex items-center gap-6">
        <router-link to="/" class="nav-link">
          <i class="fas fa-home"></i> 首页
        </router-link>
        
        <!-- 未登录状态 -->
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="nav-link">
            <i class="fas fa-sign-in-alt"></i> 登录
          </router-link>
          <router-link 
            to="/register" 
            class="btn-primary px-5 py-2 text-sm"
          >
            <i class="fas fa-user-plus"></i> 注册
          </router-link>
        </template>
        
        <!-- 已登录状态 -->
        <template v-else>
          <div class="user-menu" @click="toggleUserDropdown">
            <img v-if="userAvatar" :src="userAvatar" :alt="userName" class="user-avatar" />
            <div v-else class="user-avatar-placeholder">{{ userInitial }}</div>
            <span class="user-name">{{ userName }}</span>
            <i class="fas fa-chevron-down"></i>
            
            <!-- 用户下拉菜单 -->
            <div v-show="isDropdownOpen" class="user-dropdown">
              <router-link to="/settings" class="dropdown-item">
                <i class="fas fa-cog"></i> 个人设置
              </router-link>
              <router-link to="/admin/" class="dropdown-item">
                <i class="fas fa-tachometer-alt"></i> 管理后台
              </router-link>
              <div class="dropdown-divider"></div>
              <button @click="handleLogout" class="dropdown-item logout">
                <i class="fas fa-sign-out-alt"></i> 退出登录
              </button>
            </div>
          </div>
        </template>
        
        <ThemeToggle />
      </nav>

      <!-- Mobile Menu Button -->
      <button 
        class="mobile-menu-btn md:hidden"
        @click="toggleMenu"
        :aria-expanded="isMenuOpen"
        aria-label="切换菜单"
      >
        <span class="hamburger" :class="{ open: isMenuOpen }">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-down">
      <div v-show="isMenuOpen" class="mobile-menu md:hidden">
        <div class="mobile-menu-content">
          <router-link to="/" class="mobile-nav-link" @click="closeMenu">
            <i class="fas fa-home"></i> 首页
          </router-link>
          <router-link to="/settings" class="mobile-nav-link" @click="closeMenu">
            <i class="fas fa-user"></i> 设置
          </router-link>
          <router-link to="/register" class="mobile-nav-link" @click="closeMenu">
            <i class="fas fa-pen"></i> 写文章
          </router-link>
          <div class="mobile-menu-divider"></div>
          <div class="mobile-theme-toggle">
            <span class="theme-label">
              <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
              {{ isDark ? '浅色模式' : '深色模式' }}
            </span>
            <button @click="toggleTheme" class="theme-switch-btn">
              <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
const isMenuOpen = ref(false)
const isDropdownOpen = ref(false)

// 用户登录状态
const isLoggedIn = ref(false)
const userName = ref('用户')
const userAvatar = ref('')

// 获取用户首字母
const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

// 检查登录状态
const checkLoginStatus = () => {
  const user = localStorage.getItem('blog_user')
  if (user) {
    try {
      const userData = JSON.parse(user)
      isLoggedIn.value = true
      userName.value = userData.name || userData.username || '用户'
      userAvatar.value = userData.avatar || ''
    } catch (e) {
      isLoggedIn.value = false
    }
  } else {
    isLoggedIn.value = false
  }
}

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('blog_user')
    localStorage.removeItem('blog_token')
    isLoggedIn.value = false
    userName.value = '用户'
    userAvatar.value = ''
    isDropdownOpen.value = false
  }
}

const handleLogoutMobile = () => {
  handleLogout()
  closeMenu()
}

// 切换用户下拉菜单
const toggleUserDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const userMenu = document.querySelector('.user-menu')
  if (userMenu && !userMenu.contains(event.target)) {
    isDropdownOpen.value = false
  }
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

const closeMenu = () => {
  isMenuOpen.value = false
  isDropdownOpen.value = false
  document.body.style.overflow = ''
}

// 生命周期
onMounted(() => {
  checkLoginStatus()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Header 基础 */
.header {
  background: var(--header-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

/* Logo */
.logo-section {
  flex-shrink: 0;
}

.logo-link {
  text-decoration: none;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: opacity 0.2s ease;
}

.logo-link:hover .logo-text {
  opacity: 0.8;
}

/* Desktop Navigation */
.desktop-nav {
  align-items: center;
}

.nav-link {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-xl;
  @apply transition-all duration-200;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
}

.nav-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-link.router-link-active {
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-primary);
}

/* 用户菜单 */
.user-menu {
  @apply flex items-center gap-2 px-3 py-2 rounded-xl;
  @apply transition-all duration-200;
  cursor: pointer;
  background: var(--bg-tertiary);
}

.user-menu:hover {
  background: var(--border-color);
}

.user-avatar {
  @apply w-8 h-8 rounded-full object-cover;
}

.user-avatar-placeholder {
  @apply w-8 h-8 rounded-full;
  @apply flex items-center justify-center;
  @apply font-semibold text-sm;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
}

.user-name {
  @apply font-medium text-sm;
  color: var(--text-primary);
}

.user-dropdown {
  @apply absolute right-0 mt-2 w-48;
  @apply bg-white dark:bg-gray-800;
  @apply rounded-xl shadow-lg;
  @apply border border-gray-200 dark:border-gray-700;
  @apply py-2;
  z-index: 1000;
}

.dropdown-item {
  @apply flex items-center gap-3 px-4 py-2.5;
  @apply text-sm font-medium;
  @apply transition-colors duration-200;
  color: var(--text-secondary);
  text-decoration: none;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.dropdown-item.logout {
  color: var(--danger);
}

.dropdown-item.logout:hover {
  background: rgba(255, 59, 48, 0.1);
}

.dropdown-divider {
  @apply my-2 border-t;
  border-color: var(--border-color);
}

/* 移动端用户信息 */
.mobile-user-info {
  @apply flex items-center gap-3 px-4 py-3 mb-2;
  @apply bg-gray-50 dark:bg-gray-800 rounded-xl;
}

.mobile-user-avatar {
  @apply w-10 h-10 rounded-full object-cover;
}

.mobile-user-avatar-placeholder {
  @apply w-10 h-10 rounded-full;
  @apply flex items-center justify-center;
  @apply font-semibold;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
}

.mobile-user-name {
  @apply font-medium;
  color: var(--text-primary);
}

.mobile-nav-link.logout {
  color: var(--danger);
}

.mobile-nav-link.logout:hover {
  background: rgba(255, 59, 48, 0.1);
}

/* Mobile Menu Button */
.mobile-menu-btn {
  @apply flex items-center justify-center;
  @apply w-11 h-11 rounded-xl;
  @apply transition-all duration-200;
  background: none;
  border: none;
  cursor: pointer;
}

.mobile-menu-btn:hover {
  background: var(--bg-tertiary);
}

/* Hamburger */
.hamburger {
  @apply relative;
  width: 24px;
  height: 18px;
}

.bar {
  @apply absolute left-0 right-0 h-0.5 rounded-full;
  @apply transition-all duration-300;
  background: var(--text-primary);
}

.bar:nth-child(1) { top: 0; }
.bar:nth-child(2) { top: 50%; transform: translateY(-50%); }
.bar:nth-child(3) { bottom: 0; }

.hamburger.open .bar:nth-child(1) {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.hamburger.open .bar:nth-child(2) {
  opacity: 0;
}

.hamburger.open .bar:nth-child(3) {
  bottom: 50%;
  transform: translateY(50%) rotate(-45deg);
}

/* Mobile Menu */
.mobile-menu {
  @apply border-t;
  border-color: var(--border-color);
  background: var(--bg-primary);
  overflow: hidden;
}

.mobile-menu-content {
  @apply px-4 py-4 space-y-2;
}

.mobile-nav-link {
  @apply flex items-center gap-3 px-4 py-3 rounded-xl;
  @apply transition-all duration-200;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
}

.mobile-nav-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.mobile-nav-link.router-link-active {
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-primary);
}

.mobile-menu-divider {
  @apply my-3 border-t;
  border-color: var(--border-color);
}

/* Mobile Theme Toggle */
.mobile-theme-toggle {
  @apply flex items-center justify-between px-4 py-3;
  @apply mt-2 pt-3 border-t;
  border-color: var(--border-color);
}

.theme-label {
  @apply flex items-center gap-3;
  color: var(--text-secondary);
  font-weight: 500;
}

.theme-switch-btn {
  @apply flex items-center justify-center;
  @apply w-10 h-10 rounded-xl;
  @apply transition-all duration-200;
  background: var(--bg-tertiary);
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.theme-switch-btn:hover {
  background: var(--border-color);
  color: var(--accent-primary);
}

/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 500px;
}

/* Dark mode */
:global(.dark) .bar {
  background: var(--text-primary);
}
</style>