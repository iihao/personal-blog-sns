<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-images"></i> 媒体库</h1>
    </div>
    <!-- 上传区域 -->
    <div class="upload-section">
      <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop" @click="fileInput && fileInput.click()">
        <i class="fas fa-cloud-upload-alt"></i>
        <p>拖拽文件到此处，或点击选择文件</p>
        <p class="upload-hint">支持图片、视频、音频、文档等所有常见格式，最大 50MB</p>
        <input ref="fileInput" type="file" @change="handleFileSelect" class="file-input" />
        <button class="btn-primary" @click.stop="fileInput && fileInput.click()">
          <i class="fas fa-upload"></i> 选择文件
        </button>
      </div>
    </div>

    <!-- 上传预览确认对话框 -->
    <div v-if="showPreviewDialog" class="dialog-overlay" @click="cancelUpload">
      <div class="preview-dialog" @click.stop>
        <div class="dialog-header">
          <h3><i class="fas fa-image"></i> 上传预览</h3>
          <button class="dialog-close" @click="cancelUpload">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="dialog-body">
          <div class="preview-content">
            <div class="preview-media">
              <!-- 图片预览 -->
              <img v-if="isImage" :src="previewUrl" :alt="previewFile?.name" class="preview-image" />
              <!-- 视频预览 -->
              <video v-else-if="isVideo" :src="previewUrl" controls class="preview-video"></video>
              <!-- 音频预览 -->
              <audio v-else-if="isAudio" :src="previewUrl" controls class="preview-audio"></audio>
              <!-- 文件图标 -->
              <div v-else class="file-icon-placeholder">
                <i :class="getFileIcon(previewFile?.type)"></i>
                <span class="file-type-label">{{ getFileTypeLabel(previewFile?.type) }}</span>
              </div>
            </div>
            <div class="preview-info">
              <div class="info-row">
                <label>文件名:</label>
                <span>{{ previewFile?.name }}</span>
              </div>
              <div class="info-row">
                <label>文件大小:</label>
                <span>{{ formatSize(previewFile?.size) }}</span>
              </div>
              <div class="info-row">
                <label>文件类型:</label>
                <span>{{ previewFile?.type || '未知' }}</span>
              </div>
              <div class="info-row" v-if="imageDimensions">
                <label>图片尺寸:</label>
                <span>{{ imageDimensions.width }} × {{ imageDimensions.height }} px</span>
              </div>
            </div>
          </div>
          <div v-if="uploading" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <div class="progress-text">
              <i class="fas fa-spinner fa-spin"></i> 
              {{ uploadProgress }}% - 正在上传到服务器...
            </div>
          </div>
        </div>
        <div class="dialog-footer" v-if="!uploading">
          <button class="btn-cancel" @click="cancelUpload">
            <i class="fas fa-times"></i> 取消
          </button>
          <button class="btn-confirm" @click="confirmUpload">
            <i class="fas fa-check"></i> 确认上传
          </button>
        </div>
      </div>
    </div>

    <!-- 媒体预览对话框（大图/视频/音频查看） -->
    <div v-if="showImageViewer" class="image-viewer-overlay" @click="closeImageViewer">
      <div class="image-viewer" @click.stop>
        <button class="viewer-close" @click="closeImageViewer">
          <i class="fas fa-times"></i>
        </button>
        <div class="viewer-content">
          <!-- 图片 -->
          <img v-if="currentImage?.type?.startsWith('image/')" :src="currentImage?.url" :alt="currentImage?.name" />
          <!-- 视频 -->
          <video v-else-if="currentImage?.type?.startsWith('video/')" :src="currentImage?.url" controls autoplay></video>
          <!-- 音频 -->
          <audio v-else-if="currentImage?.type?.startsWith('audio/')" :src="currentImage?.url" controls autoplay></audio>
          <!-- 其他文件 -->
          <div v-else class="file-preview-placeholder">
            <i :class="getMediaIcon(currentImage?.type)"></i>
            <p>{{ currentImage?.name }}</p>
          </div>
        </div>
        <div class="viewer-info">
          <h4>{{ currentImage?.name }}</h4>
          <p>{{ currentImage?.size }} {{ currentImage?.type ? '· ' + currentImage.type : '' }}</p>
          <div class="viewer-actions">
            <a :href="currentImage?.url" download class="btn-download">
              <i class="fas fa-download"></i> 下载
            </a>
            <button @click="copyUrl(currentImage?.url?.replace(window.location.origin, ''))" class="btn-copy">
              <i class="fas fa-copy"></i> 复制链接
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 媒体列表 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <i class="fas fa-images"></i>
          媒体文件 ({{ media.length }})
        </h2>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>加载中...</p>
        </div>
        <div v-else-if="media.length === 0" class="empty-state">
          <i class="fas fa-images"></i>
          <p>暂无媒体文件</p>
          <p class="empty-hint">上传你的第一张图片吧！</p>
        </div>
        <div v-else class="media-grid">
          <div v-for="item in media" :key="item.id" class="media-item">
            <!-- 根据文件类型显示不同内容 -->
            <div class="media-preview" @click="handleMediaClick(item)">
              <!-- 图片 -->
              <template v-if="isImageFile(item)">
                <img :src="getImageUrl(item)" :alt="item.original_name" @error="handleImageError" />
                <div class="preview-overlay">
                  <i class="fas fa-search-plus"></i>
                </div>
              </template>
              <!-- 视频 -->
              <template v-else-if="isVideoFile(item)">
                <div class="file-icon-wrapper">
                  <i class="fas fa-file-video"></i>
                  <span class="file-type-badge">视频</span>
                </div>
                <video :src="getImageUrl(item)" class="media-video-preview"></video>
                <div class="preview-overlay">
                  <i class="fas fa-play"></i>
                </div>
              </template>
              <!-- 音频 -->
              <template v-else-if="isAudioFile(item)">
                <div class="file-icon-wrapper">
                  <i class="fas fa-file-audio"></i>
                  <span class="file-type-badge">音频</span>
                </div>
                <div class="preview-overlay">
                  <i class="fas fa-play"></i>
                </div>
              </template>
              <!-- 其他文件 -->
              <template v-else>
                <div class="file-icon-wrapper">
                  <i :class="getMediaIcon(item.mime_type)"></i>
                  <span class="file-type-badge">{{ getMediaTypeLabel(item.mime_type) }}</span>
                </div>
              </template>
            </div>
            <div class="media-info">
              <div class="media-name" :title="item.original_name">{{ item.original_name }}</div>
              <div class="media-meta">{{ formatSize(item.file_size) }}</div>
            </div>
            <div class="media-actions">
              <button class="btn-icon" @click.stop="copyUrl(getImageUrl(item))" title="复制链接">
                <i class="fas fa-copy"></i>
              </button>
              <button class="btn-icon btn-danger" @click.stop="deleteMedia(item.id)" title="删除">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const media = ref([])
