/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 莫兰迪低饱和配色 - 温暖治愈系
        primary: {
          50: '#faf9f8',
          100: '#f3f0ed',
          200: '#e6e0d9',
          300: '#d4c9be',
          400: '#bfaea0',
          500: '#a89380',  // 主色 - 暖灰棕
          600: '#968270',
          700: '#7d6d5f',
          800: '#6a5c50',
          900: '#584c43',
        },
        // 柔和粉紫 - 辅助色
        secondary: {
          50: '#fbf8fa',
          100: '#f5eef2',
          200: '#ebdde5',
          300: '#ddc5d3',
          400: '#cda7bc',
          500: '#bc8ba3',  // 豆沙粉
          600: '#a87690',
          700: '#8d6379',
          800: '#765365',
          900: '#624654',
        },
        // 静谧蓝灰 - 点缀色
        accent: {
          50: '#f7f9fa',
          100: '#eef3f5',
          200: '#dde7eb',
          300: '#c5d5dd',
          400: '#a9c0cc',
          500: '#8ba8b8',  // 雾霾蓝
          600: '#7694a3',
          700: '#637d8a',
          800: '#536973',
          900: '#465860',
        },
        // 自然绿意 - 成功色
        success: {
          50: '#f8faf8',
          100: '#eef5ef',
          200: '#dde8de',
          300: '#c5d6c7',
          400: '#a9c0ac',
          500: '#8ba890',  // 灰绿
          600: '#76947b',
          700: '#637d67',
          800: '#536957',
          900: '#465849',
        },
        // 温暖橘 - 警告色
        warning: {
          50: '#faf9f7',
          100: '#f5f0eb',
          200: '#ebe2d6',
          300: '#dfd0be',
          400: '#d1b8a0',
          500: '#c29d7f',  // 奶茶色
          600: '#ad8a6d',
          700: '#91745c',
          800: '#7a614e',
          900: '#665141',
        },
        // 柔和红 - 危险色
        danger: {
          50: '#faf8f8',
          100: '#f5eeef',
          200: '#ebdcde',
          300: '#ddc3c7',
          400: '#cda5ab',
          500: '#bc878f',  // 干枯玫瑰色
          600: '#a8727b',
          700: '#8d5f67',
          800: '#765057',
          900: '#624349',
        },
        // 中性色 - 背景/文字
        neutral: {
          50: '#fdfcfc',   // 最浅背景
          100: '#f9f8f7',  // 卡片背景
          200: '#f3f1f0',  // 边框
          300: '#e8e5e3',  // 分割线
          400: '#d4cfc9',  // 次要文字
          500: '#b8b1a8',  // 占位符
          600: '#9a9287',  // 次要文字深色
          700: '#7a7166',  // 正文
          800: '#5c544a',  // 标题
          900: '#3d3630',  // 主要文字
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        'none': '0',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(120, 100, 80, 0.04)',
        'soft-md': '0 4px 16px rgba(120, 100, 80, 0.06)',
        'soft-lg': '0 8px 32px rgba(120, 100, 80, 0.08)',
        'float': '0 2px 12px rgba(120, 100, 80, 0.05), 0 1px 4px rgba(120, 100, 80, 0.03)',
        'float-hover': '0 8px 24px rgba(120, 100, 80, 0.08), 0 4px 8px rgba(120, 100, 80, 0.04)',
        'inner-soft': 'inset 0 1px 3px rgba(120, 100, 80, 0.03)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}
