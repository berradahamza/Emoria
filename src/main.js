// Firebase MUST be initialized before any component imports it indirectly.
import './firebase/config'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { useAuthStore } from './stores/auth'

import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// attendre la restauration Firebase (évite redirection login au refresh)
const authStore = useAuthStore()
authStore.initAuthListener().then(() => {
  app.mount('#app')
})