const loading = ref(true)
const fileInput = ref(null)

// 上传预览相关
const showPreviewDialog = ref(false)
const previewFile = ref(null)
const previewUrl = ref('')
const imageDimensions = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)

// 图片预览相关
const showImageViewer = ref(false)
const currentImage = ref(null)

// 文件类型判断
const isImage = computed(() => previewFile.value?.type?.startsWith('image/'))
const isVideo = computed(() => previewFile.value?.type?.startsWith('video/'))
const isAudio = computed(() => previewFile.value?.type?.startsWith('audio/'))

// 获取文件图标
const getFileIcon = (mimeType) => {
  if (!mimeType) return 'fas fa-file'
  if (mimeType.includes('pdf')) return 'fas fa-file-pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'fas fa-file-word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fas fa-file-excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fas fa-file-powerpoint'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'fas fa-file-archive'
  if (mimeType.includes('video')) return 'fas fa-file-video'
  if (mimeType.includes('audio')) return 'fas fa-file-audio'
  if (mimeType.includes('text')) return 'fas fa-file-alt'
  return 'fas fa-file'
}

// 获取文件类型标签
const getFileTypeLabel = (mimeType) => {
  if (!mimeType) return '未知文件'
  if (mimeType.startsWith('image/')) return '图片'
  if (mimeType.startsWith('video/')) return '视频'
  if (mimeType.startsWith('audio/')) return '音频'
  if (mimeType.includes('pdf')) return 'PDF 文档'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Word 文档'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Excel 表格'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'PPT 演示'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '压缩包'
  if (mimeType.startsWith('text/')) return '文本文件'
  return '其他文件'
}

// 判断文件类型
const isImageFile = (item) => item.mime_type?.startsWith('image/')
const isVideoFile = (item) => item.mime_type?.startsWith('video/')
const isAudioFile = (item) => item.mime_type?.startsWith('audio/')

