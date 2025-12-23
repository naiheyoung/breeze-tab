import { createApp, watch } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
import Settings from './Settings.vue'
import { useSettings } from './settings'

import '@unocss/reset/tailwind.css'
import 'uno.css'

const app = createApp(Settings)
const pinia = createPinia()
app.use(pinia)
app.mount('#__root__')

const { codeTheme, textSize } = storeToRefs(useSettings())

let THRESHOLD = 300
let metric = 1
let lineNumberFg = ''
let nextChunk = 0

const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = chrome.runtime.getURL('jsonViewer/css/index.css')
document.head.appendChild(link)
const root = document.querySelector('#root')
const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: 'module'
})

watch(codeTheme, v => {
  worker.postMessage({ theme: v })
})

window.addEventListener('message', e => {
  if (e.data.type !== 'json') {
    return
  }
  worker.postMessage({ text: e.data.payload, theme: 'vitesse-dark' })
})

const render = (target: HTMLElement, tokens: Array<any>, start: number) => {
  const fragment = document.createDocumentFragment()
  for (let index = start; index < start + THRESHOLD; index++) {
    const token = tokens[index]
    if (!token) {
      break
    }
    const line = document.createElement('span')
    line.classList.add('line')
    const lineNumber = document.createElement('span')
    lineNumber.dataset.line = `${index + 1}`
    lineNumber.textContent = (index + 1 + '').padStart(metric, ' ')
    lineNumber.style.color = lineNumberFg
    line.appendChild(lineNumber)
    for (const _token of token) {
      const span = document.createElement('span')
      span.textContent = _token.content
      span.style.color = _token.color
      line.appendChild(span)
    }

    line.appendChild(document.createTextNode('\n'))
    fragment.appendChild(line)

    if (index === start + THRESHOLD - 10) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(line)
          render(target, tokens, start + THRESHOLD)
        }
      })
      observer.observe(line)
    }
  }
  target.appendChild(fragment)
}

worker.onmessage = e => {
  const result = e.data
  let tokens = result.tokens
  metric = (tokens.length + '').length
  const pre = document.createElement('pre')
  pre.classList.add('shiki', result.themeName)
  pre.style.color = result.fg
  pre.style.backgroundColor = result.bg
  pre.style.fontSize = '16px'
  pre.style.padding = '4px'
  pre.tabIndex = 0
  lineNumberFg = result.fg.slice(0, 7) + '59'
  watch(textSize, v => {
    pre.style.fontSize = `${v || 16}px`
  })

  render(pre, tokens, nextChunk)

  root!.textContent = ''
  root?.appendChild(pre)
}
