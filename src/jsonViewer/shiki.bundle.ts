/* Generate by @shikijs/codegen */
import type {
  DynamicImportLanguageRegistration,
  DynamicImportThemeRegistration,
  HighlighterGeneric,
} from '@shikijs/types'
import {
  createBundledHighlighter,
  createSingletonShorthands,
} from '@shikijs/core'
import { createJavaScriptRawEngine } from '@shikijs/engine-javascript/raw'

type BundledLanguage = 'json'
type BundledTheme =
  | 'vitesse-dark'
  | 'one-dark-pro'
  | 'github-dark-dimmed'
  | 'material-theme-darker'
  | 'dracula'
type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>

const bundledLanguages = {
  json: () => import('@shikijs/langs-precompiled/json'),
} as Record<BundledLanguage, DynamicImportLanguageRegistration>

const bundledThemes = {
  'vitesse-dark': () => import('@shikijs/themes/vitesse-dark'),
  'one-dark-pro': () => import('@shikijs/themes/one-dark-pro'),
  'github-dark-dimmed': () => import('@shikijs/themes/github-dark-dimmed'),
  'material-theme-darker': () =>
    import('@shikijs/themes/material-theme-darker'),
  dracula: () => import('@shikijs/themes/dracula'),
} as Record<BundledTheme, DynamicImportThemeRegistration>

const createHighlighter = /* @__PURE__ */ createBundledHighlighter<
  BundledLanguage,
  BundledTheme
>({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createJavaScriptRawEngine(),
})

const {
  codeToHtml,
  codeToHast,
  codeToTokensBase,
  codeToTokens,
  codeToTokensWithThemes,
  getSingletonHighlighter,
  getLastGrammarState,
} = /* @__PURE__ */ createSingletonShorthands<BundledLanguage, BundledTheme>(
  createHighlighter,
)

export {
  bundledLanguages,
  bundledThemes,
  codeToHast,
  codeToHtml,
  codeToTokens,
  codeToTokensBase,
  codeToTokensWithThemes,
  createHighlighter,
  getLastGrammarState,
  getSingletonHighlighter,
}
export type { BundledLanguage, BundledTheme, Highlighter }