// 获取媒体文件图标
const getMediaIcon = (mimeType) => {
  if (!mimeType) return 'fas fa-file'
  if (mimeType.includes('pdf')) return 'fas fa-file-pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'fas fa-file-word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fas fa-file-excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fas fa-file-powerpoint'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'fas fa-file-archive'
  if (mimeType.includes('video')) return 'fas fa-file-video'
  if (mimeType.includes('audio')) return 'fas fa-file-audio'
  if (mimeType.includes('text')) return 'fas fa-file-alt'
  return 'fas fa-file'
}

// 获取媒体类型标签
const getMediaTypeLabel = (mimeType) => {
  if (!mimeType) return '文件'
  if (mimeType.startsWith('image/')) return '图片'
  if (mimeType.startsWith('video/')) return '视频'
  if (mimeType.startsWith('audio/')) return '音频'
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('word') || mimeType.includes('document')) return '文档'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '表格'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '压缩包'
  return '文件'
}

// 处理媒体点击
const handleMediaClick = (item) => {
  if (isImageFile(item)) {
    viewImage(item)
  } else if (isVideoFile(item) || isAudioFile(item)) {
    viewMedia(item)
  }
}

// 查看媒体（视频/音频）
const viewMedia = (item) => {
  currentImage.value = {
    url: getImageUrl(item),
    name: item.original_name,
    size: formatSize(item.file_size),
    type: item.mime_type
  }
  showImageViewer.value = true
}

// 加载媒体
const loadMedia = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('blog_token')
    
    if (!token) {
      console.error('[Media] Token 不存在，请重新登录')
      showToast('请先登录', 'error')
      return
    }
    
    console.log('[Media] 加载媒体列表，token 长度:', token.length)
    
    const res = await fetch('/api/media', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (res.status === 401) {
      console.error('[Media] Token 无效或已过期')
      showToast('登录已过期，请重新登录', 'error')
      localStorage.removeItem('blog_token')
      localStorage.removeItem('blog_user')
      window.location.href = '/login?redirect=' + encodeURIComponent('/admin/media')
      return
    }
    
    if (res.status === 403) {
      console.error('[Media] 权限不足')
      showToast('权限不足', 'error')
      window.location.href = '/forbidden'
      return
    }
    
    const data = await res.json()
    console.log('[Media] 加载成功，文件数量:', data.media?.length || 0)
    media.value = data.media || []
  } catch (error) {
    console.error('[Media] 加载媒体失败:', error)
    showToast('加载媒体失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

// 处理文件选择
const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) showPreview(file)
}

// 处理拖拽
const handleDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file) showPreview(file)
}

// 显示预览
const showPreview = (file) => {
  // 验证文件大小（50MB）
  if (file.size > 50 * 1024 * 1024) {
    showToast('文件大小不能超过 50MB', 'error')
    return
  }
  
  previewFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  imageDimensions.value = null
  
  // 如果是图片，加载尺寸
  if (file.type.startsWith('image/')) {
    const img = new Image()
    img.onload = () => {
      imageDimensions.value = {
        width: img.width,
        height: img.height
      }
    }
    img.onerror = () => {
      console.error('图片加载失败')
    }
    img.src = previewUrl.value
  }
  
  showPreviewDialog.value = true
}

// 取消上传
const cancelUpload = () => {
  // 关闭预览对话框
  showPreviewDialog.value = false
  
  // 释放 URL 对象
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  
  // 清空预览数据
  previewFile.value = null
  imageDimensions.value = null
  uploading.value = false
  uploadProgress.value = 0
  
  // 清空 input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  
  console.log('上传预览已关闭')
}

// 获取图片 URL（修复路径问题）
const getImageUrl = (item) => {
  // 优先使用完整 URL
  if (item.url && item.url.startsWith('http')) {
    return item.url
  }
  
  // 使用相对路径
  const path = item.url || item.file_path
  if (!path) return ''
  
  // 确保路径以 / 开头
  return path.startsWith('/') ? path : '/' + path
}

// 查看图片（大图预览）
const viewImage = (item) => {
  currentImage.value = {
    url: getImageUrl(item),
    name: item.original_name,
    size: formatSize(item.file_size)
  }
  showImageViewer.value = true
}

