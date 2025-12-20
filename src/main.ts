import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

import '@unocss/reset/tailwind.css'
import '~/assets/css/index.css'
import 'uno.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#root')
