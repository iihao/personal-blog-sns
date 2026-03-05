<template>
  <component 
    :is="iconComponent" 
    :class="['icon', sizeClass, colorClass]" 
    v-bind="$attrs"
  />
</template>

<script setup>
import { computed } from 'vue'
// Heroicons
import { 
  HomeIcon, NewspaperIcon, ChatBubbleLeftRightIcon, 
  PhotoIcon, Cog6ToothIcon, UserGroupIcon, 
  PlusCircleIcon, CheckIcon, TrashIcon, 
  CloudArrowUpIcon, PencilSquareIcon, 
  ChartBarIcon, BoltIcon, ArrowRightIcon,
  ClockIcon, ServerIcon, UserIcon, FolderIcon,
  DocumentTextIcon, Bars3Icon, ChevronLeftIcon, ChevronRightIcon,
  ArrowTopRightOnSquareIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'md' // xs, sm, md, lg, xl
  },
  color: {
    type: String,
    default: 'default' // default, primary, success, warning, danger
  }
})

const iconMap = {
  // 通用
  'home': HomeIcon,
  'settings': Cog6ToothIcon,
  'users': UserGroupIcon,
  'bolt': BoltIcon,
  'arrow-right': ArrowRightIcon,
  'bars': Bars3Icon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'external-link': ArrowTopRightOnSquareIcon,
  'expand': ArrowsPointingOutIcon,
  'collapse': ArrowsPointingInIcon,
  
  // 内容
  'articles': NewspaperIcon,
  'comments': ChatBubbleLeftRightIcon,
  'media': PhotoIcon,
  'editor': PencilSquareIcon,
  'write': PencilSquareIcon,
  
  // 操作
  'plus': PlusCircleIcon,
  'check': CheckIcon,
  'trash': TrashIcon,
  'upload': CloudArrowUpIcon,
  
  // 状态
  'clock': ClockIcon,
  'database': ServerIcon,
  'user': UserIcon,
  'folder': FolderIcon,
  'document': DocumentTextIcon,
  
  // 图表
  'chart': ChartBarIcon
}

const iconComponent = computed(() => iconMap[props.name] || HomeIcon)

const sizeClass = computed(() => {
  const sizes = {
    'xs': 'w-3 h-3',
    'sm': 'w-4 h-4',
    'md': 'w-5 h-5',
    'lg': 'w-6 h-6',
    'xl': 'w-8 h-8'
  }
  return sizes[props.size] || sizes.md
})

const colorClass = computed(() => {
  const colors = {
    'default': 'text-gray-600 dark:text-gray-300',
    'primary': 'text-blue-600 dark:text-blue-400',
    'success': 'text-green-600 dark:text-green-400',
    'warning': 'text-orange-600 dark:text-orange-400',
    'danger': 'text-red-600 dark:text-red-400'
  }
  return colors[props.color] || colors.default
})
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
}
</style>