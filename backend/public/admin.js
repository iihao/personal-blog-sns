/**
 * 管理后台公共 JavaScript
 * 处理移动端菜单、响应式布局等功能
 */

(function() {
    'use strict';
    
    // 移动端菜单切换
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (!menuToggle || !sidebar) return;
        
        // 切换菜单
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });
        
        // 点击遮罩层关闭菜单
        if (overlay) {
            overlay.addEventListener('click', function() {
                closeMenu();
            });
        }
        
        // 点击侧边栏外部关闭菜单
        document.addEventListener('click', function(e) {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                closeMenu();
            }
        });
        
        // ESC 键关闭菜单
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMenu();
            }
        });
        
        // 窗口大小变化时重置菜单
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768) {
                    closeMenu();
                }
            }, 200);
        });
    }
    
    // 打开菜单
    function openMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const toggle = document.querySelector('.menu-toggle');
        
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        if (toggle) toggle.classList.add('active');
        
        document.body.style.overflow = 'hidden';
    }
    
    // 关闭菜单
    function closeMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const toggle = document.querySelector('.menu-toggle');
        
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (toggle) toggle.classList.remove('active');
        
        document.body.style.overflow = '';
    }
    
    // 切换菜单
    function toggleMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    // 自动高亮当前页面导航项
    function initActiveNav() {
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
        const navItems = document.querySelectorAll('.nav-item[data-page]');
        
        navItems.forEach(item => {
            if (item.dataset.page === currentPage) {
                item.classList.add('active');
            }
        });
    }
    
    // 平滑滚动
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // 卡片动画
    function initCardAnimations() {
        const cards = document.querySelectorAll('.stat-card, .card, .action-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        cards.forEach(card => observer.observe(card));
    }
    
    // 初始化
    function init() {
        initMobileMenu();
        initActiveNav();
        initSmoothScroll();
        
        // 延迟初始化卡片动画
        setTimeout(initCardAnimations, 100);
        
        console.log('[Admin UI] 初始化完成');
    }
    
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 暴露全局函数
    window.AdminUI = {
        openMenu,
        closeMenu,
        toggleMenu
    };
    
})();
