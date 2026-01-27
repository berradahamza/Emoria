<script setup>
import { useJournalStore } from '../stores/journal'
import BoutonContinuer from '../components/buttons/boutonContinuer.vue'

const store = useJournalStore()
</script>

<template>
  <div class="flex flex-col items-center justify-between min-h-screen px-8 py-12 bg-white font-sans">
    <div class="w-full flex justify-end text-slate-300 text-sm font-medium">2/3</div>

    <div class="w-full">
      <h1 class="text-2xl font-bold text-center text-slate-900 mb-8 leading-tight">
        Liste <span class="text-[--color-emoria-purple]">5 points positifs</span> <br> de ta journée ☀️
      </h1>

      <div class="bg-white rounded-[2.5rem] p-8 min-h-[400px] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
        <p class="text-slate-400 text-sm italic mb-6 leading-relaxed">
          Si tu as du mal à trouver des points positifs c’est que tu cherches des choses trop compliquées :)
        </p>
        <textarea 
          v-model="store.positivesText"
          placeholder="Ex: Mon café était super bon, j'ai vu un ami..."
          class="w-full h-64 bg-transparent outline-none focus:ring-0 text-slate-600 placeholder-slate-200 resize-none leading-relaxed"
        ></textarea>
      </div>
    </div>

    <router-link to="/step-success" class="w-full flex justify-center hover:opacity-90 active:scale-95 transition-all">
      <BoutonContinuer />
    </router-link>
  </div>
</template>