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
  <div class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-14 bg-white border-t border-slate-100 px-6 flex items-center justify-between z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">

    <div class="flex items-center gap-6">
      <button
        @click="goHome"
        class="flex flex-col items-center justify-center active:scale-95 transition-all"
        :class="router.currentRoute.value.path === '/home' ? 'text-[#6750A3]' : 'text-slate-300'"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.5 10.5V21h11V10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button
        @click="goAnalyse"
        class="flex flex-col items-center justify-center active:scale-95 transition-all"
        :class="router.currentRoute.value.path === '/analysis' ? 'text-[#6750A3]' : 'text-slate-300'"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M4 19V5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M8 19V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 19V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M16 19V14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M20 19V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <button
      @click="logout"
      class="text-red-300 hover:text-red-500 active:scale-95 transition-all"
      title="Déconnexion"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
    </button>
  </div>
</template>