// 关闭图片预览
const closeImageViewer = () => {
  showImageViewer.value = false
  currentImage.value = null
}

// 处理图片加载错误
const handleImageError = (e) => {
  console.error('图片加载失败:', e.target.src)
  // 可以尝试重新加载或显示错误图标
}

// 确认上传
const confirmUpload = async () => {
  if (!previewFile.value) return
  
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    const formData = new FormData()
    formData.append('file', previewFile.value)
    
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    })
    
    // 上传完成
    xhr.addEventListener('load', () => {
      uploading.value = false
      
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        showToast('文件上传成功！', 'success')
        loadMedia()
        // 确保关闭预览对话框
        cancelUpload()
      } else {
        const errorData = JSON.parse(xhr.responseText)
        showToast(`上传失败：${errorData.error || '未知错误'}`, 'error')
        uploading.value = false
      }
    })
    
    // 上传错误
    xhr.addEventListener('error', () => {
      uploading.value = false
      showToast('网络错误，上传失败', 'error')
    })
    
    xhr.open('POST', '/api/media/upload')
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('blog_token')}`)
    xhr.send(formData)
    
  } catch (error) {
    uploading.value = false
    console.error('上传失败:', error)
    showToast(`上传失败：${error.message}`, 'error')
  }
}

// 上传文件（兼容旧代码）
const uploadFile = async (file) => {
  showPreview(file)
}

// 格式化大小
const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 复制链接
const copyUrl = (filePath) => {
  const url = window.location.origin + filePath
  navigator.clipboard.writeText(url).then(() => {
    showToast('链接已复制到剪贴板', 'success')
  }).catch(() => {
    showToast('复制失败，请手动复制', 'error')
  })
}

// 删除媒体
const deleteMedia = async (id) => {
  if (!confirm('确定要删除这个文件吗？')) return
  
  try {
    const res = await fetch(`/api/media/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('blog_token')}`
      }
    })
    
    if (res.ok) {
      showToast('文件删除成功！', 'success')
      loadMedia()
    } else {
      const errorData = await res.json()
      throw new Error(errorData.error || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    showToast(`删除失败：${error.message}`, 'error')
  }
}

onMounted(() => {
  loadMedia()
})
</script>

<style scoped>
.upload-section {
  margin-bottom: 24px;
}

.upload-area {
  background: white;
  border: 2px dashed #e0e0e0;
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-area:hover,
.upload-area.dragover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-area i {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 16px;
}

.upload-area p {
  margin: 8px 0;
  color: #1d1d1f;
  font-weight: 500;
}

.upload-hint {
  font-size: 13px;
  color: #86868b !important;
  font-weight: 400 !important;
}

.file-input {
  display: none;
}

.btn-primary {
  margin-top: 16px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-body {
  padding: 24px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
}

.loading-state i, .empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-hint {
  font-size: 14px;
  color: #86868b;
  margin-top: 8px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.media-item {
  background: #f5f5f7;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  position: relative;
}

.media-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.media-preview {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.media-item:hover .media-preview img {
  transform: scale(1.05);
}

/* 媒体预览样式 */
.preview-media {
  flex: 1;
  max-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  background: #f5f5f7;
  padding: 20px;
}

.preview-video,
.preview-audio {
  max-width: 100%;
  max-height: 100%;
}

.file-icon-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #666;
}

.file-icon-placeholder i {
  font-size: 80px;
  color: #667eea;
}

.file-type-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 媒体网格中的文件图标 */
.file-icon-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;
}

.file-icon-wrapper i {
  font-size: 64px;
  color: #667eea;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.file-type-badge {
  background: rgba(102, 126, 234, 0.9);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.media-video-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
}

/* 文件预览占位符 */
.file-preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #666;
  padding: 40px;
}

.file-preview-placeholder i {
  font-size: 100px;
  color: #667eea;
}

.file-preview-placeholder p {
  font-size: 16px;
  color: #999;
}

.media-info {
  padding: 12px;
}

.media-name {
  font-weight: 600;
  font-size: 13px;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.media-meta {
  font-size: 12px;
  color: #86868b;
}

.media-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.media-item:hover .media-actions {
  opacity: 1;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  transition: all 0.2s;
}

.btn-icon:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.btn-icon.btn-danger:hover {
  border-color: #ff3b30;
  color: #ff3b30;
  background: rgba(255, 59, 48, 0.05);
}

/* 响应式 - 移动端优化 */
@media (max-width: 768px) {
  .upload-area {
    padding: 32px 20px;
  }
  
  .upload-area i {
    font-size: 40px;
  }
  
  .upload-area p {
    font-size: 14px;
  }
  
  .upload-hint {
    font-size: 12px;
  }
  
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
  
  .media-item {
    border-radius: 10px;
  }
  
  .media-preview {
    height: 120px;
  }
  
  .media-info {
    padding: 10px;
  }
  
  .media-name {
    font-size: 12px;
  }
  
  .media-meta {
    font-size: 11px;
  }
  
  .media-actions {
    opacity: 1;
    position: static;
    display: flex;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e0e0e0;
  }
  
  .media-actions .btn-icon {
    flex: 1;
    width: auto;
    height: 36px;
    font-size: 13px;
  }
  
  .media-actions .btn-icon i {
    margin-right: 4px;
  }
  
  .card-header {
    padding: 16px;
  }
  
  .card-title {
    font-size: 16px;
  }
  
  .card-body {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .upload-area {
    padding: 24px 16px;
  }
  
  .upload-area i {
    font-size: 36px;
  }
  
  .media-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .media-preview {
    height: 100px;
  }
  
  .media-name {
    font-size: 11px;
  }
  
  .media-meta {
    font-size: 10px;
  }
  
  .media-actions .btn-icon {
    height: 32px;
    font-size: 12px;
    padding: 0;
    justify-content: center;
  }
  
  .page-header {
    margin-bottom: 16px;
  }
  
  .page-title {
    font-size: 18px;
  }
}

/* 横屏模式优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
  
  .media-preview {
    height: 100px;
  }
}

/* 预览对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.preview-dialog {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dialog-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  transition: all 0.2s;
}

.dialog-close:hover {
  border-color: #ff3b30;
  color: #ff3b30;
  background: rgba(255, 59, 48, 0.05);
}

.dialog-body {
  padding: 24px;
}

.preview-content {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.preview-image {
  flex: 0 0 200px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.info-row label {
  font-weight: 600;
  color: #86868b;
  font-size: 13px;
  min-width: 70px;
  flex-shrink: 0;
}

.info-row span {
  color: #1d1d1f;
  font-size: 14px;
  word-break: break-all;
}

.upload-progress {
  margin-top: 20px;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  text-align: center;
  font-size: 13px;
  color: #86868b;
  font-weight: 500;
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel, .btn-confirm {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f5f5f7;
  color: #86868b;
}

.btn-cancel:hover {
  background: #e0e0e0;
  color: #1d1d1f;
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* 响应式 - 对话框 */
@media (max-width: 768px) {
  .dialog-overlay {
    padding: 16px;
    align-items: flex-end;
  }
  
  .preview-dialog {
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    animation: slideUpMobile 0.3s ease-out;
  }
  
  @keyframes slideUpMobile {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .preview-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .preview-image {
    flex: none;
    width: 100%;
    height: 240px;
  }
  
  .dialog-header {
    padding: 16px 20px;
  }
  
  .dialog-body {
    padding: 20px;
  }
  
  .dialog-footer {
    padding: 16px 20px;
    flex-direction: column-reverse;
  }
  
  .btn-cancel, .btn-confirm {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
  }
}

/* ===== 图片预览对话框 ===== */
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

.image-viewer {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #1d1d1f;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.viewer-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  z-index: 10;
  transition: all 0.2s;
}

.viewer-close:hover {
  border-color: white;
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.viewer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 70vh;
  padding: 20px;
}

.viewer-content img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.viewer-info {
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.viewer-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.viewer-info p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.viewer-actions {
  display: flex;
  gap: 12px;
}

.btn-download, .btn-copy {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  text-decoration: none;
  border: none;
}

.btn-download {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-copy {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-copy:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

/* 响应式 - 图片预览 */
@media (max-width: 768px) {
  .image-viewer-overlay {
    padding: 0;
  }
  
  .image-viewer {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .viewer-content {
    max-height: 60vh;
  }
  
  .viewer-info {
    padding: 16px;
  }
  
  .viewer-actions {
    flex-direction: column;
  }
  
  .btn-download, .btn-copy {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .preview-image {
    height: 200px;
  }
  
  .info-row {
    flex-direction: column;
    gap: 4px;
  }
  
  .info-row label {
    min-width: auto;
  }
}
</style>