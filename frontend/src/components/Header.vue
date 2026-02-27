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
        <router-link to="/settings" class="nav-link">
          <i class="fas fa-user"></i> 设置
        </router-link>
        <router-link 
          to="/register" 
          class="btn-primary px-5 py-2 text-sm"
        >
          <i class="fas fa-pen"></i> 写文章
        </router-link>
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
import { ref } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

const closeMenu = () => {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}
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