<template>
  <nav class="mobile-nav">
    <!-- 汉堡菜单按钮 -->
    <button 
      class="menu-toggle" 
      @click="toggleMenu"
      :aria-expanded="isOpen"
      :aria-label="isOpen ? '关闭菜单' : '打开菜单'"
    >
      <span class="hamburger" :class="{ open: isOpen }">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </span>
    </button>

    <!-- 菜单内容 -->
    <transition name="slide">
      <div v-show="isOpen" class="menu-content">
        <div class="menu-header">
          <h2>菜单</h2>
          <button class="close-btn" @click="toggleMenu">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <ul class="menu-list">
          <li>
            <a href="/" @click="closeMenu">
              <i class="fas fa-home"></i> 首页
            </a>
          </li>
          <li>
            <a href="/admin" @click="closeMenu">
              <i class="fas fa-cog"></i> 管理后台
            </a>
          </li>
          <li class="theme-item">
            <span class="label">
              <i class="fas fa-moon"></i> 深色模式
            </span>
            <button @click="toggleTheme" class="theme-toggle">
              <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
            </button>
          </li>
        </ul>
      </div>
    </transition>

    <!-- 遮罩层 -->
    <transition name="fade">
      <div v-show="isOpen" class="menu-overlay" @click="closeMenu"></div>
    </transition>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  document.body.style.overflow = isOpen.value ? 'hidden' : ''
}

const closeMenu = () => {
  isOpen.value = false
  document.body.style.overflow = ''
}
</script>

<style scoped>
.mobile-nav {
  display: none;
}

/* 汉堡菜单按钮 */
.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 1001;
}

.hamburger {
  position: relative;
  width: 24px;
  height: 18px;
}

.bar {
  position: absolute;
  width: 100%;
  height: 2px;
  background: var(--text-primary, #111827);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.bar:nth-child(1) {
  top: 0;
}

.bar:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
}

.bar:nth-child(3) {
  bottom: 0;
}

/* 打开状态 */
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

/* 菜单内容 */
.menu-content {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background: var(--bg-primary, #ffffff);
  box-shadow: -4px 0 20px var(--shadow-color, rgba(0, 0, 0, 0.1));
  z-index: 1002;
  padding: 20px;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.menu-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: var(--text-secondary, #6b7280);
  font-size: 1.25rem;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-primary, #111827);
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-list li {
  margin-bottom: 8px;
}

.menu-list a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--text-secondary, #6b7280);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.menu-list a:hover {
  background: var(--bg-tertiary, #f3f4f6);
  color: var(--text-primary, #111827);
}

.menu-list i {
  width: 20px;
  text-align: center;
}

/* 主题切换项 */
.theme-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-top: 20px;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.theme-item .label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary, #6b7280);
}

.theme-toggle {
  background: var(--bg-tertiary, #f3f4f6);
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--text-secondary, #6b7280);
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: var(--border-color, #e5e7eb);
}

/* 遮罩层 */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  backdrop-filter: blur(4px);
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .mobile-nav {
    display: block;
  }
}
</style>
