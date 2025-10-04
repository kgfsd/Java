import { ref } from 'vue'
import { useEventListener, useDebounceFn } from '@vueuse/core'
import type { ICapturedContent, ILink } from '@/types/ICapturedContent'
import * as Linkify from 'linkifyjs'

/**
 * 内容捕获组合式函数
 */
export function useContentCapture(emit: (event: 'captured', content: ICapturedContent) => void) {
  const isCaptureModeActive = ref<boolean>(false)
  const selectedText = ref<string>('')
  const capturedContent = ref<ICapturedContent | null>(null)

  /**
   * 检测内容类型
   */
  const detectContentType = (content: string): ICapturedContent['type'] => {
    if (content.match(/<img[^>]+>/)) return 'image'
    if (content.match(/<video[^>]+>/)) return 'video'
    if (content.match(/<audio[^>]+>/)) return 'audio'
    if (content.match(/<table[^>]+>/)) return 'table'
    if (content.match(/<code[^>]+>/)) return 'code'
    return 'text'
  }

  /**
   * 提取链接
   */
  const extractLinks = (html: string, plainText: string): ILink[] => {
    if (!html && !plainText) return []
    
    const links: ILink[] = []
    const seenUrls = new Set<string>()

    try {
      // 从HTML中提取现有的<a>标签链接
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html
      
      // 处理HTML中的链接
      const anchorTags = tempDiv.getElementsByTagName('a')
      Array.from(anchorTags).forEach(anchor => {
        const url = anchor.href
        if (!url || url.startsWith('javascript:')) return
        
        if (!seenUrls.has(url)) {
          seenUrls.add(url)
          links.push({
            url,
            text: anchor.textContent.trim() || url
          })
        }
      })

      // 使用linkifyjs查找文本中的链接
      if (plainText) {
        const found = Linkify.find(plainText, 'url')
        found.forEach(link => {
          const url = link.href
          if (!url || url.startsWith('javascript:') || !url.match(/^https?:\/\//)) return
          
          if (!seenUrls.has(url)) {
            seenUrls.add(url)
            links.push({
              url,
              text: link.value
            })
          }
        })
      }
    } catch (error) {
      console.error('链接提取失败:', error)
    }
    
    return links
  }

  /**
   * 处理鼠标选择文本
   */
  const handleMouseSelection = useDebounceFn(() => {
    const selection = window.getSelection()
    if (!selection || !selection.toString().trim()) return
    
    try {
      selectedText.value = selection.toString()
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      const fragment = range.cloneContents()
      const tempDiv = document.createElement('div')
      tempDiv.appendChild(fragment)
      const html = tempDiv.innerHTML
      
      const text = selection.toString().replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
      
      const links = extractLinks(html, text)
      const contentType = detectContentType(html)
      
      emit('captured', {
        type: contentType,
        content: text,
        html: html,
        links: links,
        position: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        }
      })
    } catch (error) {
      console.error('选择内容处理失败:', error)
    }
  }, 100)

  /**
   * 处理块级内容捕获
   */
  const handleBlockCapture = (event: MouseEvent) => {
    if (!isCaptureModeActive.value) return
    
    const target = event.target as HTMLElement
    if (!target) return

    if (capturedContent.value && capturedContent.value.element === target) return

    try {
      const container = (target.closest('p, div, li, article, section') || target) as HTMLElement
      const html = container.innerHTML || ''
      const text = container.textContent || ''
      
      const cleanText = text.replace(/\s+/g, ' ').trim()
      
      const links = extractLinks(html, cleanText)
      const contentType = detectContentType(html)
      
      const newContent: ICapturedContent = {
        type: contentType,
        content: cleanText,
        html: html,
        links: links,
        element: container
      }
      
      capturedContent.value = newContent
      emit('captured', newContent)
    } catch (error) {
      console.error('内容捕获失败:', error)
    }
  }

  // Alt键处理
  const handleAltKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Alt') {
      isCaptureModeActive.value = true
    }
  }

  const handleAltKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Alt') {
      isCaptureModeActive.value = false
    }
  }

  // 监听窗口失焦事件
  useEventListener(window, 'blur', () => {
    isCaptureModeActive.value = false
  })

  // 监听全局键盘事件
  useEventListener(document, 'keyup', (event: KeyboardEvent) => {
    if (event.key === 'Alt') {
      isCaptureModeActive.value = false
    }
  })

  // 监听鼠标移动事件
  const debouncedBlockCapture = useDebounceFn((e: MouseEvent) => {
    if (isCaptureModeActive.value) {
      handleBlockCapture(e)
    }
  }, 200)

  useEventListener(document, 'mousemove', debouncedBlockCapture)

  return {
    isCaptureModeActive,
    selectedText,
    capturedContent,
    handleMouseSelection,
    handleAltKeyDown,
    handleAltKeyUp
  }
}