<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <main
      font-mono
      h-full
      overflow-hidden
      select-none
      text="center gray-700 dark:gray-200"
      w-full>
      <div
        class="mask absolute block z-3 pointer-events-none opacity100 bg-no-repeat bg-cover"></div>
      <div
        ref="wallpaper"
        :style="{
          filter: `blur(var(--bg-blur))`,
          backgroundPositionX: `${tabSettings.wallpaper.position.x}%`,
          backgroundPositionY: `${tabSettings.wallpaper.position.y}%`
        }"
        class="wallpaper absolute bg-cover opacity100 bg-no-repeat"></div>
      <div class="content overflow-hidden fixed z-9 flex w-full h-full">
        <div
          :style="{ marginTop: `-${wrapperOffset}px` }"
          class="wrapper flex mx-auto flex-col transition-all duration-350 items-center justify-center">
          <TransitionGroup name="datetime">
            <div
              style="color: rgba(255, 255, 255, 0.62)"
              :style="{ color: tabSettings.time.color }"
              class="time text-6.875rem leading-6.875rem transition-colors"
              v-if="tabSettings.time.active"
              v-text="format(timeFormatter)"></div>
            <div
              :style="{ color: tabSettings.date.color }"
              class="date transition-colors"
              v-if="tabSettings.date.active"
              v-text="format(dateFormatter)"></div>
          </TransitionGroup>
        </div>
      </div>
      <div class="toolbar fixed right-8 bottom-8 z-9">
        <div
          class="i-carbon:settings hover:cursor-pointer icon-spin-hover"
          @click="settingsBoxActive = true"></div>
      </div>
      <div class="search transition flex flex-col gap-y-2 fixed top-6 right-6 z-9">
        <Transition name="datetime">
          <div v-if="tabSettings.search.active">
            <div class="hover:cursor-pointer" v-if="tabSettings.search.engine === 'google'">
              <a class="i-logos:google-icon" href="https://google.com"></a>
            </div>
            <div class="hover:cursor-pointer" v-if="tabSettings.search.engine === 'bing'">
              <a class="i-logos:bing" href="https://bing.com"></a>
            </div>
          </div>
        </Transition>
        <div class="affix transition flex flex-col gap-y-4">
          <Transition name="datetime">
            <a :href="tabSettings.affix.v" v-if="tabSettings.affix.active">
              <div :class="githubIcons[githubIconIndex]"></div>
            </a>
          </Transition>
        </div>
      </div>

      <!-- settings box -->
      <n-drawer
        :auto-focus="false"
        :placement="placement"
        :width="502"
        v-model:show="settingsBoxActive">
        <n-drawer-content title="Settings">
          <template #header>
            <div class="flex gap-x-1">
              <span class="i-carbon:settings icon-spin text-sm"></span>
              Settings
            </div>
          </template>
          <n-collapse
            :default-expanded-names="['datetime', 'background', 'search', 'affix']"
            :trigger-areas="['main']">
            <!-- datetime -->
            <n-collapse-item name="datetime" title="Datetime">
              <template #arrow>&nbsp;</template>
              <template #header><span class="relative">Datetime</span></template>
              <template #header-extra>
                <div class="i-carbon:calendar-settings"></div>
              </template>
              <div flex flex-col font-mono gap-y-2>
                <!-- time -->
                <n-form-item
                  :show-feedback="false"
                  label="time"
                  label-placement="left"
                  size="small">
                  <div class="flex gap-x-2 items-center w-full">
                    <n-switch size="small" v-model:value="tabSettings.time.active">
                      <template #checked-icon>
                        <div class="i-carbon:alarm"></div>
                      </template>
                    </n-switch>
                    <n-input
                      :disabled="!tabSettings.time.active"
                      placeholder="enter time formatter"
                      v-model:value="tabSettings.time.formatter" />
                    <n-color-picker
                      class="w-27.5"
                      :disabled="!tabSettings.time.active"
                      :swatches="['rgba(255, 255, 255, 0.62)']"
                      size="small"
                      v-model:value="tabSettings.time.color" />
                  </div>
                </n-form-item>
                <!-- date -->
                <n-form-item
                  :show-feedback="false"
                  label="date"
                  label-placement="left"
                  size="small">
                  <div class="flex gap-x-2 items-center w-full">
                    <n-switch size="small" v-model:value="tabSettings.date.active">
                      <template #checked-icon>
                        <div class="i-carbon:calendar"></div>
                      </template>
                    </n-switch>
                    <n-input
                      :disabled="!tabSettings.date.active"
                      placeholder="enter date formatter"
                      v-model:value="tabSettings.date.formatter" />
                    <n-color-picker
                      class="w-27.5"
                      :disabled="!tabSettings.date.active"
                      :swatches="['rgb(229, 231, 235)']"
                      size="small"
                      v-model:value="tabSettings.date.color" />
                  </div>
                </n-form-item>
                <!-- week -->
                <n-form-item
                  :show-feedback="false"
                  label="week"
                  label-placement="left"
                  size="small">
                  <div class="flex gap-x-2 items-center">
                    <n-radio-group
                      :disabled="!tabSettings.date.active"
                      name="week"
                      size="small"
                      v-model:value="tabSettings.week.locale"
                      @update:value="weekLocaleUpdateFn">
                      <n-radio-button
                        :key="locale.value"
                        :label="locale.label"
                        :value="locale.value"
                        v-for="locale in weekLocale" />
                    </n-radio-group>
                  </div>
                </n-form-item>
              </div>
            </n-collapse-item>
            <!-- background -->
            <n-collapse-item name="background" title="Background">
              <template #arrow>&nbsp;</template>
              <template #header><span class="relative">Background</span></template>
              <template #header-extra>
                <n-tooltip :show-arrow="false" trigger="hover">
                  <template #trigger>
                    <div
                      class="i-lucide:wallpaper hover:cursor-pointer"
                      @click="resetWallpaper"></div>
                  </template>
                  default wallpaper
                </n-tooltip>
              </template>
              <div flex flex-col font-mono gap-y-2>
                <div ref="uploadWrapper" class="bg-cover bg-no-repeat">
                  <n-upload
                    ref="uploadRef"
                    :custom-request="wallpaperUpload"
                    :show-file-list="false"
                    accept=".jpg,.jpeg,.png"
                    directory-dnd>
                    <n-upload-dragger class="py-48.4px">
                      <div style="margin-bottom: 12px">
                        <div class="i-lucide:wallpaper text-2xl"></div>
                      </div>
                      <span>select your wallpaper(max size 5MB)</span>
                    </n-upload-dragger>
                  </n-upload>
                </div>
                <n-form-item
                  :show-feedback="false"
                  label="image url"
                  label-placement="left"
                  size="small">
                  <div class="flex gap-x-2 items-center w-full">
                    <n-input placeholder="enter wallpaper url" v-model:value="imageUrl">
                      <template #prefix>
                        <div class="i-carbon:url"></div>
                      </template>
                    </n-input>
                    <n-button @click="setWallpaperByUrl($event)">set</n-button>
                  </div>
                </n-form-item>
                <n-form-item
                  :show-feedback="false"
                  label="blur"
                  label-placement="left"
                  size="small">
                  <div class="flex gap-x-2 items-center w-full">
                    <n-slider :max="20" :step="1" v-model:value="tabSettings.wallpaper.blur" />
                  </div>
                </n-form-item>
                <n-form-item
                  :show-feedback="false"
                  label="position"
                  label-placement="left"
                  size="small">
                  <div class="flex gap-x-3 w-full">
                    <n-button class="flex-grow-1" @click="setWallpaperPosition('top')">
                      <template #icon>
                        <div class="i-carbon:caret-up"></div>
                      </template>
                    </n-button>
                    <n-button class="flex-grow-1" @click="setWallpaperPosition('right')">
                      <template #icon>
                        <div class="i-carbon:caret-right"></div>
                      </template>
                    </n-button>
                    <n-button class="flex-grow-1" @click="setWallpaperPosition('down')">
                      <template #icon>
                        <div class="i-carbon:caret-down"></div>
                      </template>
                    </n-button>
                    <n-button class="flex-grow-1" @click="setWallpaperPosition('left')">
                      <template #icon>
                        <div class="i-carbon:caret-left"></div>
                      </template>
                    </n-button>
                  </div>
                </n-form-item>
              </div>
            </n-collapse-item>
            <!-- search -->
            <n-collapse-item name="search" title="Search">
              <template #arrow>&nbsp;</template>
              <template #header><span class="relative">SearchEngine</span></template>
              <template #header-extra>
                <div class="i-carbon:contour-finding"></div>
              </template>
              <div flex flex-col font-mono gap-y-2>
                <n-form-item
                  :show-feedback="false"
                  label="search"
                  label-placement="left"
                  size="small">
                  <div class="flex gap-x-2 items-center">
                    <n-switch size="small" v-model:value="tabSettings.search.active">
                      <template #checked-icon>
                        <div class="i-carbon:ibm-engineering-workflow-mgmt"></div>
                      </template>
                    </n-switch>
                    <n-radio-group
                      :disabled="!tabSettings.search.active"
                      name="search"
                      size="small"
                      v-model:value="tabSettings.search.engine">
                      <n-radio-button
                        :disabled="engine.label === 'Baidu' || engine.label === 'baidu'"
                        :key="engine.label"
                        :label="engine.label"
                        :value="engine.label.toLowerCase()"
                        v-for="engine in searchEngine" />
                    </n-radio-group>
                  </div>
                </n-form-item>
              </div>
            </n-collapse-item>
            <!-- affix -->
            <n-collapse-item name="affix" title="Affix">
              <template #arrow>&nbsp;</template>
              <template #header><span class="relative">Affix</span></template>
              <template #header-extra>
                <n-tooltip :show-arrow="false" trigger="hover">
                  <template #trigger>
                    <div
                      class="i-lucide:pin hover:cursor-pointer"
                      @click="switchGithubIcon"></div>
                  </template>
                  switch github affix icon
                </n-tooltip>
              </template>
              <div flex flex-col font-mono gap-y-2>
                <n-form-item
                  :show-feedback="false"
                  label="github"
                  label-placement="left"
                  size="small">
                  <div class="flex gap-x-2 items-center">
                    <n-switch size="small" v-model:value="tabSettings.affix.active">
                      <template #checked-icon>
                        <div class="i-lucide:github"></div>
                      </template>
                    </n-switch>
                    <n-input
                      :disabled="!tabSettings.affix.active"
                      placeholder="username"
                      v-model:value="githubUsername">
                      <template #prefix>
                        <span>https://github.com/</span>
                      </template>
                    </n-input>
                    <n-button
                      :disabled="!tabSettings.affix.active"
                      @click="setGithubUsername($event)">
                      set
                    </n-button>
                  </div>
                </n-form-item>
              </div>
            </n-collapse-item>
          </n-collapse>
        </n-drawer-content>
      </n-drawer>
    </main>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { DrawerPlacement, UploadCustomRequestOptions } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useStore } from './stores/extension'
