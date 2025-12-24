import { defineStore } from 'pinia'
import { watch, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { BundledTheme } from './shiki.bundle'

export const useSettings = defineStore('settings', () => {
  const jsonSettings = useLocalStorage<{
    codeTheme: BundledTheme
    textSize: number
  }>('breezeTabSettings-json', {
    codeTheme: 'vitesse-dark',
    textSize: 16
  })

  watch(
    () => jsonSettings.value.codeTheme,
    v => {}
  )

  return {
    codeTheme: computed({
      get: () => jsonSettings.value.codeTheme,
      set: v => (jsonSettings.value.codeTheme = v)
    }),
    textSize: computed({
      get: () => jsonSettings.value.textSize,
      set: v => (jsonSettings.value.textSize = v)
    })
  }
})
