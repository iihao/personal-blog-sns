<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 pb-[56px]">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 safe-area-top">
      <div class="px-4 py-3">
        <h1 class="text-lg font-bold text-white">💰 我的钱包</h1>
      </div>
    </header>

    <main class="px-4 py-4 space-y-4">
      <!-- 余额卡片 -->
      <div class="bg-white rounded-2xl p-4 shadow-lg">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500 mb-1">可用余额</p>
            <p class="text-2xl font-bold text-gray-900">¥{{ wallet.balance?.toFixed(2) || '0.00' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">积分</p>
            <p class="text-2xl font-bold text-amber-500">{{ wallet.points?.toFixed(0) || '0' }}</p>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="grid grid-cols-4 gap-2">
        <button @click="showRecharge = true" class="flex flex-col items-center p-3 bg-white rounded-xl shadow touch-feedback">
          <i class="fas fa-plus-circle text-2xl text-emerald-500 mb-1"></i>
          <span class="text-xs text-gray-700">充值</span>
        </button>
        <button @click="showExchange = true" class="flex flex-col items-center p-3 bg-white rounded-xl shadow touch-feedback">
          <i class="fas fa-exchange-alt text-2xl text-amber-500 mb-1"></i>
          <span class="text-xs text-gray-700">兑换</span>
        </button>
        <button @click="activeTab = 'records'" class="flex flex-col items-center p-3 bg-white rounded-xl shadow touch-feedback">
          <i class="fas fa-list text-2xl text-blue-500 mb-1"></i>
          <span class="text-xs text-gray-700">明细</span>
        </button>
        <button @click="loadWallet" class="flex flex-col items-center p-3 bg-white rounded-xl shadow touch-feedback">
          <i class="fas fa-sync text-2xl text-gray-500 mb-1"></i>
          <span class="text-xs text-gray-700">刷新</span>
        </button>
      </div>

      <!-- 选项卡 -->
      <div class="flex bg-white rounded-xl p-1 shadow">
        <button 
          :class="['flex-1 py-2 text-sm font-medium rounded-lg', activeTab === 'overview' ? 'bg-emerald-500 text-white' : 'text-gray-600']"
          @click="activeTab = 'overview'"
        >
          概览
        </button>
        <button 
          :class="['flex-1 py-2 text-sm font-medium rounded-lg', activeTab === 'records' ? 'bg-emerald-500 text-white' : 'text-gray-600']"
          @click="activeTab = 'records'"
        >
          记录
        </button>
      </div>

      <!-- 概览 -->
      <div v-if="activeTab === 'overview'" class="space-y-4">
        <!-- 快速充值 -->
        <div class="bg-white rounded-2xl p-4 shadow-lg">
          <h3 class="font-bold text-gray-900 mb-3">📥 快速充值</h3>
          <div class="grid grid-cols-4 gap-2 mb-3">
            <button 
              v-for="amount in [10, 50, 100, 500]" 
              :key="amount"
              @click="rechargeAmount = amount"
              :class="['py-2 rounded-lg text-sm font-medium', rechargeAmount === amount ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700']"
            >
              ¥{{ amount }}
            </button>
          </div>
          <input 
            v-model="rechargeAmount" 
            type="number" 
            placeholder="自定义金额"
            class="w-full p-3 border-2 border-gray-200 rounded-xl mb-3"
          />
          <button @click="doRecharge" class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold touch-feedback">
            立即充值
          </button>
        </div>

        <!-- 积分兑换 -->
        <div class="bg-white rounded-2xl p-4 shadow-lg">
          <h3 class="font-bold text-gray-900 mb-3">🔄 积分兑换</h3>
          <p class="text-sm text-gray-500 mb-2">兑换比例：{{ config.points_rate }} 积分 = ¥1</p>
          <input 
            v-model="exchangePoints" 
            type="number" 
            placeholder="输入积分数量"
            :max="wallet.points"
            class="w-full p-3 border-2 border-gray-200 rounded-xl mb-2"
          />
          <p class="text-sm text-emerald-600 mb-3">可兑换 ¥{{ (exchangePoints / config.points_rate).toFixed(2) }}</p>
          <button @click="doExchange" class="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold touch-feedback">
            确认兑换
          </button>
        </div>
      </div>

      <!-- 交易记录 -->
      <div v-if="activeTab === 'records'" class="bg-white rounded-2xl p-4 shadow-lg">
        <h3 class="font-bold text-gray-900 mb-3">📝 交易记录</h3>
        <div class="space-y-2">
          <div 
            v-for="tx in transactions" 
            :key="tx.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
          >
            <div>
              <p class="font-medium text-gray-900">{{ getTypeName(tx.type) }}</p>
              <p class="text-xs text-gray-500">{{ formatTime(tx.created_at) }}</p>
            </div>
            <div class="text-right">
              <p :class="['font-bold', tx.type === 'recharge' || tx.type === 'bonus' ? 'text-emerald-600' : 'text-red-600']">
                {{ tx.type === 'recharge' || tx.type === 'bonus' ? '+' : '-' }}{{ formatAmount(tx.amount, tx.type) }}
              </p>
              <p class="text-xs text-gray-500">余额 ¥{{ tx.balance_after?.toFixed(2) }}</p>
            </div>
          </div>
          <div v-if="transactions.length === 0" class="text-center py-8 text-gray-500">
            暂无交易记录
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <TabBar />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TabBar from '../components/TabBar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const wallet = ref({ balance: 0, points: 0 })
const config = ref({ points_rate: '1' })
const transactions = ref([])
const activeTab = ref('overview')
const showRecharge = ref(false)
const showExchange = ref(false)
const rechargeAmount = ref(null)
const exchangePoints = ref(null)

const loadWallet = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const [walletRes, configRes] = await Promise.all([
      fetch('/api/wallet/balance', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/wallet/config')
    ])

    const walletData = await walletRes.json()
    const configData = await configRes.json()

    if (walletData.success) wallet.value = walletData.data
    if (configData.success) config.value = configData.data
  } catch (error) {
    console.error('加载失败:', error)
  }
}

const loadTransactions = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/wallet/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) transactions.value = data.data.transactions
  } catch (error) {
    console.error('加载失败:', error)
  }
}

