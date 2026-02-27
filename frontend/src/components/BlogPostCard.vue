<template>
  <article class="blog-post-card">
    <router-link :to="`/post/${post.id}`" class="card-link"></router-link>
    
    <div class="card-header">
      <h2 class="card-title">{{ post.title }}</h2>
      <div class="card-meta">
        <span class="meta-author">
          <i class="fas fa-user"></i> {{ post.author || 'Admin' }}
        </span>
        <span class="meta-date">
          <i class="fas fa-calendar"></i> {{ formatDate(post.created_at) }}
        </span>
        <span v-if="readTime" class="meta-read-time">
          <i class="fas fa-clock"></i> {{ readTime }} 分钟
        </span>
      </div>
    </div>

    <div class="card-badges">
      <span v-if="post.category" class="badge-category">
        <i class="fas fa-folder"></i> {{ post.category }}
      </span>
      <div v-if="post.tags" class="badge-tags">
        <span v-for="tag in post.tags.split(',').slice(0, 3)" :key="tag" class="badge-tag">
          #{{ tag.trim() }}
        </span>
      </div>
    </div>

    <div class="card-excerpt" v-html="excerpt"></div>

    <div class="card-footer">
      <span class="read-more">
        阅读全文 <i class="fas fa-arrow-right"></i>
      </span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const readTime = computed(() => {
  if (!props.post.content) return 0
  const text = props.post.content.replace(/<[^>]*>/g, '')
  return Math.ceil(text.length / 300) || 1
})

const excerpt = computed(() => {
  if (!props.post.content) return ''
  const text = props.post.content.replace(/<[^>]*>/g, '')
  return text.substring(0, 200) + '...'
})
</script>

<style scoped>
.blog-post-card {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.blog-post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px var(--shadow-color);
  border-color: var(--accent-primary);
}

.card-link {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.card-header {
  margin-bottom: 16px;
}

.card-title {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px;
  line-height: 1.3;
  transition: color 0.2s ease;
}

.blog-post-card:hover .card-title {
  color: var(--accent-primary);
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.card-meta i {
  color: var(--accent-primary);
  margin-right: 4px;
}

.card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.badge-category {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-primary);
  border-radius: 16px;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.badge-category:hover {
  background: rgba(124, 58, 237, 0.15);
}

.badge-tags {
  display: flex;
  gap: 8px;
}

.badge-tag {
  padding: 4px 10px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: 12px;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.badge-tag:hover {
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-primary);
}

.card-excerpt {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 0.95rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.95rem;
  transition: gap 0.2s ease;
}

.blog-post-card:hover .read-more {
  gap: 12px;
}

/* 响应式 */
@media (max-width: 640px) {
  .blog-post-card {
    padding: 20px;
  }

  .card-title {
    font-size: 1.25rem;
  }

  .card-meta {
    gap: 12px;
  }
}
</style>
