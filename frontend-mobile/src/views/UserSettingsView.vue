<template>
  <div class="min-h-screen bg-gray-50 pb-[56px]">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 safe-area-top">
      <div class="px-4 py-3 flex items-center gap-3">
        <button @click="$router.push('/user')" class="p-2 -ml-2 touch-feedback">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="flex-1 text-base font-semibold text-gray-900 text-center pr-6">资料设置</h1>
      </div>
    </header>

    <!-- 在 main 标签结束后添加 TabBar -->

    <main class="px-4 py-4 space-y-4">
      <!-- 头像区域 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm text-center">
        <div class="relative w-24 h-24 mx-auto mb-3">
          <div class="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
            <img v-if="user.avatar" :src="user.avatar" :alt="user.nickname" class="w-full h-full object-cover" />
            <span v-else>{{ (user.nickname || user.username || 'A').charAt(0).toUpperCase() }}</span>
          </div>
          <button class="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg touch-feedback">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-500">点击更换头像</p>
      </div>

      <!-- 基本资料 -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100">
          <h2 class="text-sm font-bold text-blue-600">基本资料</h2>
        </div>
        <div class="divide-y divide-gray-100">
          <!-- 昵称 -->
          <div class="flex items-center justify-between p-4 touch-feedback" @click="editField('nickname')">
            <span class="text-sm text-gray-700 w-20">昵称</span>
            <div class="flex-1 text-right">
              <span :class="user.nickname ? 'text-gray-900' : 'text-gray-400'">
                {{ user.nickname || '未设置' }}
              </span>
            </div>
            <svg class="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- 性别 -->
          <div class="flex items-center justify-between p-4">
            <span class="text-sm text-gray-700 w-20">性别</span>
            <div class="flex gap-2">
              <button 
                @click="user.gender = 'male'"
                :class="user.gender === 'male' ? 'bg-gray-200 border-2 border-gray-400' : 'bg-gray-100 border border-gray-200'"
                class="px-4 py-1.5 rounded-lg text-sm touch-feedback"
              >
                ♂ 男
              </button>
              <button 
                @click="user.gender = 'female'"
                :class="user.gender === 'female' ? 'bg-gray-200 border-2 border-gray-400' : 'bg-gray-100 border border-gray-200'"
                class="px-4 py-1.5 rounded-lg text-sm touch-feedback"
              >
                ♀ 女
              </button>
              <button 
                @click="user.gender = 'secret'"
                :class="user.gender === 'secret' ? 'bg-blue-50 border-2 border-blue-500 text-blue-600' : 'bg-gray-100 border border-gray-200'"
                class="px-4 py-1.5 rounded-lg text-sm touch-feedback"
              >
                保密
              </button>
            </div>
          </div>

          <!-- 生日 -->
          <div class="flex items-center justify-between p-4 touch-feedback" @click="editField('birthday')">
            <span class="text-sm text-gray-700 w-20">生日</span>
            <div class="flex-1 text-right">
              <span :class="user.birthday ? 'text-gray-900' : 'text-gray-400'">
                {{ user.birthday || '未设置' }}
              </span>
            </div>
            <svg class="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- 简介 -->
          <div class="flex items-center justify-between p-4 touch-feedback" @click="editField('bio')">
            <span class="text-sm text-gray-700 w-20">简介</span>
            <div class="flex-1 text-right">
              <span :class="user.bio ? 'text-gray-900' : 'text-gray-400'">
                {{ user.bio || '介绍一下自己吧' }}
              </span>
            </div>
            <svg class="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- 标签 -->
          <div class="flex items-center justify-between p-4 touch-feedback" @click="editField('tags')">
            <span class="text-sm text-gray-700 w-20">标签</span>
            <div class="flex-1 text-right">
              <span class="text-gray-400">
                {{ user.tags || '添加个性标签' }}
              </span>
            </div>
            <svg class="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- 网址 -->
          <div class="flex items-center justify-between p-4 touch-feedback" @click="editField('website')">
            <span class="text-sm text-gray-700 w-20">网址</span>
            <div class="flex-1 text-right">
              <span :class="user.website ? 'text-gray-900' : 'text-gray-400'">
                {{ user.website || '未设置' }}
              </span>
            </div>
            <svg class="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 账户安全 -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100">
          <h2 class="text-sm font-bold text-blue-600">账户安全</h2>
        </div>
        <div class="divide-y divide-gray-100">
          <!-- 手机 -->
          <div class="flex items-center justify-between p-4 touch-feedback" @click="editField('phone')">
            <span class="text-sm text-gray-700 w-20">手机</span>
            <div class="flex-1 text-right flex items-center justify-end gap-2">
              <span :class="user.phone ? 'text-gray-900' : 'text-gray-400'">
                {{ user.phone ? hidePhone(user.phone) : '未绑定' }}
              </span>
              <span :class="user.phone ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'" class="text-xs px-2 py-0.5 rounded">
                {{ user.phone ? '已绑定' : '未绑定' }}
              </span>
            </div>
            <svg class="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- 邮箱 -->
          <div class="flex items-center justify-between p-4 touch-feedback" @click="editField('email')">
            <span class="text-sm text-gray-700 w-20">邮箱</span>
            <div class="flex-1 text-right flex items-center justify-end gap-2">
              <span :class="user.email ? 'text-gray-900' : 'text-gray-400'">
                {{ user.email ? hideEmail(user.email) : '未绑定' }}
              </span>
              <span :class="user.email ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'" class="text-xs px-2 py-0.5 rounded">
                {{ user.email ? '已绑定' : '未绑定' }}
              </span>
            </div>
            <svg class="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- 密码 -->
          <div class="flex items-center justify-between p-4 touch-feedback" @click="showPasswordModal = true">
            <span class="text-sm text-gray-700 w-20">密码</span>
            <div class="flex-1 text-right">
              <span class="text-gray-600">修改登录密码</span>
            </div>
            <svg class="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 社交账号 -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100">
          <h2 class="text-sm font-bold text-blue-600">社交账号</h2>
        </div>
        <div class="divide-y divide-gray-100">
          <!-- QQ -->
          <div class="flex items-center justify-between p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <circle cx="9" cy="10" r="1.5"/>
                  <circle cx="15" cy="10" r="1.5"/>
                  <path d="M12 16c-1.48 0-2.75-.81-3.42-2h6.84c-.67 1.19-1.94 2-3.42 2z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900">QQ</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">{{ social.qq ? '已绑定' : '未绑定' }}</span>
              <span :class="social.qq ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'" class="text-xs px-2 py-0.5 rounded">
                {{ social.qq ? '已绑定' : '未绑定' }}
              </span>
            </div>
          </div>

          <!-- GitHub -->
          <div class="flex items-center justify-between p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900">GitHub</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">{{ social.github ? '已绑定' : '未绑定' }}</span>
              <span :class="social.github ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'" class="text-xs px-2 py-0.5 rounded">
                {{ social.github ? '已绑定' : '未绑定' }}
              </span>
            </div>
          </div>

          <!-- 微信 -->
          <div class="flex items-center justify-between p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                  <path d="M12 2C6.48 2 2 5.58 2 10c0 2.52 1.5 4.76 3.84 6.18-.12.75-.43 1.96-.77 2.62-.13.25.14.55.42.42 1.56-.71 3.06-1.56 4.07-2.17.8.22 1.65.34 2.44.34 5.52 0 10-3.58 10-8S17.52 2 12 2zm-7 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm10 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900">微信</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">{{ social.wechat ? '已绑定' : '未绑定' }}</span>
              <span :class="social.wechat ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'" class="text-xs px-2 py-0.5 rounded">
                {{ social.wechat ? '已绑定' : '未绑定' }}
              </span>
            </div>
          </div>

          <!-- 微博 -->
          <div class="flex items-center justify-between p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900">微博</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">{{ social.weibo ? '已绑定' : '未绑定' }}</span>
              <span :class="social.weibo ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'" class="text-xs px-2 py-0.5 rounded">
                {{ social.weibo ? '已绑定' : '未绑定' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 修改密码弹窗 -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showPasswordModal = false">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm" @click.stop>
        <h3 class="text-lg font-bold mb-4">修改密码</h3>
        <div class="space-y-3 mb-4">
          <input v-model="passwords.current" type="password" placeholder="当前密码" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
          <input v-model="passwords.new" type="password" placeholder="新密码" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
          <input v-model="passwords.confirm" type="password" placeholder="确认新密码" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
        </div>
        <div class="flex gap-3">
          <button @click="showPasswordModal = false" class="flex-1 py-3 bg-gray-100 rounded-xl font-medium">取消</button>
          <button @click="changePassword" class="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium">确认</button>
        </div>
      </div>
    </div>

    <!-- 编辑字段弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showEditModal = false">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm" @click.stop>
        <h3 class="text-lg font-bold mb-4">编辑{{ currentField.label }}</h3>
        <textarea 
          v-if="currentField.type === 'textarea'"
          v-model="currentField.value"
          rows="4"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4"
          :placeholder="currentField.placeholder"
        ></textarea>
        <input 
          v-else
          v-model="currentField.value"
          :type="currentField.type"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4"
          :placeholder="currentField.placeholder"
        />
        <div class="flex gap-3">
          <button @click="showEditModal = false" class="flex-1 py-3 bg-gray-100 rounded-xl font-medium">取消</button>
          <button @click="saveField" class="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(false)
const user = ref({
  id: '',
  username: '',
  nickname: '',
  email: '',
  phone: '',
  avatar: '',
  bio: '',
  gender: 'secret',
  birthday: '',
  website: '',
  tags: ''
})

const social = ref({
  qq: false,
  github: false,
  wechat: false,
  weibo: false
})

const passwords = ref({ current: '', new: '', confirm: '' })
const showPasswordModal = ref(false)
const showEditModal = ref(false)
const currentField = ref({ key: '', label: '', value: '', type: 'text', placeholder: '' })

const fieldConfig = {
  nickname: { label: '昵称', type: 'text', placeholder: '请输入昵称' },
  birthday: { label: '生日', type: 'date', placeholder: '选择生日' },
  bio: { label: '简介', type: 'textarea', placeholder: '介绍一下自己吧' },
  tags: { label: '标签', type: 'text', placeholder: '用逗号分隔多个标签' },
  website: { label: '网址', type: 'url', placeholder: 'https://example.com' },
  phone: { label: '手机', type: 'tel', placeholder: '请输入手机号' },
  email: { label: '邮箱', type: 'email', placeholder: '请输入邮箱' }
}

const checkAuth = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    isLoggedIn.value = false
    return
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) {
      isLoggedIn.value = true
      user.value = { ...user.value, ...data.data }
      if (!user.value.gender) user.value.gender = 'secret'
    }
  } catch (error) {
    console.error('检查登录状态失败:', error)
  }
}