import { darkTheme, GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#646cffFF',
    primaryColorHover: '#7077ffFF',
    primaryColorPressed: '#4f58e6FF',
    primaryColorSuppl: 'rgba(100, 108, 255, 0.85)'
  }
}

const store = useStore()
const { timeFormatter, dateFormatter, tabSettings } = storeToRefs(store)
const { format, setLocale } = useClock()
const wrapperOffset = ref(innerHeight / 2)
const settingsBoxActive = ref(false)
const placement = ref<DrawerPlacement>('right')
const weekLocale = [
  {
    label: '英(en)',
    value: 'en'
  },
  {
    label: '中(cn)',
    value: 'zh-cn'
  },
  {
    label: '日(ja)',
    value: 'ja'
  },
  {
    label: '韩(ko)',
    value: 'ko'
  }
]
const wallpaperEl = useTemplateRef('wallpaper')
const uploadRef = useTemplateRef('uploadRef')
const uploadWrapper = useTemplateRef('uploadWrapper')
const imageUrlRegex = /https?:\/\/[^\/\s]+\.+[^\/\s]+\/.+\.(jpg|jpeg|png)(\?.*)?/
const imageUrl = ref('')
const githubUsername = ref('')
const searchEngine = [
  {
    label: 'Google',
    value: 'https://www.google.com/search?q='
  },
  {
    label: 'Baidu',
    value: 'https://www.baidu.com/s?wd='
  },
  {
    label: 'Bing',
    value: 'https://www.bing.com/search?q='
  }
]
const githubIcons = ['i-carbon:logo-github', 'i-lucide:github', 'i-logos:github-octocat']
const githubIconIndex = ref(0)

