<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJournalStore } from '../stores/journal'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import TopBanner from '../components/TopBanner.vue' // C'est maintenant ta barre du bas

import IconTresMal from '../components/icons/IconTresMal.vue'
import IconMal from '../components/icons/IconMal.vue'
import IconMoyen from '../components/icons/IconMoyen.vue'
import IconBien from '../components/icons/IconBien.vue'
import IconTresBien from '../components/icons/IconTresBien.vue'

import { useAuthStore } from '../stores/auth'

const router = useRouter()
const store = useJournalStore()
const authStore = useAuthStore()

const moodIcons = {
  1: IconTresMal,
  2: IconMal,
  3: IconMoyen,
  4: IconBien,
  5: IconTresBien
}

// ===== Dates en LOCAL (PAS de toISOString) =====
const toYMDLocal = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const todayYMD = computed(() => toYMDLocal(new Date()))

// journée “remplie” = mood + (positifs remplis) + (au moins 1 réussite)
const todayEntry = computed(() => store.savedEntries[todayYMD.value] || null)
const todayIsFilled = computed(() => {
  const e = todayEntry.value
  if (!e) return false
  const hasMood = !!e.mood
  const hasPositives = String(e.positivesText || '').trim().length > 0
  const hasSuccess = Array.isArray(e.successList) && e.successList.length > 0
  return hasMood && hasPositives && hasSuccess
})

// Le cercle bleu (sélection v-calendar) ne doit être visible QUE sur aujourd’hui
// ET uniquement si aujourd’hui n’est pas rempli.
const pickerModelValue = computed(() => (todayIsFilled.value ? null : todayYMD.value))

const goToTunnel = (date = new Date()) => {
  const dateString = date instanceof Date ? toYMDLocal(date) : String(date)
  store.loadDate(dateString)
  router.push('/step-mood')
}

// Bonjour + prénom dynamique
const userFirstName = computed(() => {
  const u = authStore.user || {}
  const raw =
    u.displayName ||
    u.name ||
    (u.email ? String(u.email).split('@')[0] : '') ||
    'toi'
  return String(raw).trim().split(' ')[0]
})

// couleurs pastilles
const POSITIVE_COLOR = '#4F6CCF'
const SUCCESS_COLOR = '#C46BCF'
</script>

<template>
  <div class="min-h-screen bg-white px-6 pt-12 pb-28 font-sans overflow-x-hidden">

    <header class="mb-10">
      <h1 class="text-3xl text-slate-400">
        Bonjour
        <span class="font-bold text-[#6750A3]">
          {{ userFirstName }} !
        </span>
        👋
      </h1>
    </header>

    <section class="mb-12">
      <h2 class="text-xl font-bold text-slate-900 mb-4">Ma journée</h2>

      <button
        v-if="!todayIsFilled"
        @click="goToTunnel(new Date())"
        class="w-full px-5 py-4 border border-purple-200 rounded-2xl flex items-center justify-between active:scale-95 transition-all"
      >
        <span class="text-[#6750A3] font-semibold text-base">
          Compléter ma journée
        </span>

        <div class="w-10 h-10 rounded-full border border-dashed border-purple-200 flex items-center justify-center text-purple-300">
          <span class="text-2xl font-light leading-none">+</span>
        </div>
      </button>

      <button
        v-else
        @click="goToTunnel(new Date())"
        class="w-full px-5 py-4 border border-purple-200 rounded-2xl flex items-center justify-between active:scale-95 transition-all"
      >
        <span class="text-[#6750A3] font-semibold text-base">
          Bravo, tu as complété ta journée
        </span>

        <div class="w-10 h-10 rounded-full border border-purple-200 flex items-center justify-center text-[#6750A3]">
          <span class="text-lg leading-none">👏</span>
        </div>
      </button>
    </section>

    <section>
      <h2 class="text-xl font-bold text-slate-900 mb-6">Mon calendrier</h2>

      <div class="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm">
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
            <div class="flex flex-col items-center justify-center h-full w-full relative min-h-[70px]">
              <span class="text-[10px] font-bold text-slate-300 absolute top-1">
                {{ day.day }}
              </span>

              <div
                class="flex flex-col items-center justify-center w-full h-full cursor-pointer gap-1"
                @click="goToTunnel(day.date)"
              >
                <template v-if="attributes?.length > 0 && attributes[0].customData?.mood">
                  <component
                    :is="moodIcons[attributes[0].customData.mood]"
                    class="w-6 h-6 object-contain"
                  />

                  <div class="flex items-center justify-center gap-1 mt-0.5">
                    <span
                      v-if="String(attributes[0].customData.positivesText || '').trim().length > 0"
                      class="w-2 h-2 rounded-full"
                      :style="{ backgroundColor: POSITIVE_COLOR }"
                    />
                    <span
                      v-if="Array.isArray(attributes[0].customData.successList) && attributes[0].customData.successList.length > 0"
                      class="w-2 h-2 rounded-full"
                      :style="{ backgroundColor: SUCCESS_COLOR }"
                    />
                  </div>
                </template>

                <div
                  v-else
                  class="w-9 h-9 rounded-full border border-dashed border-slate-200
                        bg-slate-50/40
                        flex items-center justify-center
                        text-slate-300
                        transition-all"
                >
                  <span class="text-xl font-light leading-none">+</span>
                </div>

              </div>
            </div>
          </template>
        </DatePicker>
      </div>
    </section>

    <TopBanner />

  </div>
</template>
