<template>
  <div>
    <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
      <div
        class="i-carbon:settings hover:cursor-pointer fixed right-4 top-4"
        @click="settingsActive = true"></div>
      <n-drawer v-model:show="settingsActive" :width="502" placement="right" class="font-mono">
        <n-drawer-content title="Settings">
          <div class="flex flex-col gap-y-4">
            <n-form-item
              label="theme"
              size="small"
              label-placement="left"
              :show-feedback="false">
              <template #label>
                <span class="i-carbon:color-palette vertical-middle"></span>
              </template>
              <n-select v-model:value="codeTheme" :options="codeThemeOptions" />
            </n-form-item>
            <n-form-item
              label="fSize"
              size="small"
              label-placement="left"
              :show-feedback="false">
              <template #label>
                <span class="i-carbon:text-font vertical-middle"></span>
              </template>
              <n-slider v-model:value="textSize" :step="1" :max="30" :min="14" />
              <n-tooltip :show-arrow="false" trigger="hover" placement="bottom">
                <template #trigger>
                  <span class="w-fit">(temporary)</span>
                </template>
                <span>临时</span>
              </n-tooltip>
            </n-form-item>
          </div>
        </n-drawer-content>
      </n-drawer>
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettings } from './settings'
import {
  NConfigProvider,
  darkTheme,
  NDrawer,
  NDrawerContent,
  NFormItem,
  NSelect,
  NSlider,
  NTooltip
} from 'naive-ui'
import type { GlobalThemeOverrides, SelectOption } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#646cffFF',
    primaryColorHover: '#7077ffFF',
    primaryColorPressed: '#4f58e6FF',
    primaryColorSuppl: 'rgba(100, 108, 255, 0.85)'
  }
}

const { codeTheme, textSize } = storeToRefs(useSettings())

const settingsActive = ref(false)
const codeThemeOptions: Array<SelectOption> = [
  {
    label: 'Vitesse Dark',
    value: 'vitesse-dark'
  },
  {
    label: 'One Dark Pro',
    value: 'one-dark-pro'
  },
  {
    label: 'Github Dark Dimmed',
    value: 'github-dark-dimmed'
  },
  {
    label: 'Material Theme Darker',
    value: 'material-theme-darker'
  },
  {
    label: 'Dracula',
    value: 'dracula'
  }
]
</script>

<style>
#__root__ {
  width: 0;
  height: 0;
}

.n-slider + span {
  word-break: keep-all;
}
</style>
