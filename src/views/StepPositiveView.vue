<script setup>
import { useRouter } from "vue-router";
import { useJournalStore } from "../stores/journal";
import BoutonContinuer from "../components/buttons/boutonContinuer.vue";

const router = useRouter();
const store = useJournalStore();

const goBack = () => {
  router.push("/step-mood");
};
</script>

<template>
  <div
    class="flex flex-col items-center justify-between min-h-screen px-6 py-12 bg-surface font-sans transition-colors duration-200"
  >
    <div class="w-full flex justify-between items-center">
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

      <div class="text-dim text-sm font-medium">2/3</div>
    </div>

    <div class="w-full">
      <h1 class="text-2xl font-bold text-center text-heading mb-8 leading-tight">
        Liste <span class="text-accent-blue">5 points positifs</span> <br />
        de ta journée ☀️
      </h1>

      <div class="bg-surface rounded-xl p-6 min-h-[400px] border border-line shadow-sm">
        <textarea
          v-model="store.positivesText"
          placeholder="Si tu as du mal à trouver des points positifs c'est que tu cherches des choses trop compliquées :)"
          class="w-full h-full min-h-[350px] bg-transparent outline-none focus:ring-0 text-body placeholder-dim italic resize-none leading-relaxed"
        />
      </div>
    </div>

    <router-link
      to="/step-success"
      class="w-full flex justify-center hover:opacity-90 active:scale-95 transition-all"
    >
      <BoutonContinuer />
    </router-link>
  </div>
</template>