const weekLocaleUpdateFn = (v: 'en' | 'zh-cn' | 'ja' | 'ko') => {
  setLocale(v)
}

const wallpaperUpload = ({ file }: UploadCustomRequestOptions) => {
  const url = useObjectUrl(file.file)
  wallpaperEl.value!.style.backgroundImage = `url(${url.value})`
  uploadWrapper.value!.style.backgroundPosition = '50%'
  uploadWrapper.value!.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${url.value})`
  uploadWrapper.value!.style.borderRadius = '3px'
  const nUploadTrigger = uploadWrapper.value?.querySelector(
    '.n-upload-trigger'
  )! as HTMLDivElement
  nUploadTrigger.style.opacity = '0.37'
  imageUrl.value = ''
  const fileReader = new FileReader()
  fileReader.onload = () => {
    tabSettings.value.wallpaper.v = fileReader.result as string
  }
  file.file && fileReader.readAsDataURL(file.file)
}

const setWallpaperByUrl = async (evt: MouseEvent) => {
  const NInputEl = (evt.currentTarget as HTMLButtonElement)!.parentElement!.querySelector(
    '.n-input'
  )!
  if (!imageUrlRegex.test(imageUrl.value)) {
    NInputEl.classList.add('headShake')
    useTimeoutFn(() => {
      NInputEl.classList.remove('headShake')
    }, 850)
    return
  }
  // request image
  const res = await fetch(imageUrl.value)
  if (res.ok) {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      tabSettings.value.wallpaper.v = fileReader.result as string
    }
    const blob = await res.blob()
    fileReader.readAsDataURL(blob)
    const _url = useObjectUrl(blob)
    wallpaperEl.value!.style.backgroundImage = `url(${_url.value})`
    uploadRef.value?.clear()
    uploadWrapper.value!.style.backgroundPosition = '50%'
    uploadWrapper.value!.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${_url.value})`
    uploadWrapper.value!.style.borderRadius = '3px'
    const nUploadTrigger = uploadWrapper.value?.querySelector(
      '.n-upload-trigger'
    )! as HTMLDivElement
    nUploadTrigger.style.opacity = '0.37'
  } else {
    NInputEl.classList.add('headShake')
    useTimeoutFn(() => {
      NInputEl.classList.remove('headShake')
    }, 850)
  }
}

