<template>
  <div class="min-h-screen bg-gray-50 safe-area-top safe-area-bottom">
    <router-view />
  </div>
</template>

<script setup>
import { useSEO } from './composables/useSEO'

// 初始化 SEO
useSEO()
</script>

<style>
/* 全局样式在 main.css 中 */
</style>