const hidePhone = (phone) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const hideEmail = (email) => {
  const [name, domain] = email.split('@')
  return `${name.charAt(0)}***${name.charAt(name.length - 1)}@${domain}`
}

const editField = (key) => {
  const config = fieldConfig[key]
  currentField.value = {
    key,
    label: config.label,
    value: user.value[key] || '',
    type: config.type,
    placeholder: config.placeholder
  }
  showEditModal.value = true
}

const saveField = async () => {
  try {
    const token = localStorage.getItem('token')
    const updateData = { [currentField.value.key]: currentField.value.value }
    
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
    const data = await res.json()
    if (data.success) {
      user.value[currentField.value.key] = currentField.value.value
      showEditModal.value = false
      alert('保存成功')
    } else {
      alert(data.error || '保存失败')
    }
  } catch (error) {
    alert('保存失败，请重试')
  }
}

const changePassword = async () => {
  if (passwords.value.new !== passwords.value.confirm) {
    alert('两次输入的新密码不一致')
    return
  }
  
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword: passwords.value.current,
        newPassword: passwords.value.new
      })
    })
    const data = await res.json()
    if (data.success) {
      alert('密码修改成功')
      passwords.value = { current: '', new: '', confirm: '' }
      showPasswordModal.value = false
    } else {
      alert(data.error || '修改失败')
    }
  } catch (error) {
    alert('修改失败，请重试')
  }
}

onMounted(() => {
  checkAuth()
})
</script>

<style scoped>
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-feedback { transition: transform 0.1s; }
.touch-feedback:active { transform: scale(0.98); }
</style>
