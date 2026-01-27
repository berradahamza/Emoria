<script setup>
import { computed } from 'vue'
import { useJournalStore } from '../stores/journal' // Import du store
import IconTresMal from '../components/icons/IconTresMal.vue'
import IconMal from '../components/icons/IconMal.vue'
import IconMoyen from '../components/icons/IconMoyen.vue'
import IconBien from '../components/icons/IconBien.vue'
import IconTresBien from '../components/icons/IconTresBien.vue'
import BoutonContinuer from '../components/buttons/boutonContinuer.vue'

const store = useJournalStore()

const moods = [
  { id: 1, label: 'Très mal', icon: IconTresMal },
  { id: 2, label: 'Mal', icon: IconMal },
  { id: 3, label: 'Moyen', icon: IconMoyen },
  { id: 4, label: 'Bien', icon: IconBien },
  { id: 5, label: 'Très bien', icon: IconTresBien }
]

const currentMood = computed(() => moods.find(m => m.id === Number(store.mood)))
</script>

<template>
  <div class="flex flex-col items-center justify-between min-h-screen px-8 py-12 bg-white">
    <div class="w-full flex justify-end text-slate-300 text-sm font-medium">1/3</div>

    <h1 class="text-2xl font-bold text-center text-slate-900 leading-tight">
      Tu t’es <span class="text-[--color-emoria-purple]">senti(e)</span> comment <br> aujourd’hui ?
    </h1>

    <div class="relative flex items-center justify-center w-72 h-72 rounded-full bg-[#F3F3FF]">
      <component :is="currentMood.icon" class="w-32 h-32 scale-150 transition-all duration-300" />
    </div>

    <div class="w-full flex flex-col items-center gap-8">
      <span class="text-xl font-bold text-[--color-emoria-purple]">{{ currentMood.label }}</span>
      <div class="w-full px-2">
        <input type="range" min="1" max="5" step="1" v-model="store.mood" class="custom-slider" />
        <div class="flex justify-between w-full mt-4 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
          <span>Très mal</span>
          <span>Très bien</span>
        </div>
      </div>
      <router-link to="/step-positives" class="w-full flex justify-center hover:opacity-90 active:scale-95 transition-all">
        <BoutonContinuer />
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.custom-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 44px;
  background: #EBEBFF;
  border-radius: 22px;
  outline: none;
  padding: 0 4px;
}
.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
</style>