/**
 * Markdown 渲染 Composable
 * 使用简单的正则表达式实现基础 Markdown 解析
 * 后续可替换为 marked/micromark 等成熟库
 */

export function useMarkdown() {
  // Markdown 解析函数
  const parseMarkdown = (markdown) => {
    if (!markdown) return ''
    
    let html = markdown
    
    // 转义 HTML 防止 XSS
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    // 代码块 (```code```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`
    })
    
    // 行内代码 (`code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // 标题 (# ~ ######)
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // 粗体 (**text** 或 __text__)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')
    
    // 斜体 (*text* 或 _text_)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    html = html.replace(/_(.*?)_/g, '<em>$1</em>')
    
    // 删除线 (~~text~~)
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>')
    
    // 链接 ([text](url))
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // 图片 (![alt](url))
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    
    // 引用 (> text)
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    
    // 无序列表 (- item 或 * item)
    html = html.replace(/^[\-\*] (.*$)/gim, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    
    // 有序列表 (1. item)
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    
    // 水平线 (--- 或 *** 或 ___)
    html = html.replace(/^([\-\*_]){3,}$/gim, '<hr />')
    
    // 换行 (两个空格 + 换行 或 空行)
    html = html.replace(/  \n/g, '<br />\n')
    html = html.replace(/\n\n/g, '</p><p>')
    html = '<p>' + html + '</p>'
    
    // 清理多余的段落标签
    html = html.replace(/<p>\s*<(h[1-6]|ul|ol|li|blockquote|pre|hr)/g, '<$1')
    html = html.replace(/<(\/h[1-6]|\/ul|\/ol|\/li|\/blockquote|\/pre|hr)\s*>\s*<\/p>/g, '</$1>')
    html = html.replace(/<p><\/p>/g, '')
    
    return html
  }

  // 从 Markdown 提取纯文本
  const extractText = (markdown) => {
    if (!markdown) return ''
    return markdown
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/`([^`]+)`/g, '$1') // 移除行内代码
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '') // 移除图片
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // 链接转文本
      .replace(/^[#\-\*\d\.>\s]+/gm, '') // 移除 Markdown 符号
      .replace(/[*_~`]/g, '') // 移除剩余符号
      .trim()
  }

  // 计算阅读时间 (每分钟 300 字)
  const calculateReadTime = (markdown) => {
    const text = extractText(markdown)
    const words = text.length
    return Math.ceil(words / 300) || 1
  }

  // 提取标题生成目录
  const extractHeadings = (markdown) => {
    const headings = []
    const regex = /^(#{1,6})\s+(.+)$/gm
    let match
    
    while ((match = regex.exec(markdown)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      headings.push({ level, text, id })
    }
    
    return headings
  }

  return {
    parseMarkdown,
    extractText,
    calculateReadTime,
    extractHeadings
  }
}
