const MAX_JSON_SIZE = 1_080_000
const THRESHOLD = 3000

const validateJSON = (text: string) => {
  text = text.trim()
  /* if (text.length > MAX_JSON_SIZE) {
    console.warn(
      'Breeze Tab:',
      'JSON data is too large, so formatting will no longer be performed.'
    )
    return false
  } */
  if (!/^\s*(\{[\s\S]*\}|\[[\s\S]*\])\s*$/.test(text)) {
    return false
  }
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

;(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const target = document.body.children[0] as HTMLPreElement
    if (target.tagName !== 'PRE') {
      return
    }
    const valid = validateJSON(target.textContent)
    if (!valid) {
      return
    }
    target.style.display = 'none'
    target.style.position = 'absolute'
    target.style.zIndex = '-1'
    ;(document.body.querySelector(
      '.json-formatter-container'
    ) as HTMLDivElement)!.style.display = 'none'
    document.body.style.overflow = 'hidden'
    const style = document.createElement('style')
    style.textContent = 'body>:not(#BreezeTabJSONFormatter){display: none;opacity: 0;}'
    document.head.appendChild(style)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = chrome.runtime.getURL('jsonViewer/css/index.css')
    document.head.appendChild(link)
    const iframe = document.createElement('iframe')
    iframe.id = 'BreezeTabJSONFormatter'
    iframe.src = chrome.runtime.getURL('jsonViewer/index.html')
    iframe.style.position = 'fixed'
    iframe.style.inset = '0'
    iframe.style.zIndex = '3'
    document.body.appendChild(iframe)
    iframe.onload = () => {
      const parseJSON = JSON.parse(target.textContent)
      iframe.contentWindow?.postMessage(
        { type: 'json', payload: JSON.stringify(parseJSON, null, 2) },
        '*'
      )
    }
  })
})()
