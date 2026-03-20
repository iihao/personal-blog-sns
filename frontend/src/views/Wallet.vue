<template>
  <div class="wallet-page">
    <div class="wallet-container">
      <!-- 头部 -->
      <div class="wallet-header">
        <h1>💰 我的钱包</h1>
        <p>管理您的余额和积分</p>
      </div>

      <!-- 钱包概览 -->
      <div class="wallet-overview">
        <div class="balance-card">
          <div class="balance-item">
            <span class="label">可用余额</span>
            <span class="amount">¥{{ wallet.balance?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="balance-item">
            <span class="label">积分</span>
            <span class="amount points">{{ wallet.points?.toFixed(0) || '0' }}</span>
          </div>
          <div class="balance-item" v-if="wallet.frozenBalance > 0">
            <span class="label">冻结金额</span>
            <span class="amount frozen">¥{{ wallet.frozenBalance?.toFixed(2) || '0.00' }}</span>
          </div>
        </div>

        <div class="quick-actions">
          <button @click="showRecharge = true" class="action-btn recharge">
            <i class="fas fa-plus-circle"></i>
            <span>充值</span>
          </button>
          <button @click="showExchange = true" class="action-btn exchange">
            <i class="fas fa-exchange-alt"></i>
            <span>积分兑换</span>
          </button>
          <button @click="showWithdraw = true" class="action-btn withdraw" :disabled="!config.withdraw_enabled">
            <i class="fas fa-credit-card"></i>
            <span>提现</span>
          </button>
          <button @click="activeTab = 'records'" class="action-btn records">
            <i class="fas fa-list"></i>
            <span>明细</span>
          </button>
        </div>
      </div>

      <!-- 选项卡 -->
      <div class="wallet-tabs">
        <button 
          :class="['tab', activeTab === 'overview' ? 'active' : '']"
          @click="activeTab = 'overview'"
        >
          概览
        </button>
        <button 
          :class="['tab', activeTab === 'records' ? 'active' : '']"
          @click="activeTab = 'records'"
        >
          交易记录
        </button>
        <button 
          :class="['tab', activeTab === 'recharge' ? 'active' : '']"
          @click="activeTab = 'recharge'"
        >
          充值记录
        </button>
      </div>

      <!-- 概览内容 -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <!-- 充值入口 -->
        <div class="recharge-section">
          <h3>📥 快速充值</h3>
          <div class="recharge-amounts">
            <button 
              v-for="amount in [10, 50, 100, 500]" 
              :key="amount"
              @click="rechargeAmount = amount"
              :class="['amount-btn', rechargeAmount === amount ? 'selected' : '']"
            >
              ¥{{ amount }}
            </button>
            <div class="custom-amount">
              <input 
                v-model="rechargeAmount" 
                type="number" 
                placeholder="自定义金额"
                :min="config.min_recharge"
                :max="config.max_recharge"
              />
            </div>
          </div>
          <button @click="doRecharge" class="recharge-btn">
            立即充值
          </button>
        </div>

        <!-- 积分兑换 -->
        <div class="exchange-section">
          <h3>🔄 积分兑换余额</h3>
          <p class="exchange-rate">兑换比例：{{ config.points_rate }} 积分 = ¥1</p>
          <div class="exchange-input">
            <input 
              v-model="exchangePoints" 
              type="number" 
              placeholder="输入积分数量"
              :max="wallet.points"
            />
            <span class="will-get">可兑换 ¥{{ (exchangePoints / config.points_rate).toFixed(2) }}</span>
          </div>
          <button @click="doExchange" class="exchange-btn">
            确认兑换
          </button>
        </div>
      </div>

      <!-- 交易记录 -->
      <div v-if="activeTab === 'records'" class="tab-content">
        <div class="filter-bar">
          <select v-model="filterType" @change="loadTransactions">
            <option value="">全部类型</option>
            <option value="recharge">充值</option>
            <option value="consume">消费</option>
            <option value="checkin">签到</option>
            <option value="bonus">奖励</option>
            <option value="exchange">兑换</option>
          </select>
        </div>
        <div class="transaction-list">
          <div 
            v-for="tx in transactions" 
            :key="tx.id"
            class="transaction-item"
          >
            <div class="tx-info">
              <span class="tx-type" :class="tx.type">{{ getTypeName(tx.type) }}</span>
              <span class="tx-time">{{ formatTime(tx.created_at) }}</span>
            </div>
            <div class="tx-amount" :class="tx.type">
              {{ tx.type === 'recharge' || tx.type === 'bonus' || tx.type === 'exchange' ? '+' : '-' }}
              {{ formatAmount(tx.amount, tx.type) }}
            </div>
            <div class="tx-balance">
              余额：¥{{ tx.balance_after?.toFixed(2) }}
            </div>
          </div>
          <div v-if="transactions.length === 0" class="no-data">
            暂无交易记录
          </div>
        </div>
      </div>

      <!-- 充值记录 -->
      <div v-if="activeTab === 'recharge'" class="tab-content">
        <div class="recharge-list">
          <div 
            v-for="order in rechargeOrders" 
            :key="order.id"
            class="recharge-item"
          >
            <div class="order-info">
              <span class="order-no">订单号：{{ order.order_no }}</span>
              <span class="order-time">{{ formatTime(order.created_at) }}</span>
            </div>
            <div class="order-amount">¥{{ order.amount }}</div>
            <div class="order-points">+{{ order.points }} 积分</div>
            <div class="order-status" :class="order.status">
              {{ getStatusName(order.status) }}
            </div>
          </div>
          <div v-if="rechargeOrders.length === 0" class="no-data">
            暂无充值记录
          </div>
        </div>
      </div>

      <!-- 充值弹窗 -->
      <div v-if="showRecharge" class="modal-overlay" @click="showRecharge = false">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>充值钱包</h3>
            <button @click="showRecharge = false" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <div class="payment-methods">
              <button 
                v-for="method in ['alipay', 'wechat', 'bank']" 
                :key="method"
                :class="['method-btn', paymentMethod === method ? 'selected' : '']"
                @click="paymentMethod = method"
              >
                <i :class="getMethodIcon(method)"></i>
                <span>{{ getMethodName(method) }}</span>
              </button>
            </div>
            <div class="amount-input">
              <label>充值金额</label>
              <input 
                v-model="rechargeAmount" 
                type="number" 
                :min="config.min_recharge"
                :max="config.max_recharge"
                placeholder="请输入金额"
              />
            </div>
            <div class="recharge-summary">
              <p>将获得：¥{{ rechargeAmount }} + {{ rechargeAmount * config.points_rate }} 积分</p>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showRecharge = false" class="cancel-btn">取消</button>
            <button @click="confirmRecharge" class="confirm-btn">确认充值</button>
          </div>
        </div>
      </div>

      <!-- 积分兑换弹窗 -->
      <div v-if="showExchange" class="modal-overlay" @click="showExchange = false">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>积分兑换余额</h3>
            <button @click="showExchange = false" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <p class="current-points">当前积分：{{ wallet.points }}</p>
            <div class="amount-input">
              <label>兑换积分</label>
              <input 
                v-model="exchangePoints" 
                type="number" 
                :max="wallet.points"
                placeholder="请输入积分数量"
              />
            </div>
            <div class="exchange-summary">
              <p>将获得：¥{{ (exchangePoints / config.points_rate).toFixed(2) }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showExchange = false" class="cancel-btn">取消</button>
            <button @click="confirmExchange" class="confirm-btn">确认兑换</button>
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
  name: 'WalletView',
  setup() {
    const router = useRouter()
    
    const wallet = ref({ balance: 0, points: 0, frozenBalance: 0 })
    const config = ref({ 
      recharge_enabled: 'true', 
      withdraw_enabled: 'false',
      min_recharge: '1',
      max_recharge: '10000',
      points_rate: '1'
    })
    const transactions = ref([])
    const rechargeOrders = ref([])
    const activeTab = ref('overview')
    const filterType = ref('')
    const showRecharge = ref(false)
    const showExchange = ref(false)
    const rechargeAmount = ref(null)
    const exchangePoints = ref(null)
    const paymentMethod = ref('alipay')
    const isLoading = ref(false)

    // 加载钱包信息
    const loadWallet = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const [walletRes, configRes] = await Promise.all([
          fetch('/api/wallet/balance', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/wallet/config')
        ])

        const walletData = await walletRes.json()
        const configData = await configRes.json()

        if (walletData.success) {
          wallet.value = walletData.data
        }
        if (configData.success) {
          config.value = configData.data
        }
      } catch (error) {
        console.error('加载钱包失败:', error)
      }
    }

    // 加载交易记录
    const loadTransactions = async () => {
      try {
        const token = localStorage.getItem('token')
        const url = filterType.value 
          ? `/api/wallet/transactions?type=${filterType.value}`
          : '/api/wallet/transactions'
        
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          transactions.value = data.data.transactions
        }
      } catch (error) {
        console.error('加载交易记录失败:', error)
      }
    }

    // 加载充值记录
    const loadRechargeOrders = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/wallet/recharge/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          rechargeOrders.value = data.data.orders
        }
      } catch (error) {
        console.error('加载充值记录失败:', error)
      }
    }

    // 执行充值
    const doRecharge = async () => {
      if (!rechargeAmount.value || rechargeAmount.value < config.value.min_recharge) {
        alert('请输入有效的充值金额')
        return
      }
      showRecharge.value = true
    }

    // 确认充值
    const confirmRecharge = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/wallet/recharge', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: parseFloat(rechargeAmount.value),
            paymentMethod: paymentMethod.value
          })
        })
        const data = await res.json()
        if (data.success) {
          // 模拟支付成功
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
        console.error('充值失败:', error)
        alert('充值失败，请重试')
      }
    }

    // 执行积分兑换
    const doExchange = async () => {
      if (!exchangePoints.value || exchangePoints.value <= 0) {
        alert('请输入有效的积分数量')
        return
      }
      if (exchangePoints.value > wallet.value.points) {
        alert('积分不足')
        return
      }
      showExchange.value = true
    }

    // 确认兑换
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
        console.error('兑换失败:', error)
        alert('兑换失败，请重试')
      }
    }

    const getTypeName = (type) => {
      const names = {
        recharge: '充值',
        consume: '消费',
        checkin: '签到',
        bonus: '奖励',
        exchange: '兑换',
        points_earn: '积分收入',
        points_use: '积分消费',
        withdraw: '提现',
        refund: '退款',
        adjust: '调整'
      }
      return names[type] || type
    }

    const formatAmount = (amount, type) => {
      if (type.includes('points')) {
        return `${amount.toFixed(0)} 积分`
      }
      return `¥${amount.toFixed(2)}`
    }

    const formatTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      return date.toLocaleString('zh-CN')
    }

    const getMethodIcon = (method) => {
      const icons = {
        alipay: 'fab fa-alipay',
        wechat: 'fab fa-weixin',
        bank: 'fas fa-university'
      }
      return icons[method] || 'fas fa-credit-card'
    }

    const getMethodName = (method) => {
      const names = {
        alipay: '支付宝',
        wechat: '微信支付',
        bank: '银行卡'
      }
      return names[method] || method
    }

    const getStatusName = (status) => {
      const names = {
        pending: '待支付',
        completed: '已完成',
        cancelled: '已取消',
        failed: '失败'
      }
      return names[status] || status
    }

    onMounted(() => {
      loadWallet()
      loadTransactions()
      loadRechargeOrders()
    })

    return {
      wallet,
      config,
      transactions,
      rechargeOrders,
      activeTab,
      filterType,
      showRecharge,
      showExchange,
      rechargeAmount,
      exchangePoints,
      paymentMethod,
      doRecharge,
      confirmRecharge,
      doExchange,
      confirmExchange,
      loadTransactions,
      getTypeName,
      formatAmount,
      formatTime,
      getMethodIcon,
      getMethodName,
      getStatusName
    }
  }
}
</script>

