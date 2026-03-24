<script setup>
import { useRouter } from "vue-router";
import { useJournalStore } from "../stores/journal";
import BoutonContinuer from "../components/buttons/boutonContinuer.vue";

const router = useRouter();
const store = useJournalStore();

const goBack = () => router.push("/step-mood");

const GOOD_FACTORS = [
  { id: "amis", label: "👥 Amis" },
  { id: "animal", label: "🐱 Animal" },
  { id: "famille", label: "👨‍👩‍👧 Famille" },
  { id: "loisir", label: "🎿 Loisir" },
  { id: "meteo", label: "☀️ Météo" },
  { id: "partenaire", label: "❤️ Partenaire" },
  { id: "projet", label: "🎯 Projet" },
  { id: "sante", label: "🩺 Santé" },
  { id: "sortie", label: "🍽️ Sortie" },
  { id: "sport", label: "⚽ Sport" },
  { id: "travail", label: "💼 Travail" },
];

const BAD_FACTORS = [
  { id: "amis", label: "👥 Amis" },
  { id: "deuil", label: "🕯️ Deuil" },
  { id: "famille", label: "👨‍👩‍👧 Famille" },
  { id: "meteo", label: "☀️ Météo" },
  { id: "partenaire", label: "❤️ Partenaire" },
  { id: "projet", label: "🎯 Projet" },
  { id: "sante", label: "🩺 Santé" },
  { id: "sortie", label: "🍽️ Sortie" },
  { id: "sport", label: "⚽ Sport" },
  { id: "travail", label: "💼 Travail" },
];

const toggleGood = (id) => {
  const idx = store.goodFactors.indexOf(id);
  if (idx === -1) store.goodFactors.push(id);
  else store.goodFactors.splice(idx, 1);
};

const toggleBad = (id) => {
  const idx = store.badFactors.indexOf(id);
  if (idx === -1) store.badFactors.push(id);
  else store.badFactors.splice(idx, 1);
};
</script>

<template>
  <div
    class="flex flex-col min-h-screen px-6 py-12 bg-surface font-sans transition-colors duration-200 pb-28"
  >
    <!-- Header -->
    <div class="w-full flex justify-between items-center mb-8">
      <button
        @click="goBack"
        class="p-2 -ml-2 text-muted hover:text-body active:scale-95 transition-all"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div class="text-dim text-sm font-medium">2/4</div>
    </div>

    <!-- Good factors -->
    <div class="mb-10">
      <h2 class="text-2xl font-bold text-center text-heading mb-6 leading-tight">
        Qu'est-ce qui t'a fait<br />
        du <span class="text-accent">bien</span> ?
      </h2>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="factor in GOOD_FACTORS"
          :key="'good-' + factor.id"
          @click="toggleGood(factor.id)"
          class="px-4 py-2 rounded-full border text-sm font-medium transition-all active:scale-95"
          :class="
            store.goodFactors.includes(factor.id)
              ? 'bg-accent text-white border-accent'
              : 'bg-surface text-body border-line-strong'
          "
        >
          {{ factor.label }}
        </button>
      </div>
    </div>

    <!-- Bad factors -->
    <div class="mb-10">
      <h2 class="text-2xl font-bold text-center text-heading mb-6 leading-tight">
        Qu'est-ce qui t'a rendu<br />
        <span class="text-accent-pink">pas bien</span> ?
      </h2>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="factor in BAD_FACTORS"
          :key="'bad-' + factor.id"
          @click="toggleBad(factor.id)"
          class="px-4 py-2 rounded-full border text-sm font-medium transition-all active:scale-95"
          :class="
            store.badFactors.includes(factor.id)
              ? 'bg-accent-pink text-white border-accent-pink'
              : 'bg-surface text-body border-line-strong'
          "
        >
          {{ factor.label }}
        </button>
      </div>
    </div>

    <!-- Continue button -->
    <div class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-8 bg-surface pt-4">
      <router-link
        to="/step-positives"
        class="w-full flex justify-center hover:opacity-90 active:scale-95 transition-all"
      >
        <BoutonContinuer />
      </router-link>
    </div>
  </div>
</template>
