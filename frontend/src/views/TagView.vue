<template>
  <div class="tag-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <i class="fas fa-tag"></i>
          标签：#{{ tagName }}
        </h1>
        <p class="page-subtitle">共 {{ posts.length }} 篇文章</p>
      </div>
      <router-link to="/" class="back-btn">
        <i class="fas fa-arrow-left"></i> 返回首页
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-container">
      <div class="loading-spinner"></div>
      <p class="state-text">正在加载文章...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="posts.length === 0" class="state-container">
      <div class="empty-illustration">🏷️</div>
      <h2 class="state-title">该标签下暂无文章</h2>
      <p class="state-description">博主正在努力创作中，敬请期待...</p>
    </div>

    <!-- Posts List -->
    <div v-else class="posts-list">
      <article 
        v-for="post in posts" 
        :key="post.id" 
        class="post-card card"
      >
        <div class="post-card-header">
          <span v-if="post.category" class="post-category">
            <i class="fas fa-folder"></i> {{ post.category }}
          </span>
          <span class="post-date">
            <i class="fas fa-calendar"></i> {{ formatDate(post.created_at) }}
          </span>
        </div>

        <div class="post-card-body">
          <h2 class="post-title">
            <router-link :to="`/post/${post.id}`" class="title-link">
              {{ post.title }}
            </router-link>
          </h2>

          <div class="post-meta">
            <span class="meta-item">
              <i class="fas fa-user"></i>
              {{ post.author || 'Admin' }}
            </span>
          </div>

          <div class="post-tags" v-if="post.tags">
            <span 
              v-for="tag in post.tags.split(',').slice(0, 5)" 
              :key="tag" 
              class="tag"
              :class="{ 'tag-active': tag.trim() === tagName }"
            >
              #{{ tag.trim() }}
            </span>
          </div>

          <p class="post-excerpt" v-html="stripHtml(post.content).substring(0, 200) + '...'"></p>
        </div>

        <div class="post-card-footer">
          <router-link :to="`/post/${post.id}`" class="read-more-link">
            阅读全文
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePostStore } from '../store'

const route = useRoute()
const postStore = usePostStore()

const tagName = computed(() => route.params.name)
const posts = computed(() => postStore.posts)
const loading = computed(() => postStore.loading)

const fetchPosts = async () => {
  await postStore.fetchPosts(1, 20, '', 'published', '', tagName.value)
}

onMounted(fetchPosts)

// Watch for tag changes
watch(() => route.params.name, fetchPosts)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const stripHtml = (html) => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}
</script>

<style scoped>
.tag-page {
  padding: 2rem 0;
  min-height: 60vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 0.75rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
}

/* State Containers */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-illustration {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.state-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.state-description {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Posts List */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Post Card */
.post-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.post-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.post-category {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-primary);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.post-date {
  color: var(--text-secondary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.post-card-body {
  padding: 1.5rem;
}

.post-title {
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

.title-link {
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.title-link:hover {
  color: var(--accent-primary);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 1rem;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.tag-active {
  background: var(--accent-primary);
  color: white;
}

.post-excerpt {
  color: var(--text-secondary);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.read-more-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.read-more-link:hover {
  gap: 0.75rem;
  color: var(--accent-secondary);
}

/* Dark Mode */
:global(.dark) .post-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}
</style>
