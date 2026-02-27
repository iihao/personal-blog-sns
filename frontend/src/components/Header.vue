<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="container mx-auto px-4 py-4 max-w-4xl flex justify-between items-center">
      <h1 class="text-xl font-bold text-gray-800">
        <router-link to="/" class="hover:text-blue-600 transition-colors">
          blog.sqlboy.top
        </router-link>
      </h1>
      <nav>
        <router-link 
          to="/admin" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          管理后台
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
</style>