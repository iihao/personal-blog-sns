<template>
  <footer class="site-footer">
    <div class="container-custom">
      <!-- 主内容区 -->
      <div class="footer-main">
        <!-- 关于博客 -->
        <div class="footer-section">
          <h3 class="footer-title">
            <i class="fas fa-pen-fancy"></i>
            blog.sqlboy.top
          </h3>
          <p class="footer-description">
            记录技术学习心得，分享生活点滴感悟。<br>
            专注于 Web 开发、前端技术、生活随笔。
          </p>
          <div class="footer-social">
            <a href="#" class="social-link" title="GitHub">
              <i class="fab fa-github"></i>
            </a>
            <a href="#" class="social-link" title="微博">
              <i class="fab fa-weibo"></i>
            </a>
            <a href="#" class="social-link" title="知乎">
              <i class="fab fa-zhihu"></i>
            </a>
            <a href="mailto:admin@sqlboy.top" class="social-link" title="邮箱">
              <i class="fas fa-envelope"></i>
            </a>
          </div>
        </div>

        <!-- 快速导航 -->
        <div class="footer-section">
          <h3 class="footer-title">
            <i class="fas fa-compass"></i>
            快速导航
          </h3>
          <ul class="footer-nav">
            <li>
              <router-link to="/">
                <i class="fas fa-home"></i> 首页
              </router-link>
            </li>
            <li>
              <router-link to="/categories">
                <i class="fas fa-folder"></i> 分类
              </router-link>
            </li>
            <li>
              <router-link to="/tags">
                <i class="fas fa-tags"></i> 标签
              </router-link>
            </li>
            <li>
              <router-link to="/changelog">
                <i class="fas fa-history"></i> 更新日志
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 个人链接 -->
        <div class="footer-section">
          <h3 class="footer-title">
            <i class="fas fa-link"></i>
            关于我
          </h3>
          <ul class="footer-nav">
            <li>
              <router-link to="/about">
                <i class="fas fa-user"></i> 个人简介
              </router-link>
            </li>
            <li>
              <router-link to="/projects">
                <i class="fas fa-briefcase"></i> 项目作品
              </router-link>
            </li>
            <li>
              <a href="/rss.xml">
                <i class="fas fa-rss"></i> RSS 订阅
              </a>
            </li>
            <li>
              <router-link to="/friend-links">
                <i class="fas fa-handshake"></i> 友情链接
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 联系方式 -->
        <div class="footer-section">
          <h3 class="footer-title">
            <i class="fas fa-comments"></i>
            联系我
          </h3>
          <ul class="footer-contact">
            <li>
              <i class="fas fa-envelope"></i>
              <span>admin@sqlboy.top</span>
            </li>
            <li>
              <i class="fas fa-map-marker-alt"></i>
              <span>中国 · 深圳</span>
            </li>
            <li>
              <i class="fas fa-clock"></i>
              <span>GMT+8 时区</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p class="copyright">
            © {{ new Date().getFullYear() }}
            <a href="/" class="copyright-link">blog.sqlboy.top</a>.
            All rights reserved.
          </p>
          <p class="icp">
            <i class="fas fa-shield-alt"></i>
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow">
              粤 ICP 备 XXXXXXXX 号
            </a>
          </p>
        </div>
        <p class="powered-by">
          Powered by
          <a href="https://vuejs.org/" target="_blank" rel="nofollow">Vue 3</a>
          +
          <a href="https://tailwindcss.com/" target="_blank" rel="nofollow">Tailwind CSS</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.site-footer {
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  border-top: 1px solid var(--border-color);
  padding: 64px 0 32px;
  margin-top: 80px;
}

.footer-main {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 48px;
  margin-bottom: 48px;
}

.footer-section {
  min-width: 0;
}

.footer-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-title i {
  color: var(--accent-primary);
  font-size: 1.25rem;
}

.footer-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 16px;
}

/* 社交媒体 */
.footer-social {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 1.125rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-link:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-3px);
}

/* 导航链接 */
.footer-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-nav li {
  margin-bottom: 12px;
}

.footer-nav a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  padding: 6px 0;
}

.footer-nav a:hover {
  color: var(--accent-primary);
  padding-left: 8px;
}

.footer-nav a i {
  width: 16px;
  font-size: 0.875rem;
  opacity: 0.7;
}

/* 联系方式 */
.footer-contact {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-contact li {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.footer-contact li i {
  width: 18px;
  color: var(--accent-primary);
  margin-top: 2px;
}

/* 底部信息 */
.footer-bottom {
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.footer-bottom-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.copyright {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.copyright-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.copyright-link:hover {
  color: var(--accent-primary);
}

.icp {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icp a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.icp a:hover {
  color: var(--accent-primary);
}

.powered-by {
  color: var(--text-tertiary);
  font-size: 0.8125rem;
  margin: 0;
}

.powered-by a {
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color 0.2s;
}

.powered-by a:hover {
  color: var(--accent-primary);
}

/* 响应式 */
@media (max-width: 1024px) {
  .footer-main {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .site-footer {
    padding: 48px 0 24px;
    margin-top: 60px;
  }

  .footer-main {
    grid-template-columns: 1fr;
    gap: 32px;
    margin-bottom: 32px;
  }

  .footer-bottom-content {
    flex-direction: column;
    gap: 8px;
  }

  .footer-title {
    font-size: 1rem;
  }

  .footer-description {
    font-size: 0.9rem;
  }

  .footer-nav a,
  .footer-contact li {
    font-size: 0.9rem;
  }
}

/* 移动端底部双列布局 - 关于我和联系我 */
@media (max-width: 480px) {
  .site-footer {
    padding: 40px 0 20px;
  }

  .footer-social {
    gap: 8px;
  }

  .social-link {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .copyright,
  .icp,
  .powered-by {
    font-size: 0.75rem;
  }
  
  /* 关于我和联系我双列显示 */
  .footer-section:nth-child(3),
  .footer-section:nth-child(4) {
    display: inline-block;
    width: 48%;
    vertical-align: top;
  }
  
  .footer-section:nth-child(3) {
    margin-right: 4%;
  }
  
  .footer-section:nth-child(4) {
    margin-right: 0;
  }
  
  /* 调整标题大小 */
  .footer-section:nth-child(3) .footer-title,
  .footer-section:nth-child(4) .footer-title {
    font-size: 0.95rem;
    margin-bottom: 12px;
  }
  
  /* 调整链接字体 */
  .footer-section:nth-child(3) .footer-nav a,
  .footer-section:nth-child(4) .footer-contact li {
    font-size: 0.85rem;
  }
  
  /* 联系方式紧凑显示 */
  .footer-section:nth-child(4) .footer-contact li {
    margin-bottom: 8px;
  }
}
</style>