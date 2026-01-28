import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite' // 1. Ajout du plugin Tailwind v4
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(), // 2. Activation du moteur Tailwind
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Emoria',
        short_name: 'Emoria',
        description: 'Journal quotidien',
        theme_color: '#6B46C1',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/EmoriaLogo192.png', sizes: '192x192', type: 'image/png' },
          { src: '/EmoriaLogo512.png', sizes: '512x512', type: 'image/png' },
        ]
      },
      workbox: {
        navigateFallback: '/index.html'
      }
    })
  ]
})