<style scoped>
.wallet-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 1rem;
}

.wallet-container {
  max-width: 800px;
  margin: 0 auto;
}

.wallet-header {
  text-align: center;
  margin-bottom: 2rem;
}

.wallet-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.wallet-overview {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.balance-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.balance-item {
  display: flex;
  flex-direction: column;
}

.balance-item .label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.balance-item .amount {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.balance-item .amount.points {
  color: #f59e0b;
}

.balance-item .amount.frozen {
  color: #ef4444;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-btn i {
  font-size: 1.5rem;
}

.action-btn.recharge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.action-btn.exchange {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.action-btn.withdraw {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.action-btn.withdraw:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.records {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.wallet-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tab {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.tab.active {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.tab-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.recharge-section,
.exchange-section {
  margin-bottom: 2rem;
}

.recharge-section h3,
.exchange-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.recharge-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.amount-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.amount-btn.selected {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.custom-amount input {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  width: 150px;
}

.recharge-btn,
.exchange-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.recharge-btn:hover,
.exchange-btn:hover {
  transform: translateY(-2px);
}

.exchange-rate {
  color: #666;
  margin-bottom: 1rem;
}

.exchange-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.exchange-input input {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
}

.will-get {
  color: #10b981;
  font-weight: 500;
}

.filter-bar select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  width: 100%;
  margin-bottom: 1rem;
}

.transaction-list,
.recharge-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item,
.recharge-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.tx-info,
.order-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.tx-type,
.order-no {
  font-weight: 500;
}

.tx-type.recharge,
.tx-type.bonus,
.tx-type.exchange {
  color: #10b981;
}

.tx-type.consume {
  color: #ef4444;
}

.tx-time,
.order-time {
  color: #666;
  font-size: 0.9rem;
}

.tx-amount,
.order-amount {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.tx-amount.recharge,
.tx-amount.bonus,
.tx-amount.exchange {
  color: #10b981;
}

.tx-amount.consume {
  color: #ef4444;
}

.tx-balance,
.order-points,
.order-status {
  font-size: 0.9rem;
  color: #666;
}

.order-status.completed {
  color: #10b981;
}

.order-status.pending {
  color: #f59e0b;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 2rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.payment-methods {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.method-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
}

.method-btn.selected {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.amount-input {
  margin-bottom: 1rem;
}

.amount-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.amount-input input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
}

.recharge-summary,
.exchange-summary {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn {
  background: #f3f4f6;
  border: none;
}

.confirm-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
}

@media (max-width: 768px) {
  .wallet-header h1 {
    font-size: 2rem;
  }
  
  .balance-item .amount {
    font-size: 1.5rem;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tab-content {
    padding: 1.5rem;
  }
}
</style>
