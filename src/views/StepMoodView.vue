<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useJournalStore } from "../stores/journal";
import IconTresMal from "../components/icons/IconTresMal.vue";
import IconMal from "../components/icons/IconMal.vue";
import IconMoyen from "../components/icons/IconMoyen.vue";
import IconBien from "../components/icons/IconBien.vue";
import IconTresBien from "../components/icons/IconTresBien.vue";
import BoutonContinuer from "../components/buttons/boutonContinuer.vue";

const router = useRouter();
const store = useJournalStore();

const moods = [
  { id: 1, label: "Très mal", icon: IconTresMal },
  { id: 2, label: "Mal", icon: IconMal },
  { id: 3, label: "Moyen", icon: IconMoyen },
  { id: 4, label: "Bien", icon: IconBien },
  { id: 5, label: "Très bien", icon: IconTresBien },
];

const currentMood = computed(() => moods.find((m) => m.id === Number(store.mood)));

const moodHaloClass = computed(() => {
  const m = Number(store.mood);

  if (m === 1) return "bg-[#FDE2E2]";
  if (m === 2) return "bg-[#FFE3D4]";
  if (m === 3) return "bg-[#FFF3CC]";
  if (m === 4) return "bg-[#E6F4EA]";
  if (m === 5) return "bg-[#CDEED8]";

  return "bg-[#E6F4EA]";
});

const goHome = () => {
  router.push("/home");
};
</script>

<template>
  <div
    class="flex flex-col items-center justify-between min-h-screen px-8 py-12 bg-surface transition-colors duration-200"
  >
    <div class="w-full flex justify-between items-center">
      <button
        @click="goHome"
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

      <div class="text-dim text-sm font-medium">1/3</div>
    </div>

    <h1 class="text-2xl font-bold text-center text-heading leading-tight mb-10">
      Tu t'es <span class="text-accent-soft">senti(e)</span> comment <br />
      aujourd’hui ?
    </h1>

    <div
      class="relative flex items-center justify-center w-72 h-72 rounded-full transition-colors duration-300"
      :class="moodHaloClass"
    >
      <component :is="currentMood.icon" class="w-32 h-32 transition-all duration-300" />
    </div>

    <div class="w-full flex flex-col items-center gap-8">
      <span class="text-xl font-bold text-accent">{{ currentMood.label }}</span>

      <div class="w-full px-2">
        <input type="range" min="1" max="5" step="1" v-model="store.mood" class="custom-slider" />
        <div
          class="flex justify-between w-full mt-4 text-[10px] text-dim font-bold uppercase tracking-widest"
        >
          <span>Très mal</span>
          <span>Très bien</span>
        </div>
      </div>

      <router-link
        to="/step-positives"
        class="w-full flex justify-center hover:opacity-90 active:scale-95 transition-all"
      >
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
  background: var(--color-slider-track);
  border-radius: 22px;
  outline: none;
  padding: 0 4px;
}
.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 36px;
  height: 36px;
  background: var(--color-slider-thumb);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
