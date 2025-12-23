import path, { dirname } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig, ResolvedConfig } from 'vite'
import fs from 'fs/promises'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ command }) => ({
  base: '/jsonViewer/',
  root:
    command === 'serve'
      ? path.resolve(dirname(fileURLToPath(import.meta.url)), 'src/jsonViewer')
      : '',
  worker: {
    format: 'es'
  },
  build: {
    outDir: 'extension/jsonViewer',
    rollupOptions: {
      input: {
        content: 'scripts/content.ts',
        iframe: path.resolve(process.cwd(), 'src/jsonViewer', 'index.html'),
        main: path.resolve(
          dirname(fileURLToPath(import.meta.url)),
          'src/jsonViewer/index.html'
        )
      },
      output: {
        entryFileNames: 'js/[name].js',
        format: 'es'
      }
    }
  },
  plugins: [
    Vue(),
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
          const cssPath = path.resolve(outPath, 'css')
          await fs.mkdir(cssPath, { recursive: true })
          const tasks = [
            fs.copyFile(
              path.resolve(resolvedConfig.root, 'src/jsonViewer', 'css/index.css'),
              path.join(cssPath, 'index.css')
            ),
            fs.rename(
              path.resolve(outPath, 'src/jsonViewer/index.html'),
              path.join(outPath, 'index.html')
            ),
            fs.rm(path.resolve(outPath, 'src'), {
              recursive: true,
              force: true
            })
          ]
          await Promise.all(tasks)
        }
      }
    })()
  ]
}))
