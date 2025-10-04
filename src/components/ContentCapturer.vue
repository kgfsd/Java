<template>
  <div 
    class="content-capturer" 
    @mouseup="handleMouseSelection"
    @keydown.alt="handleAltKeyDown"
    @keyup.alt="handleAltKeyUp"
    tabindex="0"
  >
    <div v-if="isCaptureModeActive" class="capture-overlay"></div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// 1. 组件导入
import { onUnmounted } from 'vue'

// 2. 组合式函数导入
import { useContentCapture } from '@/composables/useContentCapture'
import type { ICapturedContent } from '@/types/ICapturedContent'
// 3. emits 定义
const emit = defineEmits<{
  (e: 'captured', content: ICapturedContent): void
}>()

// 4. 使用组合式函数
const {
  isCaptureModeActive,
  handleMouseSelection,
  handleAltKeyDown,
  handleAltKeyUp
} = useContentCapture(emit)

// 5. 样式管理
const style = document.createElement('style')
style.textContent = `
  .content-capturer {
    position: relative;
  }
  .capture-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    pointer-events: none;
    z-index: 9999;
  }
`
document.head.appendChild(style)

// 6. 生命周期
onUnmounted(() => {
  document.head.removeChild(style)
})
</script>

<style scoped>
.content-capturer {
  outline: none;
}

.content-capturer:focus {
  outline: none;
}
</style>