const resetWallpaper = () => {
  wallpaperEl.value!.style.backgroundImage = 'url(images/default.jpg)'
  tabSettings.value.wallpaper.v = ''
}

const setGithubUsername = (evt: MouseEvent) => {
  if (!githubUsername.value) {
    const NInputEl = (evt.currentTarget as HTMLButtonElement)!.parentElement!.querySelector(
      '.n-input'
    )!
    NInputEl.classList.add('headShake')
    useTimeoutFn(() => {
      NInputEl.classList.remove('headShake')
    }, 850)
    return
  }
  tabSettings.value.affix.v = 'https://github.com/' + githubUsername.value
}

const switchGithubIcon = () => {
  githubIconIndex.value = (githubIconIndex.value + 1) % githubIcons.length
  tabSettings.value.affix.icon = githubIcons[githubIconIndex.value]
}

const setWallpaperPosition = (type: 'top' | 'right' | 'down' | 'left') => {
  if (type === 'top') {
    if (tabSettings.value.wallpaper.position.y - 1 >= 0) {
      tabSettings.value.wallpaper.position.y -= 1
    }
  } else if (type === 'right') {
    if (tabSettings.value.wallpaper.position.x + 1 <= 100) {
      tabSettings.value.wallpaper.position.x += 1
    }
  } else if (type === 'down') {
    if (tabSettings.value.wallpaper.position.y + 1 <= 100) {
      tabSettings.value.wallpaper.position.y += 1
    }
  } else {
    if (tabSettings.value.wallpaper.position.x - 1 >= 0) {
      tabSettings.value.wallpaper.position.x -= 1
    }
  }
}

const resizeFn = useDebounceFn(() => {
  wrapperOffset.value = innerHeight / 2
})

useEventListener('resize', resizeFn)
useEventListener('contextmenu', evt => {
  evt.preventDefault()
})

nextTick(async () => {
  const resultJSON = await chromeLocalStorage.getItem('breezeTabSettings')
  const result = JSON.parse(resultJSON!)
  try {
    const base64 = result['wallpaper']['v']
    if (!base64) {
      throw new Error()
    }
    const blob = base64ToBlob(base64)
    const _url = useObjectUrl(blob)
    wallpaperEl.value!.style.backgroundImage = `url(${_url.value})`
  } catch {
    resetWallpaper()
  }
  try {
    githubUsername.value = result['affix']['v'].split('https://github.com/')[1]
    githubIconIndex.value = githubIcons.indexOf(result['affix']['icon'])
  } catch {
    githubUsername.value = ''
    githubIconIndex.value = 0
  }
})

onMounted(() => {
  requestScreenWakeUp()
})
</script>

<style scoped>
.datetime-enter-active,
.datetime-leave-active {
  transition: opacity 0.35s ease;
}

.datetime-enter-from,
.datetime-leave-to {
  opacity: 0;
}

main {
  animation: fadeIn 350ms;
}

.wallpaper {
  inset: calc(var(--inner-offset) * var(--bg-blur));
  transition:
    background-image 0.3s,
    background-color 0.3s,
    background-position 0.3s;
  transition-timing-function: ease;
}

.mask {
  background-color: rgba(0, 0, 0, 0);
  transition:
    background-image 0.3s,
    background-color 0.3s;
  background-position: 50%;
  transition-timing-function: ease;
  inset: calc(var(--inner-offset) * var(--bg-blur));
}

.mask::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  user-select: none;
  pointer-events: none;
  z-index: 3;
  opacity: 0.2;
  width: 100%;
  height: 100%;
  background: radial-gradient(transparent 50%, black), linear-gradient(transparent, black);
}
</style>
