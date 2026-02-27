<template>
  <article class="blog-post">
    <h2 class="post-title">{{ post.title }}</h2>
    <div class="post-meta">
      <time :datetime="post.created_at">{{ formatDate(post.created_at) }}</time>
      <span v-if="post.author" class="post-author">by {{ post.author }}</span>
    </div>
    <div class="post-content" v-html="post.content"></div>
    <div class="post-tags" v-if="post.tags && post.tags.length">
      <span 
        v-for="tag in post.tags" 
        :key="tag" 
        class="tag"
      >
        #{{ tag }}
      </span>
    </div>
  </article>
</template>

<script setup>
import { defineProps } from 'vue'

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
</script>

<style scoped>
.blog-post {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.blog-post:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.post-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
  line-height: 1.3;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 24px;
}

.post-content {
  line-height: 1.7;
  color: #374151;
  font-size: 16px;
}

.post-content :deep(p) {
  margin-bottom: 16px;
}

.post-content :deep(a) {
  color: #3b82f6;
  text-decoration: none;
}

.post-content :deep(a):hover {
  text-decoration: underline;
}

.post-tags {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
</style>