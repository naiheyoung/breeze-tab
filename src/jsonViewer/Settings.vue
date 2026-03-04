<template>
  <div>
    <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
      <div
        class="i-carbon:settings hover:cursor-pointer fixed right-4 top-4"
        @click="settingsActive = true"></div>
      <n-drawer class="font-mono" :width="502" placement="right" v-model:show="settingsActive">
        <n-drawer-content title="Settings">
          <div class="flex flex-col gap-y-4">
            <n-form-item
              :show-feedback="false"
              label="theme"
              label-placement="left"
              size="small">
              <template #label>
                <span class="i-carbon:color-palette vertical-middle"></span>
              </template>
              <n-select :options="codeThemeOptions" v-model:value="codeTheme" />
            </n-form-item>
            <n-form-item
              :show-feedback="false"
              label="fSize"
              label-placement="left"
              size="small">
              <template #label>
                <span class="i-carbon:text-font vertical-middle"></span>
              </template>
              <n-slider :max="30" :min="14" :step="1" v-model:value="textSize" />
              <n-tooltip :show-arrow="false" placement="bottom" trigger="hover">
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
import type { GlobalThemeOverrides, SelectOption } from 'naive-ui'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettings } from './settings'
import {
  darkTheme,
  NConfigProvider,
  NDrawer,
  NDrawerContent,
  NFormItem,
  NSelect,
  NSlider,
  NTooltip
} from 'naive-ui'

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
