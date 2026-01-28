<script setup>
import { useRouter } from 'vue-router'
import { useJournalStore } from '../stores/journal'
import BoutonContinuer from '../components/buttons/boutonContinuer.vue'

const router = useRouter()
const store = useJournalStore()

const goBack = () => {
  router.push('/step-mood')
}
</script>

<template>
  <div class="flex flex-col items-center justify-between min-h-screen px-6 py-12 bg-white font-sans">

    <div class="w-full flex justify-between items-center">
      <button
        @click="goBack"
        class="p-2 -ml-2 text-slate-400 hover:text-slate-600 active:scale-95 transition-all"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      <div class="text-slate-300 text-sm font-medium">2/3</div>
    </div>

    <div class="w-full">
      <h1 class="text-2xl font-bold text-center text-slate-900 mb-8 leading-tight">
        Liste <span class="text-[#4F6CCF]">5 points positifs</span> <br> de ta journée ☀️
      </h1>

      <div class="bg-white rounded-xl p-6 min-h-[400px] border border-slate-100 shadow-sm">

        <textarea
          v-model="store.positivesText"
          placeholder="Si tu as du mal à trouver des points positifs c’est que tu cherches des choses trop compliquées :)"
          class="w-full h-full min-h-[350px] bg-transparent outline-none focus:ring-0 text-slate-600 placeholder-slate-300 italic resize-none leading-relaxed"
        />
      </div>
    </div>

    <router-link to="/step-success" class="w-full flex justify-center hover:opacity-90 active:scale-95 transition-all">
      <BoutonContinuer />
    </router-link>
  </div>
</template>
