import dayjs from 'dayjs'
import { ref, onMounted, onUnmounted } from 'vue'
import type { StorageLikeAsync } from '@vueuse/core'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import 'dayjs/locale/ja'
import 'dayjs/locale/ko'

const THEME_SWITCH_STYLE_ID = '__theme_switch_view_transition_style__'

export function useThemeSwitchAnime(
  event: MouseEvent,
  isDark: () => boolean,
  callback: () => void,
  delay: number = 750,
  fn?: Function
) {
  if (!document.getElementById(THEME_SWITCH_STYLE_ID)) {
    const css = `
    ::view-transition-image-pair(root) {
      isolation: auto;
    }

    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation: none;
      mix-blend-mode: normal;
    }

    .dark::view-transition-new(root) {
      z-index: 999;
    }

    ::view-transition-new(root) {
      z-index: -1;
    }
    `
    const style = document.createElement('style')
    style.id = THEME_SWITCH_STYLE_ID
    style.textContent = css
    document.head.appendChild(style)
  }

  const x = event.clientX
  const y = event.clientY

  const endRadio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

  const viewTransition = document.startViewTransition(callback)

  viewTransition.ready.then(() => {
    const effect = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadio}px at ${x}px ${y}px)`]
    document.documentElement.animate(
      {
        clipPath: isDark() ? effect : effect.reverse()
      },
      {
        duration: delay,
        easing: 'ease-in-out',
        fill: 'forwards',
        pseudoElement: isDark() ? '::view-transition-new(root)' : '::view-transition-old(root)'
      }
    )
  })
}

export function useClock() {
  const now = ref(dayjs())
  let timer: number

  const sync = () => {
    now.value = dayjs()

    const delay = 1000 - (Date.now() % 1000)
    timer = window.setTimeout(sync, delay)
  }

  const setLocale = (locale: 'en' | 'zh-cn' | 'ja' | 'ko') => {
    dayjs.locale(locale)
  }

  onMounted(sync)
  onUnmounted(() => clearTimeout(timer))

  return {
    now,
    format: (template?: string) => now.value.format(template || 'HH:mm:ss'),
    setLocale
  }
}

export const chromeLocalStorage: StorageLikeAsync = {
  async getItem(key: string) {
    return new Promise(resolve => {
      chrome.storage.local.get(key, result => {
        resolve(result[key] ?? null)
      })
    })
  },
  async setItem(key: string, value: string) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve()
      })
    })
  },
  async removeItem(key: string | string[]) {
    return new Promise(resolve => {
      chrome.storage.local.remove(key, () => {
        resolve()
      })
    })
  }
}

export const base64ToBlob = (base64: string): Blob => {
  if (!base64) {
    return new Blob()
  }
  const [meta, data] = base64.split(',')
  const mime = meta.match(/data:(.*);base64/)?.[1] || 'application/octet-stream'
  const binary = atob(data)
  const len = binary.length
  const bytes = new Uint8Array(len)

  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

export let requestScreenWakeUp = async () => {
  try {
    let wakeLock: WakeLockSentinel | null = await navigator.wakeLock.request('screen')
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        await requestScreenWakeUp()
      }
    })
    wakeLock.onrelease = () => {
      wakeLock = null
    }
    requestScreenWakeUp = async () => {
      try {
        let wakeLock: WakeLockSentinel | null = await navigator.wakeLock.request('screen')
        wakeLock.onrelease = () => {
          wakeLock = null
        }
        return wakeLock
      } catch {
        console.warn('screen wake up not support.')
      }
    }
    return wakeLock
  } catch {
    console.warn('screen wake up not support.')
  }
}
