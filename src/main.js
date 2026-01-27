import './assets/main.css' // 1. IMPORTANT : Charge Tailwind et ton design Figma

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 2. Initialisation de Firebase (Optionnel ici, mais propre pour le suivi)
import './firebase/config' 

const app = createApp(App)

app.use(createPinia()) // Ton "Contrôleur" pour l'architecture MVC
app.use(router)

app.mount('#app')