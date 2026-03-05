/**
 * 表单校验工具函数
 * 提供常用的表单验证规则
 */

export function useValidation() {
  // 邮箱验证
  const validateEmail = (email) => {
    if (!email) return { valid: true, message: '' } // 可选字段
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(email)) {
      return { valid: false, message: '请输入有效的邮箱地址' }
    }
    return { valid: true, message: '' }
  }

  // 用户名验证 (3-20 字符)
  const validateUsername = (username) => {
    if (!username) {
      return { valid: false, message: '请输入用户名' }
    }
    if (username.length < 3) {
      return { valid: false, message: '用户名至少 3 个字符' }
    }
    if (username.length > 20) {
      return { valid: false, message: '用户名最多 20 个字符' }
    }
    const regex = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/
    if (!regex.test(username)) {
      return { valid: false, message: '用户名只能包含字母、数字、下划线或中文' }
    }
    return { valid: true, message: '' }
  }

  // 密码验证 (至少 6 位)
  const validatePassword = (password, isConfirm = false) => {
    if (!password) {
      return { valid: false, message: isConfirm ? '请确认密码' : '请输入密码' }
    }
    if (password.length < 6) {
      return { valid: false, message: '密码长度至少 6 位' }
    }
    return { valid: true, message: '' }
  }

  // 确认密码验证
  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
      return { valid: false, message: '请确认密码' }
    }
    if (password !== confirmPassword) {
      return { valid: false, message: '两次输入的密码不一致' }
    }
    return { valid: true, message: '' }
  }

  // 必填项验证
  const validateRequired = (value, fieldName = '此字段') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return { valid: false, message: `请输入${fieldName}` }
    }
    return { valid: true, message: '' }
  }

  // URL 验证
  const validateUrl = (url) => {
    if (!url) return { valid: true, message: '' } // 可选字段
    try {
      new URL(url)
      return { valid: true, message: '' }
    } catch {
      return { valid: false, message: '请输入有效的 URL 地址' }
    }
  }

  return {
    validateEmail,
    validateUsername,
    validatePassword,
    validateConfirmPassword,
    validateRequired,
    validateUrl
  }
}
