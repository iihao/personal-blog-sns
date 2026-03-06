<template>
  <div class="admin-layout" :class="{ 'sidebar-open': !sidebarCollapsed && isMobile }">
    <!-- 移动端遮罩层 -->
    <div v-if="isMobile && !sidebarCollapsed" class="sidebar-overlay" @click="sidebarCollapsed = true"></div>
    
    <!-- 侧边栏 -->
    <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed, 'mobile-open': !sidebarCollapsed && isMobile }">
      <div class="sidebar-header">
        <router-link to="/" class="logo-link">
          <div class="logo-icon">
            <i class="fas fa-pen-fancy"></i>
          </div>
          <span class="logo-text" v-show="!sidebarCollapsed">博客管理</span>
        </router-link>
        <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
          <i :class="sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title" v-show="!sidebarCollapsed">内容管理</div>
          <router-link to="/admin" class="nav-item" exact @click="handleNavClick">
            <i class="fas fa-home"></i>
            <span>仪表盘</span>
          </router-link>
          <router-link to="/admin/articles" class="nav-item" @click="handleNavClick">
            <i class="fas fa-newspaper"></i>
            <span>文章管理</span>
          </router-link>
          <router-link to="/admin/editor" class="nav-item" @click="handleNavClick">
            <i class="fas fa-plus-circle"></i>
            <span>写文章</span>
          </router-link>
          <router-link to="/admin/media" class="nav-item" @click="handleNavClick">
            <i class="fas fa-images"></i>
            <span>媒体库</span>
          </router-link>
          <router-link to="/admin/comments" class="nav-item" @click="handleNavClick">
            <i class="fas fa-comments"></i>
            <span>评论管理</span>
          </router-link>
        </div>

        <div class="nav-section">
          <div class="nav-section-title" v-show="!sidebarCollapsed">用户管理</div>
          <router-link to="/admin/users" class="nav-item" @click="handleNavClick">
            <i class="fas fa-users"></i>
            <span>用户管理</span>
          </router-link>
        </div>

        <div class="nav-section">
          <div class="nav-section-title" v-show="!sidebarCollapsed">系统</div>
          <router-link to="/admin/settings" class="nav-item" @click="handleNavClick">
            <i class="fas fa-cog"></i>
            <span>系统设置</span>
          </router-link>
          <router-link to="/admin/changelog" class="nav-item" @click="handleNavClick">
            <i class="fas fa-history"></i>
            <span>更新日志</span>
          </router-link>
          <a href="/" target="_blank" class="nav-item" @click="handleNavClick">
            <i class="fas fa-external-link-alt"></i>
            <span>查看站点</span>
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <img :src="userAvatar" :alt="userName" class="user-avatar" />
          <div class="user-details" v-show="!sidebarCollapsed">
            <div class="user-name">{{ userName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="admin-main">
      <!-- 顶部导航 -->
      <header class="admin-header">
        <div class="header-left">
          <!-- 汉堡菜单按钮 - 仅移动端显示 -->
          <button 
            v-show="isMobile"
            class="mobile-menu-toggle" 
            @click="toggleSidebar" 
            :aria-label="sidebarCollapsed ? '打开菜单' : '关闭菜单'"
          >
            <span class="hamburger" :class="{ 'active': !sidebarCollapsed && isMobile }">
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </span>
          </button>
          <h1 class="page-title">
            <slot name="title">{{ pageTitle }}</slot>
          </h1>
        </div>
        <div class="header-right">
          <!-- 移动端登录状态按钮 -->
          <template v-if="isMobile">
            <router-link v-if="isLoggedIn" to="/admin/editor" class="header-btn header-action" title="写文章">
              <i class="fas fa-pen"></i>
              <span class="btn-text hide-small-mobile">写文章</span>
            </router-link>
            <router-link v-else to="/login" class="header-btn header-action" title="登录">
              <i class="fas fa-sign-in-alt"></i>
              <span class="btn-text hide-small-mobile">登录</span>
            </router-link>
          </template>
          
          <button class="header-btn" @click="refreshPage" title="刷新">
            <i class="fas fa-sync"></i>
          </button>
          <router-link to="/" class="header-btn" title="返回首页">
            <i class="fas fa-home"></i>
          </router-link>
        </div>
      </header>

      <!-- 内容区域 -->
      <div class="admin-content">
        <router-view></router-view>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const sidebarCollapsed = ref(false)
const isMobile = ref(false)

// 检测屏幕尺寸
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    sidebarCollapsed.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  checkAuth()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  
  // 移动端打开侧边栏时禁用 body 滚动
  if (isMobile.value && !sidebarCollapsed.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 点击导航项后自动关闭侧边栏（移动端）
const handleNavClick = () => {
  if (isMobile.value) {
    sidebarCollapsed.value = true
    document.body.style.overflow = ''
  }
}

// 用户信息
const userName = ref('用户')
const userAvatar = ref('')
const userRole = ref('')
const isLoggedIn = ref(false)

// 页面标题
const props = defineProps({
  pageTitle: {
    type: String,
    default: '管理后台'
  }
})

// 检查登录状态和管理员权限
const checkAuth = () => {
  const token = localStorage.getItem('blog_token')
  const user = localStorage.getItem('blog_user')
  const expiry = localStorage.getItem('blog_token_expiry')
  
  // 检查 token 是否过期
  if (expiry && Date.now() > parseInt(expiry)) {
    console.log('[AdminLayout] Token 已过期，清除登录状态')
    localStorage.removeItem('blog_user')
    localStorage.removeItem('blog_token')
    localStorage.removeItem('blog_token_expiry')
    alert('登录已过期，请重新登录')
    router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
    return false
  }
  
  if (!token || !user) {
    isLoggedIn.value = false
    // 不在这里强制跳转，让路由守卫处理
    return false
  }
  
  try {
    const userData = JSON.parse(user)
    userName.value = userData.name || userData.username || '用户'
    userAvatar.value = userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=667eea&color=fff&size=128`
    
    // 检查管理员权限
    const userRoleValue = userData.role
    if (userRoleValue !== 'admin' && userRoleValue !== 'super_admin') {
      console.log('[AdminLayout] 用户无管理员权限，跳转到无权限页面')
      alert('抱歉，您没有权限访问管理后台')
      router.push('/forbidden')
      return false
    }
    
    userRole.value = userRoleValue === 'admin' ? '管理员' : '超级管理员'
    isLoggedIn.value = true
    return true
  } catch (e) {
    console.error('[AdminLayout] 解析用户数据失败:', e)
    isLoggedIn.value = false
    localStorage.removeItem('blog_user')
    localStorage.removeItem('blog_token')
    localStorage.removeItem('blog_token_expiry')
    alert('用户数据异常，请重新登录')
    router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
    return false
  }
}

// 刷新页面
const refreshPage = () => {
  window.location.reload()
}

// 简单的 Toast 通知（内联实现，避免依赖外部组件）
const showToast = (message, type = 'info') => {
  // 创建临时 toast 元素
  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `
  toast.textContent = message
  document.body.appendChild(toast)
  
  // 3 秒后移除
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.3s ease'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

defineExpose({ showToast })

// 生命周期
onMounted(() => {
  checkAuth()
  
  // 移动端自动折叠侧边栏
  if (window.innerWidth < 768) {
    sidebarCollapsed.value = true
  }
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f7;
}

/* 侧边栏 */
.admin-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 260px;
  height: 100vh;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 1000;
}

.admin-sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #1d1d1f;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
}

.sidebar-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #86868b;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  background: #f5f5f7;
  color: #667eea;
}

/* 导航 */
.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 24px;
}

.nav-section-title {
  font-size: 11px;
  font-weight: 700;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
  padding-left: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  color: #1d1d1f;
  text-decoration: none;
  transition: all 0.2s;
  margin-bottom: 4px;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
}

.nav-item.router-link-active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(102, 126, 234, 0.08));
  color: #667eea;
  font-weight: 600;
}

