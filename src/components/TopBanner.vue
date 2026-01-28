<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goHome = () => router.push('/home')
const goAnalyse = () => router.push('/analysis')

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="w-full flex items-center justify-between mb-6">
    <div class="flex items-center gap-2">
      <!-- Home -->
      <button
        @click="goHome"
        class="w-10 h-10 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-center active:scale-95 transition-all"
        aria-label="Accueil"
        title="Accueil"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 10.5L12 3l9 7.5" stroke="#6750A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.5 10.5V21h11V10.5" stroke="#6750A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Analyse -->
      <button
        @click="goAnalyse"
        class="w-10 h-10 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-center active:scale-95 transition-all"
        aria-label="Analyse"
        title="Analyse"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M4 19V5" stroke="#6750A3" stroke-width="2" stroke-linecap="round"/>
          <path d="M8 19V11" stroke="#6750A3" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 19V8" stroke="#6750A3" stroke-width="2" stroke-linecap="round"/>
          <path d="M16 19V14" stroke="#6750A3" stroke-width="2" stroke-linecap="round"/>
          <path d="M20 19V6" stroke="#6750A3" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Déconnexion -->
    <button
      @click="logout"
      class="px-3 py-2 rounded-xl border border-red-200 bg-white text-red-500 text-sm font-semibold active:scale-95 transition-all"
    >
      Déconnexion
    </button>
  </div>
</template>
