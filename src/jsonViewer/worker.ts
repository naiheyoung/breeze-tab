import { getSingletonHighlighter, Highlighter } from './shiki.bundle'

let highlighterCache = new Map<string, Highlighter>()
let codeSnippet = null

self.onmessage = async e => {
  const { text, theme = 'dracula' } = e.data
  if (text) {
    codeSnippet = text
  }

  let highlighter = highlighterCache.get(theme)
  if (!highlighter) {
    highlighter = await getSingletonHighlighter({
      themes: [theme],
      langs: ['json']
    })
    highlighterCache.set(theme, highlighter)
  }

  const result = highlighter.codeToTokens(text || codeSnippet!, {
    theme: theme,
    lang: 'json'
  })
  self.postMessage(result)
}
