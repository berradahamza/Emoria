import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './firebase/config'
import { useAuthStore } from './stores/auth'

import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

app.use(router)

const authStore = useAuthStore()
authStore.initAuthListener()

app.mount('#app')
