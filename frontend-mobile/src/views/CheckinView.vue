<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 pb-[56px]">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 safe-area-top">
      <div class="px-4 py-3">
        <h1 class="text-lg font-bold text-white">📅 每日签到</h1>
      </div>
    </header>

    <main class="px-4 py-4 space-y-4">
      <!-- 用户信息卡片 -->
      <div v-if="userInfo" class="bg-white rounded-2xl p-4 shadow-lg">
        <div class="flex items-center gap-4 mb-4">
          <div class="text-5xl text-purple-500">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-bold text-gray-900">{{ userInfo.username }}</h2>
            <div class="flex gap-4 mt-1 text-sm text-gray-600">
              <span>总签到：<strong class="text-purple-600">{{ userInfo.totalCheckins }}</strong> 天</span>
              <span>连续：<strong class="text-purple-600">{{ userInfo.currentStreak }}</strong> 天</span>
            </div>
          </div>
        </div>

        <!-- 签到按钮 -->
        <button 
          v-if="!userInfo.checkedInToday" 
          @click="doCheckin" 
          class="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-bold text-lg touch-feedback shadow-lg"
          :disabled="isCheckingIn"
        >
          <span v-if="!isCheckingIn">
            <i class="fas fa-calendar-check mr-2"></i>立即签到
          </span>
          <span v-else>
            <i class="fas fa-circle-notch fa-spin mr-2"></i>签到中...
          </span>
        </button>

        <div v-else class="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold text-lg text-center shadow-lg">
          <i class="fas fa-check-circle mr-2"></i>今日已签到
          <span class="ml-2 font-bold">+{{ userInfo.todayPoints }} 积分</span>
        </div>
      </div>

      <!-- 本月日历 -->
      <div class="bg-white rounded-2xl p-4 shadow-lg">
        <h3 class="font-bold text-gray-900 mb-3">📆 本月签到</h3>
        <div class="flex items-center justify-between mb-3">
          <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded-full touch-feedback">
            <i class="fas fa-chevron-left text-gray-600"></i>
          </button>
          <span class="font-bold text-gray-900">{{ calendarYear }}年{{ calendarMonth }}月</span>
          <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-full touch-feedback">
            <i class="fas fa-chevron-right text-gray-600"></i>
          </button>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div v-for="day in weekDays" :key="day" class="text-center text-xs font-bold text-gray-500 py-2">
            {{ day }}
          </div>
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            class="aspect-square flex flex-col items-center justify-center rounded-lg text-sm"
            :class="{
              'bg-gray-100': !day,
              'bg-gradient-to-br from-purple-500 to-indigo-600 text-white': day?.checkedIn,
              'bg-gray-50 text-gray-900': day && !day.checkedIn
            }"
          >
            <span class="font-bold">{{ day?.day || '' }}</span>
            <span v-if="day?.checkedIn" class="text-xs mt-0.5">
              <i class="fas fa-check"></i>
            </span>
          </div>
        </div>
      </div>

      <!-- 最近记录 -->
      <div class="bg-white rounded-2xl p-4 shadow-lg">
        <h3 class="font-bold text-gray-900 mb-3">📝 最近记录</h3>
        <div class="space-y-2">
          <div 
            v-for="record in recentCheckins" 
            :key="record.date"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
          >
            <div class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-calendar-day text-purple-500"></i>
              <span class="text-sm">{{ formatDate(record.date) }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-orange-500">🔥 {{ record.streak }}天</span>
              <span class="text-sm font-bold text-green-600">+{{ record.points }}</span>
            </div>
          </div>
          <div v-if="recentCheckins.length === 0" class="text-center py-8 text-gray-500">
            暂无签到记录
          </div>
        </div>
      </div>

      <!-- 排行榜 -->
      <div class="bg-white rounded-2xl p-4 shadow-lg">
        <h3 class="font-bold text-gray-900 mb-3">🏆 排行榜</h3>
        <div class="space-y-2">
          <div 
            v-for="(user, index) in leaderboard.slice(0, 10)" 
            :key="user.id"
            class="flex items-center gap-3 p-3 rounded-xl"
            :class="index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'"
          >
            <div class="w-8 text-center font-bold">
              <span v-if="index === 0" class="text-2xl">🥇</span>
              <span v-else-if="index === 1" class="text-2xl">🥈</span>
              <span v-else-if="index === 2" class="text-2xl">🥉</span>
              <span v-else class="text-gray-500">{{ index + 1 }}</span>
            </div>
            <div class="text-2xl text-purple-500">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="flex-1">
              <div class="font-bold text-gray-900">{{ user.username }}</div>
              <div class="text-xs text-gray-500">总签到 {{ user.total_checkins }} 天</div>
            </div>
            <div class="text-sm font-bold text-purple-600">
              🔥 {{ user.current_streak }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <TabBar />

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import TabBar from '../components/TabBar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userInfo = ref(null)
const isCheckingIn = ref(false)
const calendarData = ref(null)
const recentCheckins = ref([])
const leaderboard = ref([])
const currentCalendarDate = ref(new Date())

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const calendarYear = computed(() => currentCalendarDate.value.getFullYear())
const calendarMonth = computed(() => currentCalendarDate.value.getMonth() + 1)

const calendarDays = computed(() => {
  if (!calendarData.value) return []
  return calendarData.value.calendar
})

// 加载签到状态
const loadCheckinStatus = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    const res = await fetch('/api/checkin/status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const data = await res.json()
    if (data.success) {
      userInfo.value = data.data
      recentCheckins.value = data.data.recentCheckins || []
    }
  } catch (error) {
    console.error('加载签到状态失败:', error)
  }
}

// 执行签到
const doCheckin = async () => {
  if (isCheckingIn.value) return
  
  isCheckingIn.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/checkin/do', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await res.json()
    if (data.success) {
      alert(`签到成功！获得 ${data.data.points} 积分，连续签到 ${data.data.streak} 天！`)
      await loadCheckinStatus()
    } else {
      alert(data.message || data.error || '签到失败')
    }
  } catch (error) {
    console.error('签到失败:', error)
    alert('签到失败，请重试')
  } finally {
    isCheckingIn.value = false
  }
}

// 加载日历
const loadCalendar = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/checkin/calendar', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const data = await res.json()
    if (data.success) {
      calendarData.value = data.data
    }
  } catch (error) {
    console.error('加载日历失败:', error)
  }
}

// 加载排行榜
const loadLeaderboard = async () => {
  try {
    const res = await fetch('/api/checkin/leaderboard')
    const data = await res.json()
    if (data.success) {
      leaderboard.value = data.data
    }
  } catch (error) {
    console.error('加载排行榜失败:', error)
  }
}

// 切换月份
const prevMonth = () => {
  currentCalendarDate.value = new Date(
    currentCalendarDate.value.getFullYear(),
    currentCalendarDate.value.getMonth() - 1,
    1
  )
  loadCalendar()
}

const nextMonth = () => {
  currentCalendarDate.value = new Date(
    currentCalendarDate.value.getFullYear(),
    currentCalendarDate.value.getMonth() + 1,
    1
  )
  loadCalendar()
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return '今天'
  }
  
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (diff < 48 * 60 * 60 * 1000 && date.getDate() === yesterday.getDate()) {
    return '昨天'
  }
  
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

onMounted(() => {
  loadCheckinStatus()
  loadCalendar()
  loadLeaderboard()
})
</script>

<style scoped>
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.touch-feedback {
  transition: transform 0.1s;
}

.touch-feedback:active {
  transform: scale(0.95);
}
</style>
