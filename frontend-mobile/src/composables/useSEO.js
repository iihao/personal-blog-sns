import { watch } from 'vue'
import { useRoute } from 'vue-router'

export function useSEO() {
  const route = useRoute()

  const updateMetaTags = () => {
    const baseTitle = '博客移动版'
    const pageTitle = route.meta.title || '首页'
    const fullTitle = `${pageTitle} - ${baseTitle}`
    
    // 更新页面标题
    document.title = fullTitle
    
    // 更新或创建 meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = getRouteDescription(route)
    
    // 更新或创建 og:title
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.property = 'og:title'
      document.head.appendChild(ogTitle)
    }
    ogTitle.content = fullTitle
    
    // 更新或创建 og:description
    let ogDesc = document.querySelector('meta[property="og:description"]')
    if (!ogDesc) {
      ogDesc = document.createElement('meta')
      ogDesc.property = 'og:description'
      document.head.appendChild(ogDesc)
    }
    ogDesc.content = getRouteDescription(route)
    
    // 更新或创建 og:type
    let ogType = document.querySelector('meta[property="og:type"]')
    if (!ogType) {
      ogType = document.createElement('meta')
      ogType.property = 'og:type'
      document.head.appendChild(ogType)
    }
    ogType.content = route.name === 'post' ? 'article' : 'website'
    
    // 更新或创建 twitter:card
    let twitterCard = document.querySelector('meta[name="twitter:card"]')
    if (!twitterCard) {
      twitterCard = document.createElement('meta')
      twitterCard.name = 'twitter:card'
      twitterCard.content = 'summary_large_image'
      document.head.appendChild(twitterCard)
    }
    
    // 更新或创建 twitter:title
    let twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta')
      twitterTitle.name = 'twitter:title'
      document.head.appendChild(twitterTitle)
    }
    twitterTitle.content = fullTitle
  }

  const getRouteDescription = (route) => {
    const descriptions = {
      home: '个人博客移动版 - 随时随地阅读精彩文章',
      discover: '发现更多精彩内容',
      messages: '查看您的消息通知',
      post: '阅读精彩文章',
      checkin: '每日签到，获取积分奖励',
      wallet: '管理您的钱包和积分',
      user: '个人中心',
      categories: '浏览文章分类',
      category: '查看分类文章',
      tags: '浏览文章标签',
      tag: '查看标签文章',
      projects: '查看项目展示',
      'project-detail': '项目详情',
      search: '搜索文章',
      login: '登录账号',
      register: '注册新账号',
      changelog: '查看更新日志',
      settings: '个人设置'
    }
    return descriptions[route.name] || '个人博客移动版'
  }

  // 监听路由变化，自动更新 SEO 信息
  watch(() => route.fullPath, updateMetaTags, { immediate: true })

  return {
    updateMetaTags
  }
}
