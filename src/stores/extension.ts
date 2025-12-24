import { defineStore } from 'pinia'

const { setLocale } = useClock()

interface AffixChildren {
  icon: string
  url: string
}

interface TabSettings {
  time: {
    active: boolean
    formatter: string
    color: string
  }
  date: {
    active: boolean
    formatter: string
    color: string
  }
  week: {
    active: boolean
    locale: 'en' | 'zh-cn' | 'ja' | 'ko'
  }
  wallpaper: {
    type: string
    v: string
    blur: number
    position: {
      x: number
      y: number
    }
  }
  search: {
    active: boolean
    engine: string
  }
  affix: {
    active: boolean
    v: string
    icon: string
    children?: AffixChildren[]
  }
}

export const useStore = defineStore('extension', () => {
  const timeFormatter = ref<string>('HH:mm:ss')
  const dateFormatter = ref<string>('YY/MM/DD dddd')
  const tabSettings = useStorageAsync<TabSettings>(
    'breezeTabSettings',
    {
      time: {
        active: true,
        formatter: timeFormatter.value,
        color: 'rgba(255, 255, 255, 0.62)'
      },
      date: {
        active: true,
        formatter: dateFormatter.value,
        color: 'rgb(229, 231, 235)'
      },
      week: {
        active: false,
        locale: 'en'
      },
      wallpaper: {
        type: 'local',
        v: '',
        blur: 2,
        position: {
          x: 50,
          y: 50
        }
      },
      search: {
        active: true,
        engine: 'google'
      },
      affix: {
        active: false,
        v: 'https://github.com/',
        icon: 'i-carbon:logo-github'
      }
    },
    chromeLocalStorage
  )

  watch(
    () => tabSettings.value.wallpaper.blur,
    v => {
      document.documentElement.style.setProperty('--bg-blur', v + 'px')
    }
  )

  const timeDebounce = useDebounceFn(v => {
    timeFormatter.value = v
  }, 500)
  watch(() => tabSettings.value.time.formatter, timeDebounce)

  const dateDebounce = useDebounceFn(v => {
    dateFormatter.value = v
  }, 500)
  watch(() => tabSettings.value.date.formatter, dateDebounce)

  watch(
    () => tabSettings.value.week.locale,
    v => {
      setLocale(v)
    }
  )

  watch(tabSettings, () => {})

  return {
    timeFormatter,
    dateFormatter,
    tabSettings
  }
})
