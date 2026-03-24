<script setup>
import { ref, computed } from "vue";
import { useJournalStore } from "../stores/journal";
import TopBanner from "../components/TopBanner.vue";

import IconTresMal from "../components/icons/IconTresMal.vue";
import IconMal from "../components/icons/IconMal.vue";
import IconMoyen from "../components/icons/IconMoyen.vue";
import IconBien from "../components/icons/IconBien.vue";
import IconTresBien from "../components/icons/IconTresBien.vue";

const store = useJournalStore();

const FACTOR_LABELS = {
  amis: "👥 Amis",
  animal: "🐱 Animal",
  famille: "👨‍👩‍👧 Famille",
  loisir: "🎿 Loisir",
  meteo: "☀️ Météo",
  partenaire: "❤️ Partenaire",
  projet: "🎯 Projet",
  sante: "🩺 Santé",
  sortie: "🍽️ Sortie",
  sport: "⚽ Sport",
  travail: "💼 Travail",
  deuil: "🕯️ Deuil",
};

const moodIcons = { 1: IconTresMal, 2: IconMal, 3: IconMoyen, 4: IconBien, 5: IconTresBien };
const moodLabels = { 1: "Très mal", 2: "Mal", 3: "Moyen", 4: "Bien", 5: "Très bien" };

const periods = [
  { key: "30d", label: "30 jours" },
  { key: "3m", label: "3 mois" },
  { key: "6m", label: "6 mois" },
];
const activePeriod = ref("30d");

function getDateCutoff(periodKey) {
  const now = new Date();
  if (periodKey === "30d") now.setDate(now.getDate() - 30);
  else if (periodKey === "3m") now.setMonth(now.getMonth() - 3);
  else now.setMonth(now.getMonth() - 6);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const filteredEntries = computed(() => {
  void store.updateCounter;
  const cutoff = getDateCutoff(activePeriod.value);
  return Object.entries(store.savedEntries)
    .filter(([dateKey]) => dateKey >= cutoff)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, entry]) => ({ dateKey, ...entry }));
});

const entryCount = computed(() => filteredEntries.value.length);

const avgMood = computed(() => {
  const entries = filteredEntries.value.filter((e) => e.mood);
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, e) => acc + Number(e.mood), 0);
  return sum / entries.length;
});

const avgMoodRounded = computed(() => (avgMood.value !== null ? Math.round(avgMood.value) : 3));

const moodTrend = computed(() => {
  return filteredEntries.value
    .filter((e) => e.mood)
    .map((e) => ({ date: e.dateKey, mood: Number(e.mood) }));
});