const doRecharge = async () => {
  if (!rechargeAmount.value || rechargeAmount.value < 1) {
    alert('请输入有效金额')
    return
  }
  showRecharge.value = true
}

const confirmRecharge = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/wallet/recharge', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: parseFloat(rechargeAmount.value) })
    })
    const data = await res.json()
    if (data.success) {
      const confirmRes = await fetch('/api/wallet/recharge/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderNo: data.data.orderNo })
      })
      const confirmData = await confirmRes.json()
      if (confirmData.success) {
        alert(`充值成功！获得 ¥${confirmData.data.amount} + ${confirmData.data.points} 积分`)
        showRecharge.value = false
        rechargeAmount.value = null
        loadWallet()
        loadTransactions()
      }
    }
  } catch (error) {
    alert('充值失败')
  }
}

const doExchange = async () => {
  if (!exchangePoints.value || exchangePoints.value <= 0) {
    alert('请输入有效积分')
    return
  }
  if (exchangePoints.value > wallet.value.points) {
    alert('积分不足')
    return
  }
  showExchange.value = true
}

const confirmExchange = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/wallet/points/exchange', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ points: parseInt(exchangePoints.value) })
    })
    const data = await res.json()
    if (data.success) {
      alert(`兑换成功！获得 ¥${data.data.amount}`)
      showExchange.value = false
      exchangePoints.value = null
      loadWallet()
      loadTransactions()
    }
  } catch (error) {
    alert('兑换失败')
  }
}

const getTypeName = (type) => {
  const names = { recharge: '充值', consume: '消费', checkin: '签到', bonus: '奖励', exchange: '兑换' }
  return names[type] || type
}

const formatAmount = (amount, type) => {
  return type.includes('points') ? `${amount.toFixed(0)} 积分` : `¥${amount.toFixed(2)}`
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadWallet()
  loadTransactions()
})
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.95); }
</style>