.nav-item i {
  width: 20px;
  text-align: center;
  font-size: 16px;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-details {
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #86868b;
}

/* 主内容区 - 桌面端 */
@media (min-width: 769px) {
  .admin-main {
    margin-left: 260px;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .admin-sidebar.collapsed + .admin-main {
    margin-left: 70px;
  }
}

/* 主内容区 - 移动端 */
.admin-main {
  flex: 1;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .admin-layout {
    display: block;
  }
  
  .admin-sidebar {
    transform: translateX(-100%);
  }
  
  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .admin-main {
    margin-left: 0 !important;
    width: 100% !important;
  }
}

.admin-header {
  flex-shrink: 0;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* PC 端强制隐藏汉堡按钮 */
@media (min-width: 769px) {
  .mobile-menu-toggle {
    display: none !important;
  }
}

.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #1d1d1f;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.mobile-menu-toggle:active {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(0.95);
}

/* 汉堡按钮动画 */
.hamburger {
  display: block;
  width: 24px;
  height: 18px;
  position: relative;
}

.hamburger-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: currentColor;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-line:nth-child(1) {
  top: 0;
}

.hamburger-line:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
}

.hamburger-line:nth-child(3) {
  bottom: 0;
}

/* 汉堡按钮激活状态（X 形） */
.hamburger.active .hamburger-line:nth-child(1) {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.hamburger.active .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: translateX(-10px);
}

.hamburger.active .hamburger-line:nth-child(3) {
  bottom: 50%;
  transform: translateY(50%) rotate(-45deg);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 8px;
}

.header-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  transition: all 0.2s;
  text-decoration: none;
}

