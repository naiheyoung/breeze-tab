<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <main
      font-mono
      text="center gray-700 dark:gray-200"
      w-full
      h-full
      overflow-hidden
      select-none>
      <div
        class="mask absolute block z-3 pointer-events-none opacity100 bg-no-repeat bg-cover"></div>
      <div
        ref="wallpaper"
        class="wallpaper absolute bg-cover opacity100 bg-no-repeat"
        :style="{
          filter: `blur(var(--bg-blur))`
        }"></div>
      <div class="content overflow-hidden fixed z-9 flex w-full h-full">
        <div
          class="wrapper flex mx-auto flex-col transition-all duration-350 items-center justify-center"
          :style="{ marginTop: `-${wrapperOffset}px` }">
          <TransitionGroup name="datetime">
            <div
              class="time text-6.875rem leading-6.875rem transition-colors"
              style="color: rgba(255, 255, 255, 0.62)"
              :style="{ color: tabSettings.time.color }"
              v-text="format(timeFormatter)"
              v-if="tabSettings.time.active"></div>
            <div
              class="date transition-colors"
              :style="{ color: tabSettings.date.color }"
              v-text="format(dateFormatter)"
              v-if="tabSettings.date.active"></div>
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
              <a href="https://google.com" class="i-logos:google-icon"></a>
            </div>
            <div class="hover:cursor-pointer" v-if="tabSettings.search.engine === 'bing'">
              <a href="https://bing.com" class="i-logos:bing"></a>
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
        v-model:show="settingsBoxActive"
        :width="502"
        :placement="placement"
        :auto-focus="false">
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
            <n-collapse-item title="Datetime" name="datetime">
              <template #arrow>&nbsp;</template>
              <template #header><span class="relative">Datetime</span></template>
              <template #header-extra>
                <div class="i-carbon:calendar-settings"></div>
              </template>
              <div flex flex-col gap-y-2 font-mono>
                <!-- time -->
                <n-form-item
                  label="time"
                  label-placement="left"
                  size="small"
                  :show-feedback="false">
                  <div class="flex gap-x-2 items-center w-full">
                    <n-switch v-model:value="tabSettings.time.active" size="small">
                      <template #checked-icon>
                        <div class="i-carbon:alarm"></div>
                      </template>
                    </n-switch>
                    <n-input
                      v-model:value="tabSettings.time.formatter"
                      placeholder="enter time formatter"
                      :disabled="!tabSettings.time.active" />
                    <n-color-picker
                      class="w-27.5"
                      size="small"
                      :swatches="['rgba(255, 255, 255, 0.62)']"
                      :disabled="!tabSettings.time.active"
                      v-model:value="tabSettings.time.color" />
                  </div>
                </n-form-item>
                <!-- date -->
                <n-form-item
                  label="date"
                  label-placement="left"
                  size="small"
                  :show-feedback="false">
                  <div class="flex gap-x-2 items-center w-full">
                    <n-switch v-model:value="tabSettings.date.active" size="small">
                      <template #checked-icon>
                        <div class="i-carbon:calendar"></div>
                      </template>
                    </n-switch>
                    <n-input
                      v-model:value="tabSettings.date.formatter"
                      placeholder="enter date formatter"
                      :disabled="!tabSettings.date.active" />
                    <n-color-picker
                      class="w-27.5"
                      size="small"
                      :swatches="['rgb(229, 231, 235)']"
                      :disabled="!tabSettings.date.active"
                      v-model:value="tabSettings.date.color" />
                  </div>
                </n-form-item>
                <!-- week -->
                <n-form-item
                  label="week"
                  label-placement="left"
                  size="small"
                  :show-feedback="false">
                  <div class="flex gap-x-2 items-center">
                    <n-radio-group
                      v-model:value="tabSettings.week.locale"
                      name="week"
                      :disabled="!tabSettings.date.active"
                      size="small"
                      @update:value="weekLocaleUpdateFn">
                      <n-radio-button
                        v-for="locale in weekLocale"
                        :key="locale.value"
                        :value="locale.value"
                        :label="locale.label" />
                    </n-radio-group>
                  </div>
                </n-form-item>
              </div>
            </n-collapse-item>
            <!-- background -->
            <n-collapse-item title="Background" name="background">
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
              <div flex flex-col gap-y-2 font-mono>
                <div ref="uploadWrapper" class="bg-cover bg-no-repeat">
                  <n-upload
                    ref="uploadRef"
                    directory-dnd
                    accept=".jpg,.jpeg,.png"
                    :custom-request="wallpaperUpload"
                    :show-file-list="false">
                    <n-upload-dragger class="py-48.4px">
                      <div style="margin-bottom: 12px">
                        <div class="i-lucide:wallpaper text-2xl"></div>
                      </div>
                      <span>select your wallpaper(max size 5MB)</span>
                    </n-upload-dragger>
                  </n-upload>
                </div>
                <n-form-item
                  label="image url"
                  label-placement="left"
                  size="small"
                  :show-feedback="false">
                  <div class="flex gap-x-2 items-center w-full">
                    <n-input v-model:value="imageUrl" placeholder="enter wallpaper url">
                      <template #prefix>
                        <div class="i-carbon:url"></div>
                      </template>
                    </n-input>
                    <n-button @click="setWallpaperByUrl($event)">set</n-button>
                  </div>
                </n-form-item>
                <n-form-item
                  label="blur"
                  label-placement="left"
                  size="small"
                  :show-feedback="false">
                  <div class="flex gap-x-2 items-center w-full">
                    <n-slider v-model:value="tabSettings.wallpaper.blur" :step="1" :max="20" />
                  </div>
                </n-form-item>
              </div>
            </n-collapse-item>
            <!-- search -->
            <n-collapse-item title="Search" name="search">
              <template #arrow>&nbsp;</template>
              <template #header><span class="relative">SearchEngine</span></template>
              <template #header-extra>
                <div class="i-carbon:contour-finding"></div>
              </template>
              <div flex flex-col gap-y-2 font-mono>
                <n-form-item
                  label="search"
                  label-placement="left"
                  size="small"
                  :show-feedback="false">
                  <div class="flex gap-x-2 items-center">
                    <n-switch v-model:value="tabSettings.search.active" size="small">
                      <template #checked-icon>
                        <div class="i-carbon:ibm-engineering-workflow-mgmt"></div>
                      </template>
                    </n-switch>
                    <n-radio-group
                      v-model:value="tabSettings.search.engine"
                      name="search"
                      :disabled="!tabSettings.search.active"
                      size="small">
                      <n-radio-button
                        v-for="engine in searchEngine"
                        :key="engine.label"
                        :value="engine.label.toLowerCase()"
                        :label="engine.label"
                        :disabled="engine.label === 'Baidu' || engine.label === 'baidu'" />
                    </n-radio-group>
                  </div>
                </n-form-item>
              </div>
            </n-collapse-item>
            <!-- affix -->
            <n-collapse-item title="Affix" name="affix">
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
              <div flex flex-col gap-y-2 font-mono>
                <n-form-item
                  label="github"
                  label-placement="left"
                  size="small"
                  :show-feedback="false">
                  <div class="flex gap-x-2 items-center">
                    <n-switch v-model:value="tabSettings.affix.active" size="small">
                      <template #checked-icon>
                        <div class="i-lucide:github"></div>
                      </template>
                    </n-switch>
                    <n-input
                      v-model:value="githubUsername"
                      :disabled="!tabSettings.affix.active"
                      placeholder="username">
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
import { storeToRefs } from 'pinia'
import { useStore } from './stores/extension'
import { darkTheme, GlobalThemeOverrides } from 'naive-ui'
import type { DrawerPlacement, UploadCustomRequestOptions } from 'naive-ui'

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
    githubUsername.value = 'https://github.com/'
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
  background-position: 50%;
  transition:
    background-image 0.3s,
    background-color 0.3s;
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
