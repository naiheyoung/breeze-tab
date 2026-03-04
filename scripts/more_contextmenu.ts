const MENU_ID = 'view-in-npm-repo'
const URL_NPM = 'https://www.npmjs.com/package/'

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: 'View in npm',
      contexts: ['selection']
    })
  })
})

chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId !== MENU_ID || !info.selectionText?.trim()) return
  chrome.tabs.create({
    url: URL_NPM + encodeURIComponent(info.selectionText.trim())
  })
})
