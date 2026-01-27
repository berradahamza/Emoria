<script setup>
import { useRouter } from 'vue-router'
import { useJournalStore } from '../stores/journal'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'

import IconTresMal from '../components/icons/IconTresMal.vue'
import IconMal from '../components/icons/IconMal.vue'
import IconMoyen from '../components/icons/IconMoyen.vue'
import IconBien from '../components/icons/IconBien.vue'
import IconTresBien from '../components/icons/IconTresBien.vue'

const router = useRouter()
const store = useJournalStore()

const moodIcons = {
  1: IconTresMal,
  2: IconMal,
  3: IconMoyen,
  4: IconBien,
  5: IconTresBien
}

const goToTunnel = (date = new Date()) => {
  const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date
  store.loadDate(dateString)
  router.push('/step-mood')
}
</script>

<template>
  <div class="min-h-screen bg-white px-6 py-12 font-sans overflow-x-hidden">
    <header class="mb-10">
      <h1 class="text-3xl text-slate-400">Bonjour <span class="text-[--color-emoria-purple] font-bold">Marion !</span> 👋</h1>
    </header>

    <section class="mb-12">
      <h2 class="text-xl font-bold text-slate-900 mb-4">Ma journée</h2>
      <button @click="goToTunnel()" class="w-full p-6 border-2 border-purple-100 rounded-3xl flex items-center justify-between group active:scale-95 transition-all">
        <span class="text-purple-600 font-semibold text-lg">Compléter ma journée</span>
        <div class="w-10 h-10 rounded-full border-2 border-purple-100 flex items-center justify-center text-purple-300 group-hover:bg-purple-50 transition-colors">
          <span class="text-2xl font-light">+</span>
        </div>
      </button>
    </section>

    <section>
      <h2 class="text-xl font-bold text-slate-900 mb-6">Mon calendrier</h2>
      <div class="bg-white rounded-[2.5rem] p-4 border border-slate-50 shadow-xl shadow-slate-100/30">
        <DatePicker 
          :key="store.updateCounter"
          v-model="store.selectedDate"
          expanded
          transparent
          borderless
          :attributes="store.calendarAttributes"
        >
          <template #day-content="{ day, attributes }">
            <div class="flex flex-col items-center justify-center h-full w-full relative min-h-[60px]">
              <span class="text-[10px] font-bold text-slate-300 absolute top-1">{{ day.day }}</span>
              
              <div @click="goToTunnel(day.date)" class="mt-4 flex items-center justify-center w-full h-full cursor-pointer">
                <template v-if="attributes?.length > 0 && attributes[0].customData?.mood">
                   <component 
                     :is="moodIcons[attributes[0].customData.mood]" 
                     class="w-10 h-10 transition-transform hover:scale-110" 
                   />
                </template>
                
                <div v-else class="w-8 h-8 rounded-full border border-dashed border-slate-100 flex items-center justify-center text-slate-200 hover:border-purple-200 transition-all">
                  <span class="text-lg font-light">+</span>
                </div>
              </div>
            </div>
          </template>
        </DatePicker>
      </div>
    </section>
  </div>
</template>