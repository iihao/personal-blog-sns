<template>
  <footer class="site-footer">
    <div class="container-custom">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="footer-logo">blog.sqlboy.top</span>
          <p class="footer-tagline">记录技术，分享生活</p>
        </div>
        
        <div class="footer-links">
          <router-link to="/" class="footer-link">首页</router-link>
          <router-link to="/settings" class="footer-link">设置</router-link>
          <router-link to="/register" class="footer-link">写文章</router-link>
        </div>
        
        <div class="footer-bottom">
          <p class="copyright">
            © {{ new Date().getFullYear() }} blog.sqlboy.top. All rights reserved.
          </p>
          <p class="powered-by">
            Powered by Vue3 + Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.site-footer {
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: 48px 0 32px;
  margin-top: 80px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.footer-brand {
  text-align: center;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-tagline {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.footer-links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--accent-primary);
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  width: 100%;
  text-align: center;
}

.copyright {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.powered-by {
  color: var(--text-tertiary);
  font-size: 0.8125rem;
}

/* 响应式 */
@media (max-width: 640px) {
  .site-footer {
    padding: 36px 0 24px;
    margin-top: 60px;
  }

  .footer-logo {
    font-size: 1.25rem;
  }

  .footer-links {
    gap: 16px;
  }
}
</style>