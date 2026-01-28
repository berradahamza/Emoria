<!-- src/views/AnalyseView.vue -->
<script setup>
import { computed } from 'vue'
import TopBanner from '../components/TopBanner.vue'
import { useJournalStore } from '../stores/journal'

import IconTresMal from '../components/icons/IconTresMal.vue'
import IconMal from '../components/icons/IconMal.vue'
import IconMoyen from '../components/icons/IconMoyen.vue'
import IconBien from '../components/icons/IconBien.vue'
import IconTresBien from '../components/icons/IconTresBien.vue'

const store = useJournalStore()

const moodIcons = {
  1: IconTresMal,
  2: IconMal,
  3: IconMoyen,
  4: IconBien,
  5: IconTresBien
}

const moodLabels = {
  1: 'Très mal',
  2: 'Mal',
  3: 'Moyen',
  4: 'Bien',
  5: 'Très bien'
}

const last7Dates = computed(() => {
  const dates = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(store.toYMDLocal(d))
  }
  return dates
})

const last7Entries = computed(() => {
  return last7Dates.value
    .map((ymd) => ({ ymd, entry: store.savedEntries[ymd] }))
    .filter(({ entry }) => {
      const m = Number(entry?.mood)
      return Number.isFinite(m) && m >= 1 && m <= 5
    })
})

const weeklyMoodValue = computed(() => {
  const arr = last7Entries.value
  if (arr.length === 0) return null
  const sum = arr.reduce((acc, { entry }) => acc + Number(entry.mood), 0)
  const avg = sum / arr.length
  return Math.min(5, Math.max(1, Math.ceil(avg)))
})

const weeklyMoodLabel = computed(() => (weeklyMoodValue.value ? moodLabels[weeklyMoodValue.value] : null))

const weeklyHaloClass = computed(() => {
  const m = Number(weeklyMoodValue.value)
  if (!m) return 'bg-slate-50'
  if (m === 1) return 'bg-[#FDE2E2]'
  if (m === 2) return 'bg-[#FFE3D4]'
  if (m === 3) return 'bg-[#FFF3CC]'
  if (m === 4) return 'bg-[#E6F4EA]'
  if (m === 5) return 'bg-[#CDEED8]'
  return 'bg-slate-50'
})

const top2SuccessTags = computed(() => {
  const counts = new Map()

  for (const { entry } of last7Entries.value) {
    const list = Array.isArray(entry?.successList) ? entry.successList : []
    for (const item of list) {
      const raw = item?.tag
      if (!raw) continue
      const clean = String(raw).trim()
      if (!clean) continue
      const key = clean.toLowerCase()
      counts.set(key, { name: clean, count: (counts.get(key)?.count || 0) + 1 })
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.name.localeCompare(b.name)))
    .slice(0, 2)
    .map((x) => x.name)
})
</script>

<template>
  <div class="min-h-screen bg-white px-6 py-10">
    <TopBanner />

    <h1 class="text-3xl font-extrabold text-slate-900 mb-8">Analyse</h1>

    <!-- TITRE EN DEHORS (comme Home) -->
    <section class="mb-10">
      <h2 class="text-xl font-bold text-slate-900 mb-4">Ton mood ces 7 derniers jours</h2>

      <div class="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm">
        <div v-if="weeklyMoodValue" class="flex flex-col items-center">
          <div
            class="relative flex items-center justify-center w-64 h-64 rounded-full transition-colors duration-300"
            :class="weeklyHaloClass"
          >
            <component :is="moodIcons[weeklyMoodValue]" class="w-32 h-32 scale-150 transition-all duration-300" />
          </div>

          <div class="mt-5 text-xl font-bold text-[#6750A3]">
            {{ weeklyMoodLabel }}
          </div>
        </div>

        <div v-else class="text-slate-400 text-sm">
          Pas assez de données sur les 7 derniers jours.
        </div>
      </div>
    </section>

    <!-- TITRE + SOUS-TEXTE EN DEHORS (comme Home) -->
    <section>
      <h2 class="text-xl font-bold text-slate-900 mb-2">Mes plus grands succès</h2>
      <p class="text-sm text-slate-400 mb-4">
        Tags les plus fréquents sur tes réussites des 7 derniers jours.
      </p>

      <div class="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm">
        <div class="flex flex-wrap gap-2">
          <span v-if="top2SuccessTags.length === 0" class="text-slate-400 text-sm">
            Aucun tag trouvé sur tes réussites récentes.
          </span>

          <span
            v-for="t in top2SuccessTags"
            :key="t"
            class="px-4 py-2 rounded-full border border-[#C46BCF]/30 bg-[#C46BCF]/10 text-[#C46BCF] text-sm font-bold"
          >
            {{ t }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>
