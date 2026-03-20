<template>
  <div class="checkin-page">
    <div class="checkin-container">
      <!-- 头部 -->
      <div class="checkin-header">
        <h1>📅 每日签到</h1>
        <p>坚持签到，赢取积分奖励！</p>
      </div>

      <!-- 签到卡片 -->
      <div class="checkin-card" v-if="userInfo">
        <div class="user-info">
          <div class="avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="user-details">
            <h3>{{ userInfo.username }}</h3>
            <p class="stats">
              <span>总签到：<strong>{{ userInfo.totalCheckins }}</strong> 天</span>
              <span>连续签到：<strong>{{ userInfo.currentStreak }}</strong> 天</span>
            </p>
          </div>
        </div>

        <div class="checkin-action">
          <button 
            v-if="!userInfo.checkedInToday" 
            @click="doCheckin" 
            class="checkin-btn"
            :disabled="isCheckingIn"
          >
            <i v-if="!isCheckingIn" class="fas fa-calendar-check"></i>
            <i v-else class="fas fa-circle-notch fa-spin"></i>
            {{ isCheckingIn ? '签到中...' : '立即签到' }}
          </button>
          <div v-else class="checked-in-badge">
            <i class="fas fa-check-circle"></i>
            <span>今日已签到</span>
            <span class="points">+{{ userInfo.todayPoints }} 积分</span>
          </div>
        </div>
      </div>

      <!-- 签到日历 -->
      <div class="checkin-calendar">
        <h3>📆 本月签到记录</h3>
        <div class="calendar-header">
          <button @click="prevMonth" class="calendar-nav">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="calendar-title">{{ calendarYear }}年{{ calendarMonth }}月</span>
          <button @click="nextMonth" class="calendar-nav">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="calendar-grid">
          <div class="calendar-weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            class="calendar-day"
            :class="{ 
              'empty': !day, 
              'checked-in': day?.checkedIn,
              'today': isToday(day?.date)
            }"
          >
            <span class="day-number">{{ day?.day || '' }}</span>
            <span v-if="day?.checkedIn" class="checkin-indicator">
              <i class="fas fa-check"></i>
            </span>
            <span v-if="day?.checkedIn" class="day-points">+{{ day.points }}</span>
          </div>
        </div>
      </div>

      <!-- 最近签到记录 -->
      <div class="recent-checkins">
        <h3>📝 最近签到记录</h3>
        <div class="checkin-list">
          <div 
            v-for="record in recentCheckins" 
            :key="record.date"
            class="checkin-item"
          >
            <div class="checkin-date">
              <i class="fas fa-calendar-day"></i>
              <span>{{ formatDate(record.date) }}</span>
            </div>
            <div class="checkin-info">
              <span class="streak">🔥 连续 {{ record.streak }} 天</span>
              <span class="points">+{{ record.points }} 积分</span>
            </div>
          </div>
          <div v-if="recentCheckins.length === 0" class="no-data">
            暂无签到记录
          </div>
        </div>
      </div>

      <!-- 签到排行榜 -->
      <div class="leaderboard">
        <h3>🏆 签到排行榜</h3>
        <div class="leaderboard-list">
          <div 
            v-for="(user, index) in leaderboard" 
            :key="user.id"
            class="leaderboard-item"
            :class="{ 'top-3': index < 3 }"
          >
            <div class="rank">
              <span v-if="index === 0" class="rank-icon">🥇</span>
              <span v-else-if="index === 1" class="rank-icon">🥈</span>
              <span v-else-if="index === 2" class="rank-icon">🥉</span>
              <span v-else class="rank-number">{{ index + 1 }}</span>
            </div>
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-info">
              <span class="username">{{ user.username }}</span>
              <span class="stats">总签到 {{ user.total_checkins }} 天 · 连续 {{ user.current_streak }} 天</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'CheckinView',
  setup() {
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
    
    // 判断是否是今天
    const isToday = (dateStr) => {
      if (!dateStr) return false
      const today = new Date().toISOString().split('T')[0]
      return dateStr === today
    }
    
    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const now = new Date()
      const diff = now - date
      
      // 今天
      if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return '今天'
      }
      
      // 昨天
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (diff < 48 * 60 * 60 * 1000 && date.getDate() === yesterday.getDate()) {
        return '昨天'
      }
      
      // 其他日期
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
    
    onMounted(() => {
      loadCheckinStatus()
      loadCalendar()
      loadLeaderboard()
    })
    
    return {
      userInfo,
      isCheckingIn,
      doCheckin,
      weekDays,
      calendarYear,
      calendarMonth,
      calendarDays,
      recentCheckins,
      leaderboard,
      prevMonth,
      nextMonth,
      isToday,
      formatDate
    }
  }
}
</script>

<style scoped>
.checkin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.checkin-container {
  max-width: 800px;
  margin: 0 auto;
}

.checkin-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.checkin-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.checkin-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.checkin-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.avatar {
  font-size: 4rem;
  color: #667eea;
}

.user-details h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.stats {
  display: flex;
  gap: 1.5rem;
  color: #666;
}

.stats strong {
  color: #667eea;
}

.checkin-action {
  text-align: center;
}

.checkin-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.checkin-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.checkin-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.checked-in-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
}

.points {
  font-weight: bold;
  font-size: 1.2rem;
}

.checkin-calendar,
.recent-checkins,
.leaderboard {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.checkin-calendar h3,
.recent-checkins h3,
.leaderboard h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-nav {
  background: #f0f0f0;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.calendar-nav:hover {
  background: #e0e0e0;
}

.calendar-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-weekday {
  text-align: center;
  font-weight: bold;
  color: #666;
  padding: 0.5rem;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f8f9fa;
  position: relative;
  font-size: 0.9rem;
}

.calendar-day.empty {
  background: transparent;
}

.calendar-day.checked-in {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.calendar-day.today {
  border: 2px solid #667eea;
}

.day-number {
  font-weight: bold;
}

.checkin-indicator {
  font-size: 0.7rem;
  margin-top: 0.2rem;
}

.day-points {
  font-size: 0.6rem;
  opacity: 0.8;
}

.checkin-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.checkin-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.checkin-info {
  display: flex;
  gap: 1rem;
}

.streak {
  color: #ff6b6b;
}

.points {
  color: #51cf66;
  font-weight: bold;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background 0.2s;
}

.leaderboard-item:hover {
  background: #e9ecef;
}

.leaderboard-item.top-3 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%);
}

.rank {
  width: 30px;
  text-align: center;
  font-weight: bold;
}

.rank-icon {
  font-size: 1.5rem;
}

.rank-number {
  font-size: 1.2rem;
  color: #666;
}

.user-avatar {
  font-size: 2rem;
  color: #667eea;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: bold;
  color: #333;
}

.stats {
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 768px) {
  .checkin-header h1 {
    font-size: 2rem;
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
  }
  
  .stats {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .checkin-calendar,
  .recent-checkins,
  .leaderboard {
    padding: 1.5rem;
  }
}
</style>
