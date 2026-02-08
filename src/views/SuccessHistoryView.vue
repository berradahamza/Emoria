<script setup>
import { ref, computed } from "vue";
import TopBanner from "../components/TopBanner.vue";
import { useJournalStore } from "../stores/journal";

const store = useJournalStore();

const selectedFilterTag = ref(null);

const toggleFilterTag = (tag) => {
  selectedFilterTag.value = selectedFilterTag.value === tag ? null : tag;
};

// Toutes les réussites groupées par date, filtrées par tag
const filteredGroups = computed(() => {
  return store.allSuccessesGroupedByDate
    .map((group) => {
      let filtered;
      if (selectedFilterTag.value === "__none__") {
        filtered = group.successes.filter((s) => !s.tag);
      } else if (selectedFilterTag.value) {
        filtered = group.successes.filter((s) => s.tag === selectedFilterTag.value);
      } else {
        filtered = group.successes;
      }
      return { date: group.date, successes: filtered };
    })
    .filter((group) => group.successes.length > 0);
});

const totalCount = computed(() => {
  return filteredGroups.value.reduce((acc, g) => acc + g.successes.length, 0);
});

const formatDate = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
</script>

<template>
  <div class="min-h-screen bg-surface px-6 pt-10 pb-28 transition-colors duration-200">
    <div class="flex items-center gap-3 mb-2">
      <router-link
        to="/analysis"
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
      </router-link>
      <h1 class="text-3xl font-extrabold text-heading">Mes réussites</h1>
    </div>

    <p class="text-sm text-muted mb-6">
      {{ totalCount }} réussite{{ totalCount > 1 ? "s" : "" }} au total
    </p>

    <!-- Tag filter pills -->
    <div class="flex flex-wrap gap-2 mb-6" v-if="store.allUsedTags.length > 0">
      <button
        v-for="tag in store.allUsedTags"
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

    <!-- No data -->
    <div v-if="filteredGroups.length === 0" class="text-center text-muted text-sm mt-20">
      Aucune réussite{{ selectedFilterTag ? " pour ce tag" : "" }}.
    </div>

    <!-- Grouped successes by date -->
    <div v-else class="space-y-6">
      <div v-for="group in filteredGroups" :key="group.date">
        <h2 class="text-sm font-bold text-muted uppercase tracking-wider mb-3">
          {{ formatDate(group.date) }}
        </h2>

        <div class="space-y-2">
          <div
            v-for="(item, idx) in group.successes"
            :key="idx"
            class="p-4 bg-surface-alt rounded-xl border border-line transition-all hover:shadow-md"
          >
            <p class="text-body font-semibold text-base leading-snug">{{ item.text }}</p>
            <span
              v-if="item.tag"
              class="text-xs text-accent-vivid font-bold mt-1.5 block uppercase tracking-wider"
            >
              # {{ item.tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <TopBanner />
  </div>
</template>
