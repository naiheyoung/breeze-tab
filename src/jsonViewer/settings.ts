import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { BundledTheme } from './shiki.bundle'

export const useSettings = defineStore('settings', () => {
  const codeTheme = ref<BundledTheme>('vitesse-dark')
  const textSize = ref(16)

  watch(
    () => codeTheme,
    v => {}
  )

  watch(
    () => textSize,
    v => {}
  )

  return {
    codeTheme,
    textSize
  }
})
