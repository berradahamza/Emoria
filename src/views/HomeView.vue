<script setup>
import { computed } from 'vue'
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

import { useAuthStore } from '../stores/auth'
const authStore = useAuthStore()
const logout = async () => { await authStore.logout() }


// ===== Dates en LOCAL (PAS de toISOString) =====
const toYMDLocal = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const todayYMD = computed(() => toYMDLocal(new Date()))
const todayIsFilled = computed(() => !!store.savedEntries[todayYMD.value])

// Le cercle bleu (sélection v-calendar) ne doit être visible QUE sur aujourd’hui
// ET uniquement si aujourd’hui n’est pas rempli. Sinon : aucune sélection => pas de cercle bleu.
const pickerModelValue = computed(() => (todayIsFilled.value ? null : todayYMD.value))

const goToTunnel = (date = new Date()) => {
  const dateString = date instanceof Date ? toYMDLocal(date) : String(date)
  store.loadDate(dateString)
  router.push('/step-mood')
}
</script>


<template>
  <div class="min-h-screen bg-white px-6 py-12 font-sans overflow-x-hidden">
    <header class="mb-10">
      <h1 class="text-3xl text-slate-400">
        Bonjour <span class="text-[--color-emoria-purple] font-bold">Marion !</span> 👋
      </h1>
    </header>

    <section class="mb-12">
      <h2 class="text-xl font-bold text-slate-900 mb-4">Ma journée</h2>
      <button
        @click="goToTunnel(new Date())"
        class="w-full p-6 border-2 border-purple-100 rounded-3xl flex items-center justify-between group active:scale-95 transition-all"
      >
        <span class="text-purple-600 font-semibold text-lg">Compléter ma journée</span>
        <div
          class="w-10 h-10 rounded-full border-2 border-purple-100 flex items-center justify-center text-purple-300 group-hover:bg-purple-50 transition-colors"
        >
          <span class="text-2xl font-light">+</span>
        </div>
      </button>
    </section>

    <section>
      <h2 class="text-xl font-bold text-slate-900 mb-6">Mon calendrier</h2>
      <div class="bg-white rounded-[2.5rem] p-4 border border-slate-50 shadow-xl shadow-slate-100/30">
        <DatePicker
          :key="store.updateCounter"
          :model-value="pickerModelValue"
          @update:modelValue="() => {}"
          :model-config="{ type: 'string', mask: 'YYYY-MM-DD' }"
          expanded
          transparent
          borderless
          :attributes="store.calendarAttributes"
        >
          <template #day-content="{ day, attributes }">
            <div class="flex flex-col items-center justify-center h-full w-full relative min-h-[60px]">
              <span class="text-[10px] font-bold text-slate-300 absolute top-1">{{ day.day }}</span>

              <div class="flex items-center justify-center w-full h-full cursor-pointer"

                @click="goToTunnel(day.date)"
              >
                <!-- Si la journée est remplie => emoji (PAS le cercle bleu) -->
                <template v-if="attributes?.length > 0 && attributes[0].customData?.mood">
                <component
                :is="moodIcons[attributes[0].customData.mood]"
                class="w-6 h-6 object-contain"
                />
                </template>

                <!-- Sinon => + -->
                <div
                  v-else
                  class="w-8 h-8 rounded-full border border-dashed border-slate-100 flex items-center justify-center text-slate-200 hover:border-purple-200 transition-all"
                >
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