.header-btn:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

/* 移动端操作按钮（带文字） */
.header-action {
  padding: 0 12px;
  width: auto;
  gap: 6px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
}

.header-action:hover {
  background: linear-gradient(135deg, #5568d3, #63408a);
  color: white;
  border-color: transparent;
}

.btn-text {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.admin-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义滚动条样式 */
.admin-content::-webkit-scrollbar {
  width: 8px;
}

.admin-content::-webkit-scrollbar-track {
  background: #f5f5f7;
  border-radius: 4px;
}

.admin-content::-webkit-scrollbar-thumb {
  background: #d2d2d7;
  border-radius: 4px;
}

.admin-content::-webkit-scrollbar-thumb:hover {
  background: #86868b;
}

/* 暗黑模式滚动条 */
.dark .admin-content::-webkit-scrollbar-track {
  background: #1c1c1e;
}

.dark .admin-content::-webkit-scrollbar-thumb {
  background: #38383a;
}

.dark .admin-content::-webkit-scrollbar-thumb:hover {
  background: #636366;
}

/* 侧边栏遮罩层 - 移动端 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
  -webkit-tap-highlight-color: transparent;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* 响应式 - 移动端优化 */
@media (max-width: 768px) {
  .admin-layout {
    display: block;
  }
  
  .admin-sidebar {
    transform: translateX(-100%);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .admin-sidebar.mobile-open {
    transform: translateX(0);
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* 使用更高优先级的选择器覆盖 scoped 样式 */
  .admin-main,
  .admin-sidebar + .admin-main,
  .admin-sidebar.collapsed + .admin-main {
    margin-left: 0 !important;
    width: 100%;
  }
  
  .mobile-menu-toggle {
    display: block;
    width: 44px; /* 触摸区域优化 */
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .admin-header {
    padding: 12px 16px;
    position: sticky;
    top: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .header-left {
    gap: 12px;
  }
  
  .page-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
  
  .admin-content {
    padding: 16px;
    padding-bottom: 80px; /* 为底部导航留空间 */
  }
  
  .header-btn {
    width: 40px;
    height: 40px;
  }
  
  /* 移动端操作按钮优化 */
  .header-action {
    padding: 0 14px;
    min-width: 44px;
    height: 40px;
  }
  
  .btn-text {
    font-size: 13px;
  }
  
  /* 侧边栏导航项触摸优化 */
  .nav-item {
    min-height: 48px;
    padding: 12px 16px;
  }
  
  /* 侧边栏底部用户信息优化 */
  .sidebar-footer {
    padding: 16px;
    min-height: 70px;
  }
  
  .user-avatar {
    width: 44px;
    height: 44px;
  }
}

/* 小屏幕手机优化 */
@media (max-width: 480px) {
  .admin-header {
    padding: 10px 12px;
  }
  
  .page-title {
    font-size: 16px;
  }
  
  .admin-content {
    padding: 12px;
  }
  
  .header-btn {
    width: 36px;
    height: 36px;
  }
  
  /* 移动端操作按钮小屏幕优化 */
  .header-action {
    padding: 0 10px;
  }
  
  .btn-text {
    font-size: 12px;
  }
  
  .sidebar-header {
    padding: 16px;
  }
  
  .logo-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}

/* 横屏模式优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .admin-sidebar {
    width: 280px;
  }
  
  .nav-section-title {
    margin-bottom: 8px;
  }
  
  .nav-item {
    padding: 10px 16px;
  }
}

/* 小屏幕手机优化 */
@media (max-width: 480px) {
  .admin-header {
    padding: 10px 12px;
  }
  
  .page-title {
    font-size: 16px;
  }
  
  .admin-content {
    padding: 12px;
  }
  
  .header-right {
    gap: 4px;
  }
  
  .header-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

/* 全局移动端显示控制工具类 */
.hide-mobile {
  display: block;
}

.show-mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .hide-mobile {
    display: none !important;
  }
  
  .show-mobile-only {
    display: block !important;
  }
  
  /* 表格在移动端隐藏 */
  .data-table {
    display: none !important;
  }
  
  /* 移动端卡片布局显示 */
  .data-table-mobile {
    display: block !important;
  }
}

@media (min-width: 769px) {
  .show-mobile-only {
    display: none !important;
  }
  
  .data-table-mobile {
    display: none !important;
  }
}
</style>
