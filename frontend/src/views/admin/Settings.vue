<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-cog"></i> 网站设置</h1>
      <p class="page-subtitle">管理网站的所有配置信息</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>加载设置中...</p>
    </div>

    <!-- 设置分类导航 -->
    <div v-else class="settings-nav">
      <button
        v-for="cat in categories"
        :key="cat.id"
        :class="['nav-item', { active: currentTab === cat.id }]"
        @click="currentTab = cat.id"
      >
        <i :class="cat.icon"></i>
        <span>{{ cat.name }}</span>
      </button>
    </div>

    <!-- 设置内容 -->
    <div v-if="!loading" class="settings-content">
      <!-- 基本信息 -->
      <div v-show="currentTab === 'basic'" class="settings-panel">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-info-circle"></i> 基本信息</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">网站标题</label>
              <input v-model="settings.site_title" type="text" class="form-input" placeholder="我的个人博客" />
              <div class="form-hint">显示在浏览器标题栏和搜索引擎结果中</div>
            </div>

            <div class="form-group">
              <label class="form-label">网站描述</label>
              <textarea v-model="settings.site_description" class="form-textarea" rows="3" placeholder="一个现代化的个人博客平台"></textarea>
              <div class="form-hint">网站的简短描述，用于 SEO</div>
            </div>

            <div class="form-group">
              <label class="form-label">网站关键词</label>
              <input v-model="settings.site_keywords" type="text" class="form-input" placeholder="博客，技术，分享" />
              <div class="form-hint">多个关键词用逗号分隔</div>
            </div>

            <div class="form-group">
              <label class="form-label">网站 Logo</label>
              <div class="image-upload-section">
                <div v-if="settings.site_logo" class="image-preview">
                  <img :src="settings.site_logo" alt="Logo" />
                </div>
                <div class="image-upload-actions">
                  <input v-model="settings.site_logo" type="text" class="form-input" placeholder="输入图片 URL 或点击上传" />
                  <button @click="uploadImage('site_logo')" class="btn-secondary" :disabled="uploading">
                    <i class="fas fa-upload"></i> {{ uploading ? '上传中...' : '上传图片' }}
                  </button>
                  <button v-if="settings.site_logo" @click="settings.site_logo = ''" class="btn-danger-outline">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">网站 Favicon</label>
              <div class="image-upload-section">
                <div v-if="settings.site_favicon" class="image-preview favicon-preview">
                  <img :src="settings.site_favicon" alt="Favicon" />
                </div>
                <div class="image-upload-actions">
                  <input v-model="settings.site_favicon" type="text" class="form-input" placeholder="输入图片 URL" />
                  <button @click="uploadImage('site_favicon')" class="btn-secondary" :disabled="uploading">
                    <i class="fas fa-upload"></i> 上传
                  </button>
                  <button v-if="settings.site_favicon" @click="settings.site_favicon = ''" class="btn-danger-outline">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <div class="form-hint">建议尺寸 32x32px 或 64x64px 的 ICO 或 PNG 格式</div>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn-primary" @click="saveCategory('basic')">
                <i class="fas fa-save"></i> 保存基本信息
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 作者信息 -->
      <div v-show="currentTab === 'author'" class="settings-panel">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-user"></i> 作者信息</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">作者名称</label>
              <input v-model="settings.author_name" type="text" class="form-input" placeholder="显示在文章中的作者名" />
            </div>

            <div class="form-group">
              <label class="form-label">作者简介</label>
              <textarea v-model="settings.author_bio" class="form-textarea" rows="4" placeholder="简短的自我介绍"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">作者头像</label>
              <div class="image-upload-section">
                <div v-if="settings.author_avatar" class="image-preview avatar-preview">
                  <img :src="settings.author_avatar" alt="Avatar" />
                </div>
                <div class="image-upload-actions">
                  <input v-model="settings.author_avatar" type="text" class="form-input" placeholder="输入头像 URL" />
                  <button @click="uploadImage('author_avatar')" class="btn-secondary" :disabled="uploading">
                    <i class="fas fa-upload"></i> 上传头像
                  </button>
                  <button v-if="settings.author_avatar" @click="settings.author_avatar = ''" class="btn-danger-outline">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn-primary" @click="saveCategory('author')">
                <i class="fas fa-save"></i> 保存作者信息
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系方式 -->
      <div v-show="currentTab === 'contact'" class="settings-panel">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-envelope"></i> 联系方式</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">联系邮箱</label>
              <input v-model="settings.contact_email" type="email" class="form-input" placeholder="your@email.com" />
            </div>

            <div class="form-group">
              <label class="form-label">微信二维码</label>
              <div class="image-upload-section">
                <div v-if="settings.contact_wechat" class="image-preview qr-preview">
                  <img :src="settings.contact_wechat" alt="微信二维码" />
                </div>
                <div class="image-upload-actions">
                  <input v-model="settings.contact_wechat" type="text" class="form-input" placeholder="输入二维码图片 URL" />
                  <button @click="uploadImage('contact_wechat')" class="btn-secondary" :disabled="uploading">
                    <i class="fas fa-upload"></i> 上传二维码
                  </button>
                  <button v-if="settings.contact_wechat" @click="settings.contact_wechat = ''" class="btn-danger-outline">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">QQ 号</label>
              <input v-model="settings.contact_qq" type="text" class="form-input" placeholder="你的 QQ 号" />
            </div>

            <div class="form-group">
              <label class="form-label">Telegram</label>
              <input v-model="settings.contact_telegram" type="text" class="form-input" placeholder="@username" />
            </div>

            <div class="form-group">
              <label class="form-label">Twitter</label>
              <input v-model="settings.contact_twitter" type="text" class="form-input" placeholder="@username" />
            </div>

            <div class="form-actions">
              <button class="btn-primary" @click="saveCategory('contact')">
                <i class="fas fa-save"></i> 保存联系方式
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 社交链接 -->
      <div v-show="currentTab === 'social'" class="settings-panel">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-share-alt"></i> 社交链接</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">
                <i class="fab fa-github"></i> GitHub
              </label>
              <input v-model="settings.social_github" type="url" class="form-input" placeholder="https://github.com/yourname" />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fab fa-weibo"></i> 微博
              </label>
              <input v-model="settings.social_weibo" type="url" class="form-input" placeholder="https://weibo.com/yourname" />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fab fa-zhihu"></i> 知乎
              </label>
              <input v-model="settings.social_zhihu" type="url" class="form-input" placeholder="https://www.zhihu.com/people/yourname" />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-layer-group"></i> 掘金
              </label>
              <input v-model="settings.social_juejin" type="url" class="form-input" placeholder="https://juejin.im/user/xxx" />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-code"></i> CSDN
              </label>
              <input v-model="settings.social_csdn" type="url" class="form-input" placeholder="https://blog.csdn.net/yourname" />
            </div>

            <div class="form-actions">
              <button class="btn-primary" @click="saveCategory('social')">
                <i class="fas fa-save"></i> 保存社交链接
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 备案信息 -->
      <div v-show="currentTab === 'license'" class="settings-panel">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-certificate"></i> 备案信息</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">ICP 备案号</label>
              <input v-model="settings.icp_license" type="text" class="form-input" placeholder="京 ICP 备 XXXXXXXX 号" />
            </div>

            <div class="form-group">
              <label class="form-label">ICP 备案链接</label>
              <input v-model="settings.icp_license_url" type="url" class="form-input" placeholder="https://beian.miit.gov.cn/" />
            </div>

            <div class="form-group">
              <label class="form-label">公安备案号</label>
              <input v-model="settings.gongan_license" type="text" class="form-input" placeholder="京公网安备 XXXXXXXXXXXX 号" />
            </div>

            <div class="form-group">
              <label class="form-label">公安备案链接</label>
              <input v-model="settings.gongan_license_url" type="url" class="form-input" placeholder="http://www.beian.gov.cn/" />
            </div>

            <div class="form-actions">
              <button class="btn-primary" @click="saveCategory('license')">
                <i class="fas fa-save"></i> 保存备案信息
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计设置 -->
      <div v-show="currentTab === 'analytics'" class="settings-panel">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-chart-line"></i> 统计设置</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">
                <input v-model="settings.analytics_enabled" type="checkbox" class="form-checkbox" />
                启用统计代码
              </label>
            </div>

            <div class="form-group">
              <label class="form-label">统计代码</label>
              <textarea v-model="settings.analytics_code" class="form-textarea" rows="6" placeholder="<!-- Google Analytics 或其他统计代码 -->"></textarea>
              <div class="form-hint">粘贴 Google Analytics、百度统计等提供的统计代码</div>
            </div>

            <div class="form-actions">
              <button class="btn-primary" @click="saveCategory('analytics')">
                <i class="fas fa-save"></i> 保存统计设置
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero 设置 -->
      <div v-show="currentTab === 'hero'" class="settings-panel">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-image"></i> Hero 区域设置</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">
                <input v-model="settings.hero_enabled" type="checkbox" class="form-checkbox" />
                显示 Hero 区域
              </label>
              <div class="form-hint">取消勾选将隐藏首页顶部的 Hero 区域</div>
            </div>

            <div class="form-group">
              <label class="form-label">Hero 高度</label>
              <input v-model.number="settings.hero_height" type="number" class="form-input" min="200" max="800" step="10" placeholder="400" />
              <div class="form-hint">Hero 区域的高度，单位像素（建议 200-800px）</div>
            </div>

            <div class="form-group">
              <label class="form-label">Hero 背景图片</label>
              <div class="image-upload-section">
                <div v-if="settings.hero_background" class="image-preview">
                  <img :src="settings.hero_background" alt="Hero 背景" />
                </div>
                <div class="image-upload-actions">
                  <input v-model="settings.hero_background" type="text" class="form-input" placeholder="输入图片 URL 或点击上传" />
                  <button @click="uploadImage('hero_background')" class="btn-secondary" :disabled="uploading">
                    <i class="fas fa-upload"></i> {{ uploading ? '上传中...' : '上传图片' }}
                  </button>
                  <button v-if="settings.hero_background" @click="settings.hero_background = ''" class="btn-danger-outline">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <div class="form-hint">建议使用高质量图片，尺寸至少 1920x600px</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Hero 标题</label>
              <input v-model="settings.hero_title" type="text" class="form-input" placeholder="留空则使用网站标题" />
              <div class="form-hint">自定义 Hero 区域的标题，留空则使用网站标题</div>
            </div>

            <div class="form-group">
              <label class="form-label">Hero 描述</label>
              <textarea v-model="settings.hero_description" class="form-textarea" rows="3" placeholder="留空则使用网站描述"></textarea>
              <div class="form-hint">自定义 Hero 区域的描述文字，留空则使用网站描述</div>
            </div>

            <div class="form-actions">
              <button class="btn-primary" @click="saveCategory('hero')">
                <i class="fas fa-save"></i> 保存 Hero 设置
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 高级设置 -->
      <div v-show="currentTab === 'advanced'" class="settings-panel">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-cogs"></i> 高级设置</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">每页文章数</label>
              <input v-model="settings.posts_per_page" type="number" class="form-input" min="5" max="50" />
            </div>

            <div class="form-group">
              <label class="form-label">
                <input v-model="settings.allow_comments" type="checkbox" class="form-checkbox" />
                允许评论
              </label>
            </div>

            <div class="form-group">
              <label class="form-label">
                <input v-model="settings.comment_audit" type="checkbox" class="form-checkbox" />
                评论需要审核
              </label>
            </div>

            <div class="form-actions">
              <button class="btn-primary" @click="saveCategory('advanced')">
                <i class="fas fa-save"></i> 保存高级设置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMediaStore } from '../../store'

