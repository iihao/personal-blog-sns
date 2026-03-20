<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="px-4 py-3 flex items-center gap-3">
        <button @click="$router.back()" class="p-2">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="flex-1 text-base font-semibold text-gray-900">钱包配置</h1>
      </div>
    </header>

    <main class="px-4 py-4 space-y-4">
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h2 class="font-bold text-gray-900 mb-4">充值设置</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-sm text-gray-700 mb-2">充值开关</label>
            <select v-model="config.recharge_enabled" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
              <option value="true">开启</option>
              <option value="false">关闭</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-2">最低充值金额</label>
            <input v-model="config.min_recharge" type="number" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-2">最高充值金额</label>
            <input v-model="config.max_recharge" type="number" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h2 class="font-bold text-gray-900 mb-4">积分设置</h2>
        <div class="space-y-3">
          <div>
            <label class="block text-sm text-gray-700 mb-2">积分兑换比例</label>
            <input v-model="config.points_rate" type="number" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
            <p class="text-xs text-gray-500 mt-1">{{ config.points_rate }} 积分 = ¥1</p>
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-2">充值赠送比例</label>
            <input v-model="config.recharge_bonus_rate" type="number" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
            <p class="text-xs text-gray-500 mt-1">充值赠送 {{ config.recharge_bonus_rate }}%</p>
          </div>
        </div>
      </div>

      <button @click="saveConfig" class="w-full py-3 bg-blue-500 text-white rounded-xl font-bold">
        保存配置
      </button>
    </main>

    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TabBar from '../components/TabBar.vue'

const config = ref({
  recharge_enabled: 'true',
  min_recharge: '1',
  max_recharge: '10000',
  points_rate: '1',
  recharge_bonus_rate: '0'
})

const loadConfig = async () => {
  try {
    const res = await fetch('/api/wallet/config')
    const data = await res.json()
    if (data.success) {
      config.value = data.data
    }
  } catch (err) {
    console.error('加载配置失败:', err)
  }
}

const saveConfig = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/wallet/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(config.value)
    })
    const data = await res.json()
    if (data.success) {
      alert('保存成功')
    } else {
      alert('保存失败')
    }
  } catch (err) {
    alert('保存失败，请重试')
  }
}

onMounted(() => {
  loadConfig()
})
</script>
