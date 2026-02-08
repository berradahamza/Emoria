<script setup>
import { computed, ref } from "vue";
import TopBanner from "../components/TopBanner.vue";
import { useJournalStore } from "../stores/journal";

import IconTresMal from "../components/icons/IconTresMal.vue";
import IconMal from "../components/icons/IconMal.vue";
import IconMoyen from "../components/icons/IconMoyen.vue";
import IconBien from "../components/icons/IconBien.vue";
import IconTresBien from "../components/icons/IconTresBien.vue";

const store = useJournalStore();

const selectedFilterTag = ref(null);

const moodIcons = {
  1: IconTresMal,
  2: IconMal,
  3: IconMoyen,
  4: IconBien,
  5: IconTresBien,
};

const moodLabels = {
  1: "Très mal",
  2: "Mal",
  3: "Moyen",
  4: "Bien",
  5: "Très bien",
};

const last7Dates = computed(() => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(store.toYMDLocal(d));
  }
  return dates;
});

const last7Entries = computed(() => {
  return last7Dates.value
    .map((ymd) => ({ ymd, entry: store.savedEntries[ymd] }))
    .filter(({ entry }) => {
      const m = Number(entry?.mood);
      return Number.isFinite(m) && m >= 1 && m <= 5;
    });
});

const weeklyMoodValue = computed(() => {
  const arr = last7Entries.value;
  if (arr.length === 0) return null;
  const sum = arr.reduce((acc, { entry }) => acc + Number(entry.mood), 0);
  const avg = sum / arr.length;
  return Math.min(5, Math.max(1, Math.ceil(avg)));
});

const weeklyMoodLabel = computed(() =>
  weeklyMoodValue.value ? moodLabels[weeklyMoodValue.value] : null,
);

const weeklyHaloClass = computed(() => {
  const m = Number(weeklyMoodValue.value);
  if (!m) return "bg-surface-alt";
  if (m === 1) return "bg-[#FDE2E2]";
  if (m === 2) return "bg-[#FFE3D4]";
  if (m === 3) return "bg-[#FFF3CC]";
  if (m === 4) return "bg-[#E6F4EA]";
  if (m === 5) return "bg-[#CDEED8]";
  return "bg-surface-alt";
});

// Tags uniques utilisés dans les 7 derniers jours
const last7Tags = computed(() => {
  const tagSet = new Set();
  for (const { entry } of last7Entries.value) {
    const list = Array.isArray(entry?.successList) ? entry.successList : [];
    for (const item of list) {
      if (item?.tag) tagSet.add(item.tag);
    }
  }
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
});

// Toutes les réussites des 7 derniers jours, filtrées par tag sélectionné
const last7Successes = computed(() => {
  const result = [];
  for (const { ymd, entry } of last7Entries.value) {
    const list = Array.isArray(entry?.successList) ? entry.successList : [];
    for (const item of list) {
      if (selectedFilterTag.value === '__none__' && item.tag) continue;
      if (selectedFilterTag.value && selectedFilterTag.value !== '__none__' && item.tag !== selectedFilterTag.value) continue;
      result.push({ date: ymd, text: item.text, tag: item.tag });
    }
  }
  return result;
});

const toggleFilterTag = (tag) => {
  selectedFilterTag.value = selectedFilterTag.value === tag ? null : tag;
};

const formatDateShort = (ymd) => {
  const parts = ymd.split("-");
  return `${parts[2]}/${parts[1]}`;
};
</script>

<template>
  <div class="min-h-screen bg-surface px-6 pt-10 pb-28 transition-colors duration-200">
    <h1 class="text-3xl font-extrabold text-heading mb-8">Récapitulatif</h1>

    <section class="mb-10">
      <h2 class="text-xl font-bold text-heading mb-4">Ton mood ces 7 derniers jours</h2>

      <div class="bg-surface rounded-xl border border-line p-6 shadow-sm">
        <div v-if="weeklyMoodValue" class="flex flex-col items-center">
          <div
            class="relative flex items-center justify-center w-56 h-56 rounded-full transition-colors duration-300"
            :class="weeklyHaloClass"
          >
            <component
              :is="moodIcons[weeklyMoodValue]"
              class="w-20 h-20 scale-125 transition-all duration-300"
            />
          </div>

          <div class="mt-6 text-xl font-bold text-accent-soft">
            {{ weeklyMoodLabel }}
          </div>
        </div>

        <div v-else class="text-muted text-sm text-center">
          Pas assez de données sur les 7 derniers jours.
        </div>
      </div>
    </section>

    <section>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-xl font-bold text-heading">Mes réussites</h2>
        <router-link
          to="/success-history"
          class="text-sm font-semibold text-accent-pink hover:underline"
        >
          Voir tout →
        </router-link>
      </div>
      <p class="text-sm text-muted mb-4">Tes réussites des 7 derniers jours, filtrables par tag.</p>

      <!-- Tag filter pills -->
      <div class="flex flex-wrap gap-2 mb-4" v-if="last7Tags.length > 0">
        <button
          v-for="tag in last7Tags"
          :key="tag"
          @click="toggleFilterTag(tag)"
          :class="[
            'px-4 py-1.5 rounded-full border text-xs font-bold transition-all duration-200',
            selectedFilterTag === tag
              ? 'bg-accent-vivid border-accent-vivid text-white shadow-lg'
              : 'border-accent-light text-accent-muted bg-surface',
          ]"
        >
          {{ tag }}
        </button>
        <button
          @click="toggleFilterTag('__none__')"
          :class="[
            'px-4 py-1.5 rounded-full border text-xs font-bold transition-all duration-200',
            selectedFilterTag === '__none__'
              ? 'bg-muted border-muted text-white shadow-lg'
              : 'border-line-strong text-muted bg-surface',
          ]"
        >
          Sans tag
        </button>
        <button
          v-if="selectedFilterTag"
          @click="selectedFilterTag = null"
          class="px-4 py-1.5 rounded-full border border-line-strong text-xs font-bold text-muted bg-surface transition-all"
        >
          ✕ Tous
        </button>
      </div>

      <div class="bg-surface rounded-xl border border-line p-4 shadow-sm">
        <div v-if="last7Successes.length === 0" class="text-muted text-sm text-center py-2">
          Aucune réussite trouvée{{
            selectedFilterTag ? " pour ce tag" : " sur les 7 derniers jours"
          }}.
        </div>

        <div class="space-y-3" v-else>
          <div
            v-for="(item, idx) in last7Successes"
            :key="idx"
            class="p-4 bg-surface-alt rounded-xl border border-line transition-all"
          >
            <p class="text-body font-semibold text-sm leading-snug">{{ item.text }}</p>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="text-xs text-dim">{{ formatDateShort(item.date) }}</span>
              <span
                v-if="item.tag"
                class="text-xs text-accent-vivid font-bold uppercase tracking-wider"
              >
                # {{ item.tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <TopBanner />
  </div>
</template>
