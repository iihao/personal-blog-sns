<template>
  <div class="share-buttons">
    <h3 class="share-title">分享这篇文章</h3>
    <div class="share-list">
      <!-- 复制链接 -->
      <button @click="copyLink" class="share-btn copy" :title="'复制链接'">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span class="share-label">复制</span>
      </button>

      <!-- 微信分享 -->
      <button @click="shareWechat" class="share-btn wechat" :title="'微信分享'">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
          <path d="M12 2C6.48 2 2 5.58 2 10c0 2.52 1.5 4.76 3.84 6.18-.12.75-.43 1.96-.77 2.62-.13.25.14.55.42.42 1.56-.71 3.06-1.56 4.07-2.17.8.22 1.65.34 2.44.34 5.52 0 10-3.58 10-8S17.52 2 12 2zm-7 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm10 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
        </svg>
        <span class="share-label">微信</span>
      </button>

      <!-- 微博分享 -->
      <button @click="shareWeibo" class="share-btn weibo" :title="'微博分享'">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.5 2C5.5 2 1.5 5.5 1.5 10c0 2.5 1.5 4.5 3.5 5.5-.1.5-.3 1.5-.5 2-.1.2.1.4.3.3 1-.5 2.5-1 3-1.5.5.1 1 .2 1.5.2 4 0 7.5-2.5 7.5-6.5S14.5 2 10.5 2zm-2 9c-.8 0-1.5-.7-1.5-1.5S7.7 8 8.5 8 10 8.7 10 9.5 9.3 11 8.5 11zm4-2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
        </svg>
        <span class="share-label">微博</span>
      </button>

      <!-- QQ 分享 -->
      <button @click="shareQQ" class="share-btn qq" :title="'QQ 分享'">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C7 2 3 6 3 11c0 2.5 1.5 4.5 3.5 5.5v2c0 .5.5 1 1 1h9c.5 0 1-.5 1-1v-2c2-1 3.5-3 3.5-5.5 0-5-4-9-9-9zm-3 8c-.8 0-1.5-.7-1.5-1.5S8.2 7 9 7s1.5.7 1.5 1.5S9.8 10 9 10zm6 0c-.8 0-1.5-.7-1.5-1.5S14.2 7 15 7s1.5.7 1.5 1.5S15.8 10 15 10z"/>
        </svg>
        <span class="share-label">QQ</span>
      </button>
    </div>

    <!-- 复制成功提示 -->
    <transition name="fade">
      <div v-if="showCopied" class="copied-toast">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>链接已复制</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showCopied = ref(false)

// 获取当前文章链接
const getCurrentUrl = () => {
  return window.location.origin + '/post/' + route.params.id
}

// 获取文章标题
const getTitle = () => {
  return document.title || '这篇文章'
}

// 复制链接
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(getCurrentUrl())
    showCopied.value = true
    setTimeout(() => {
      showCopied.value = false
    }, 2000)
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = getCurrentUrl()
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      showCopied.value = true
      setTimeout(() => {
        showCopied.value = false
      }, 2000)
    } catch (err2) {
      console.error('复制失败:', err2)
    }
    document.body.removeChild(textarea)
  }
}

// 微信分享
const shareWechat = () => {
  alert('请长按右上角选择"分享到朋友圈"或"发送给朋友"')
}

// 微博分享
const shareWeibo = () => {
  const url = getCurrentUrl()
  const title = getTitle()
  const shareUrl = `http://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

// QQ 分享
const shareQQ = () => {
  const url = getCurrentUrl()
  const title = getTitle()
  const shareUrl = `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  window.open(shareUrl, '_blank', 'width=600,height=400')
}
</script>

<style scoped>
.share-buttons {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.share-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.share-list {
  display: flex;
  gap: 12px;
}

.share-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: var(--card-bg);
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.share-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px var(--shadow-color);
}

.share-btn svg {
  width: 24px;
  height: 24px;
}

.share-label {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 各平台颜色 */
.share-btn.copy:hover {
  background: #667eea;
}

.share-btn.copy:hover svg,
.share-btn.copy:hover .share-label {
  color: white;
}

.share-btn.wechat:hover {
  background: #07c160;
}

.share-btn.wechat:hover svg,
.share-btn.wechat:hover .share-label {
  color: white;
}

.share-btn.weibo:hover {
  background: #e6162d;
}

.share-btn.weibo:hover svg,
.share-btn.weibo:hover .share-label {
  color: white;
}

.share-btn.qq:hover {
  background: #12b7f5;
}

.share-btn.qq:hover svg,
.share-btn.qq:hover .share-label {
  color: white;
}

/* 复制成功提示 */
.copied-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(102, 126, 234, 0.95);
  color: white;
  border-radius: 24px;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.copied-toast svg {
  width: 20px;
  height: 20px;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .share-list {
    justify-content: space-around;
  }

  .share-btn {
    padding: 8px 12px;
    flex: 1;
  }

  .share-btn svg {
    width: 20px;
    height: 20px;
  }

  .share-label {
    font-size: 11px;
  }

  .copied-toast {
    bottom: 80px;
    padding: 10px 20px;
    font-size: 13px;
  }
}
</style>