function rankFactors(key) {
  const counts = {};
  for (const entry of filteredEntries.value) {
    const arr = entry[key];
    if (!Array.isArray(arr)) continue;
    for (const f of arr) {
      counts[f] = (counts[f] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([id, count]) => ({ id, label: FACTOR_LABELS[id] || id, count }))
    .sort((a, b) => b.count - a.count);
}

const topGoodFactors = computed(() => rankFactors("goodFactors"));
const topBadFactors = computed(() => rankFactors("badFactors"));

// Sparkline path
const sparklinePath = computed(() => {
  const pts = moodTrend.value;
  if (pts.length < 2) return "";
  const w = 280;
  const h = 100;
  const pad = 8;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const stepX = innerW / (pts.length - 1);
  return pts
    .map((p, i) => {
      const x = pad + i * stepX;
      const y = pad + innerH - ((p.mood - 1) / 4) * innerH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
});

const sparklineDots = computed(() => {
  const pts = moodTrend.value;
  if (pts.length < 2) return [];
  const w = 280;
  const h = 100;
  const pad = 8;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const stepX = innerW / (pts.length - 1);
  return pts.map((p, i) => ({
    x: pad + i * stepX,
    y: pad + innerH - ((p.mood - 1) / 4) * innerH,
    mood: p.mood,
  }));
});

// Streak: consecutive days filled ending today
const currentStreak = computed(() => {
  void store.updateCounter;
  let streak = 0;
  const d = new Date();
  while (true) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${day}`;
    if (store.savedEntries[key]?.mood) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
});

// Bar width percentage for factor ranking
function barPercent(count) {
  return `${Math.min(100, (count / entryCount.value) * 100)}%`;
}
</script>

<template>
  <div class="min-h-screen bg-surface px-6 pt-10 pb-28 font-sans transition-colors duration-200">
    <!-- Title -->
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-heading">Tableau de bord</h1>
      <p class="text-sm text-muted mt-1">Tes statistiques en un coup d'œil</p>
    </header>

    <!-- Period Tabs -->
    <div class="flex gap-2 mb-8">
      <button
        v-for="p in periods"
        :key="p.key"
        @click="activePeriod = p.key"
        class="px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
        :class="
          activePeriod === p.key
            ? 'bg-accent text-white shadow-sm'
            : 'bg-surface-alt text-muted border border-line'
        "
      >
        {{ p.label }}
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="entryCount === 0"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <div class="text-5xl mb-4">📊</div>
      <p class="text-heading font-semibold text-lg">Pas encore de données</p>
      <p class="text-muted text-sm mt-1 max-w-65">
        Remplis ton journal quotidien pour voir apparaître tes statistiques ici !
      </p>
    </div>

    <template v-else>
      <!-- Row 1 : Mood average + Streak -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <!-- Mood average -->
        <div
          class="col-span-2 bg-surface-alt rounded-2xl p-5 border border-line flex items-center gap-4"
        >
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
            :class="{
              'bg-[#FDE2E2]': avgMoodRounded === 1,
              'bg-[#FFE3D4]': avgMoodRounded === 2,
              'bg-[#FFF3CC]': avgMoodRounded === 3,
              'bg-[#E6F4EA]': avgMoodRounded === 4,
              'bg-[#CDEED8]': avgMoodRounded === 5,
            }"
          >
            <component :is="moodIcons[avgMoodRounded]" class="w-10 h-10" />
          </div>
          <div>
            <p class="text-xs text-muted font-medium uppercase tracking-wide mb-0.5">
              Humeur moyenne
            </p>
            <p class="text-2xl font-bold text-heading leading-none">
              {{ avgMood.toFixed(1) }}
              <span class="text-sm font-normal text-muted">/5</span>
            </p>
            <p class="text-xs text-body mt-0.5">{{ moodLabels[avgMoodRounded] }}</p>
          </div>
        </div>

        <!-- Streak -->
        <div
          class="bg-surface-alt rounded-2xl p-4 border border-line flex flex-col items-center justify-center text-center"
        >
          <p class="text-3xl font-bold text-accent leading-none">{{ currentStreak }}</p>
          <p class="text-[10px] text-muted font-semibold uppercase tracking-wide mt-1">
            jour{{ currentStreak > 1 ? "s" : "" }}<br />d'affilée
          </p>
          <p class="text-lg mt-0.5">🔥</p>
        </div>
      </div>

      <!-- Sparkline / Mood trend -->
      <div
        v-if="moodTrend.length >= 2"
        class="bg-surface-alt rounded-2xl p-5 border border-line mb-6"
      >
        <p class="text-xs text-muted font-semibold uppercase tracking-wide mb-3">
          Évolution de l'humeur
        </p>
        <div class="flex items-stretch gap-2">
          <div class="flex-1 overflow-hidden">
            <svg viewBox="0 0 280 100" class="w-full h-24" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line
                v-for="i in 5"
                :key="'grid-' + i"
                :x1="8"
                :x2="272"
                :y1="8 + ((5 - i) / 4) * 84"
                :y2="8 + ((5 - i) / 4) * 84"
                stroke="var(--color-line)"
                stroke-width="0.5"
              />
              <!-- Sparkline -->
              <path
                :d="sparklinePath"
                fill="none"
                stroke="var(--color-accent)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <!-- Dots -->
              <circle
                v-for="(dot, i) in sparklineDots"
                :key="'dot-' + i"
                :cx="dot.x"
                :cy="dot.y"
                r="3"
                fill="var(--color-accent)"
              />
            </svg>
          </div>
          <div
            class="flex flex-col justify-between text-[9px] text-dim font-bold shrink-0 py-0.5 tabular-nums"
          >
            <span>5 <span class="font-medium">Très bien</span></span>
            <span>4</span>
            <span>3</span>
            <span>2</span>
            <span>1 <span class="font-medium">Très mal</span></span>
          </div>
        </div>
      </div>

      <!-- Good factors -->
      <div class="bg-surface-alt rounded-2xl p-5 border border-line mb-4">
        <p class="text-xs text-muted font-semibold uppercase tracking-wide mb-4">
          ☀️ Ce qui te fait du bien
        </p>

        <div v-if="topGoodFactors.length === 0" class="text-sm text-dim italic">
          Aucune donnée pour cette période
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(f, i) in topGoodFactors.slice(0, 5)"
            :key="f.id"
            class="flex items-center gap-3"
          >
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              :class="
                i === 0
                  ? 'bg-accent text-white'
                  : i === 1
                    ? 'bg-accent-muted text-white'
                    : 'bg-accent-faint text-accent'
              "
            >
              {{ i + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-semibold text-heading truncate">{{ f.label }}</span>
                <span class="text-xs text-muted font-medium ml-2 shrink-0">{{ f.count }}×</span>
              </div>
              <div class="w-full h-1.5 bg-line rounded-full overflow-hidden">
                <div
                  class="h-full bg-accent rounded-full transition-all duration-500"
                  :style="{ width: barPercent(f.count) }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bad factors -->
      <div class="bg-surface-alt rounded-2xl p-5 border border-line mb-4">
        <p class="text-xs text-muted font-semibold uppercase tracking-wide mb-4">
          🌧️ Ce qui te rend pas bien
        </p>

        <div v-if="topBadFactors.length === 0" class="text-sm text-dim italic">
          Aucune donnée pour cette période
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(f, i) in topBadFactors.slice(0, 5)"
            :key="f.id"
            class="flex items-center gap-3"
          >
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              :class="
                i === 0
                  ? 'bg-accent-pink text-white'
                  : i === 1
                    ? 'bg-[#e0a8e6] text-white'
                    : 'bg-[#f5e6f7] text-accent-pink'
              "
            >
              {{ i + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-semibold text-heading truncate">{{ f.label }}</span>
                <span class="text-xs text-muted font-medium ml-2 shrink-0">{{ f.count }}×</span>
              </div>
              <div class="w-full h-1.5 bg-line rounded-full overflow-hidden">
                <div
                  class="h-full bg-accent-pink rounded-full transition-all duration-500"
                  :style="{ width: barPercent(f.count) }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <TopBanner />
</template>