const mediaStore = useMediaStore()
const loading = ref(true)
const uploading = ref(false)
const currentTab = ref('basic')
const settings = ref({})

const categories = [
  { id: 'basic', name: '基本信息', icon: 'fas fa-info-circle' },
  { id: 'author', name: '作者信息', icon: 'fas fa-user' },
  { id: 'contact', name: '联系方式', icon: 'fas fa-envelope' },
  { id: 'social', name: '社交链接', icon: 'fas fa-share-alt' },
  { id: 'license', name: '备案信息', icon: 'fas fa-certificate' },
  { id: 'analytics', name: '统计设置', icon: 'fas fa-chart-line' },
  { id: 'hero', name: 'Hero 设置', icon: 'fas fa-image' },
  { id: 'advanced', name: '高级设置', icon: 'fas fa-cogs' }
]

const categorySettings = {
  basic: ['site_title', 'site_description', 'site_keywords', 'site_logo', 'site_favicon'],
  author: ['author_name', 'author_bio', 'author_avatar'],
  contact: ['contact_email', 'contact_wechat', 'contact_qq', 'contact_telegram', 'contact_twitter'],
  social: ['social_github', 'social_weibo', 'social_zhihu', 'social_juejin', 'social_csdn'],
  license: ['icp_license', 'icp_license_url', 'gongan_license', 'gongan_license_url'],
  analytics: ['analytics_code', 'analytics_enabled'],
  hero: ['hero_enabled', 'hero_background', 'hero_height', 'hero_title', 'hero_description'],
  advanced: ['posts_per_page', 'allow_comments', 'comment_audit']
}

