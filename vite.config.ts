import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { defineConfig, ResolvedConfig } from 'vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import fs from 'fs/promises'

const imgExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
const fontExts = ['.woff2', '.woff', '.ttf']

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`
    }
  },
  build: {
    outDir: 'extension',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        entryFileNames: 'js/app.js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames(chunkInfo) {
          if (chunkInfo.name?.endsWith('.css')) {
            return 'css/[name].[hash][extname]'
          }
          if (imgExts.some(ext => chunkInfo.name?.endsWith(ext))) {
            return 'images/[name].[hash][extname]'
          }
          if (fontExts.some(ext => chunkInfo.name?.endsWith(ext))) {
            return 'fonts/[name].[hash][extname]'
          }
          return 'other/[name].[hash][extname]'
        }
      }
    }
  },
  plugins: [
    VueMacros({
      defineOptions: false,
      defineModels: false,
      plugins: {
        vue: Vue({
          script: {
            propsDestructure: true,
            defineModel: true
          }
        })
      }
    }),
    AutoImport({
      imports: ['vue', '@vueuse/core'],
      dts: true,
      dirs: ['./src/composables'],
      vueTemplate: true
    }),
    Components({
      dts: true,
      resolvers: [NaiveUiResolver()]
    }),
    UnoCSS(),
    (() => {
      let resolvedConfig: ResolvedConfig

      return {
        name: 'build-static-resources',
        apply: 'build',
        configResolved(config) {
          resolvedConfig = config
        },
        async closeBundle() {
          const outPath = path.resolve(resolvedConfig.root, resolvedConfig.build.outDir)
          await fs.mkdir(outPath, { recursive: true })
          const tasks = [
            fs.cp(path.resolve(resolvedConfig.root, 'images'), path.join(outPath, 'images'), {
              recursive: true
            }),
            fs.copyFile(
              path.resolve(resolvedConfig.root, 'manifest.json'),
              path.join(outPath, 'manifest.json')
            )
          ]
          await Promise.all(tasks)
        }
      }
    })()
  ]
})