const fetchSettings = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/settings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      }
    })
    const data = await response.json()
    
    Object.entries(data.settings).forEach(([key, value]) => {
      settings.value[key] = value.value === '1' ? true : value.value === '0' ? false : value.value
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    showToast('加载设置失败', 'error')
  } finally {
    loading.value = false
  }
}

const saveCategory = async (category) => {
  try {
    const keys = categorySettings[category]
    const updates = {}
    
    keys.forEach(key => {
      let value = settings.value[key]
      // 转换 checkbox 值
      if (typeof value === 'boolean') {
        value = value ? '1' : '0'
      }
      updates[key] = value
    })
    
    const response = await fetch('/api/settings/batch', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      },
      body: JSON.stringify(updates)
    })
    
    if (response.ok) {
      showToast(`${categories.find(c => c.id === category)?.name}已保存`, 'success')
    } else {
      throw new Error('保存失败')
    }
  } catch (error) {
    console.error('Error saving settings:', error)
    showToast('保存失败', 'error')
  }
}

const uploadImage = async (settingKey) => {
  try {
    uploading.value = true
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
        },
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        settings.value[settingKey] = data.file_path
        showToast('图片上传成功', 'success')
      } else {
        throw new Error('上传失败')
      }
    }
    
    input.click()
  } catch (error) {
    console.error('Error uploading image:', error)
    showToast('图片上传失败', 'error')
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.admin-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-subtitle {
  color: var(--text-secondary);
  margin-top: 8px;
}

.settings-nav {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  background: var(--card-bg);
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.nav-item {
  padding: 12px 20px;
  background: transparent;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.nav-item.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.settings-content {
  max-width: 900px;
}

.card {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.9375rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  margin-top: 6px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.form-checkbox {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.image-upload-section {
  margin-top: 8px;
}

.image-preview {
  margin-bottom: 12px;
  border-radius: 10px;
  overflow: hidden;
  max-width: 300px;
  border: 1px solid var(--border-color);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.favicon-preview {
  max-width: 100px;
}

.avatar-preview {
  max-width: 150px;
  border-radius: 50%;
}

.qr-preview {
  max-width: 200px;
}

.image-upload-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.image-upload-actions .form-input {
  flex: 1;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-state i {
  font-size: 32px;
  margin-bottom: 12px;
}

.form-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

/* 响应式 */
@media (max-width: 768px) {
  .settings-nav {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
  
  .nav-item {
    white-space: nowrap;
  }
  
  .image-upload-actions {
    flex-direction: column;
  }
  
  .image-upload-actions .form-input {
    width: 100%;
  }
}
</style>
