<script setup>
import { computed, ref, onMounted, nextTick } from "vue"; // Ajout de onMounted et nextTick
import { useRouter } from "vue-router";
import { useJournalStore } from "../stores/journal";
import { DatePicker } from "v-calendar";
import "v-calendar/style.css";
import TopBanner from "../components/TopBanner.vue";

import IconTresMal from "../components/icons/IconTresMal.vue";
import IconMal from "../components/icons/IconMal.vue";
import IconMoyen from "../components/icons/IconMoyen.vue";
import IconBien from "../components/icons/IconBien.vue";
import IconTresBien from "../components/icons/IconTresBien.vue";

import { useAuthStore } from "../stores/auth";

const router = useRouter();
const store = useJournalStore();
const authStore = useAuthStore();

// Référence pour contrôler le calendrier impérativement
const calendarRef = ref(null);

const moodIcons = {
  1: IconTresMal,
  2: IconMal,
  3: IconMoyen,
  4: IconBien,
  5: IconTresBien,
};

const toYMDLocal = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const todayYMD = computed(() => toYMDLocal(new Date()));

const todayEntry = computed(() => store.savedEntries[todayYMD.value] || null);

// La journée est remplie si on a une humeur enregistrée
const todayIsFilled = computed(() => {
  const e = todayEntry.value;
  return e && !!e.mood;
});

const pickerModelValue = null;

// On garde la page synchronisée sur le mois actuel
const calendarPage = ref({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
});

// AU CHARGEMENT : On force le calendrier à aller sur "Aujourd'hui"
onMounted(async () => {
  await nextTick();
  if (calendarRef.value) {
    // Cette commande oblige le calendrier à afficher le mois courant
    calendarRef.value.move(new Date());
  }
});

const goToTunnel = (date = new Date()) => {
  const dateString = date instanceof Date ? toYMDLocal(date) : String(date);
  // Sécurité : impossible d'aller dans le futur
  if (dateString > todayYMD.value) return;
  store.loadDate(dateString);
  router.push("/step-mood");
};

const userFirstName = computed(() => {
  const u = authStore.user || {};
  const raw = u.displayName || u.name || (u.email ? String(u.email).split("@")[0] : "") || "toi";
  return String(raw).trim().split(" ")[0];
});

const POSITIVE_COLOR = "var(--color-accent-blue)";
const SUCCESS_COLOR = "var(--color-accent-pink)";
</script>

<template>
  <div
    class="min-h-screen bg-surface px-6 pt-12 pb-28 font-sans overflow-x-hidden transition-colors duration-200"
  >
    <header class="mb-10">
      <h1 class="text-3xl text-muted">
        Bonjour
        <span class="font-bold text-accent-soft"> {{ userFirstName }} ! </span>
        👋
      </h1>
    </header>

    <section class="mb-12">
      <h2 class="text-xl font-bold text-heading mb-4">Ma journée</h2>

      <button
        v-if="!todayIsFilled"
        @click="goToTunnel(new Date())"
        class="w-full px-5 py-4 bg-surface-raised border border-accent-faint rounded-xl shadow-sm flex items-center justify-between active:scale-95 transition-all"
      >
        <span class="text-accent-soft font-semibold text-base"> Compléter ma journée </span>

        <div
          class="w-10 h-10 rounded-full border border-dashed border-accent-light flex items-center justify-center text-accent-muted"
        >
          <span class="text-2xl font-light leading-none">+</span>
        </div>
      </button>

      <button
        v-else
        @click="goToTunnel(new Date())"
        class="w-full px-5 py-4 bg-surface-raised border border-accent-faint rounded-xl shadow-sm flex items-center justify-between active:scale-95 transition-all"
      >
        <span class="text-accent-soft font-semibold text-base">
          Bravo, tu as complété ta journée
        </span>

        <div
          class="w-10 h-10 rounded-full border border-accent-light flex items-center justify-center text-accent-soft"
        >
          <span class="text-lg leading-none">👏</span>
        </div>
      </button>
    </section>

    <section>
      <h2 class="text-xl font-bold text-heading mb-6">Mon calendrier</h2>

      <div class="bg-surface rounded-xl p-4 border border-line shadow-sm">
        <DatePicker
          ref="calendarRef"
          :model-value="pickerModelValue"
          @update:modelValue="() => {}"
          v-model:page="calendarPage"
          :model-config="{ type: 'string', mask: 'YYYY-MM-DD' }"
          expanded
          transparent
          borderless
          trim-weeks
          :attributes="store.calendarAttributes"
        >
          <template #day-content="{ day, attributes }">
            <div
              class="flex flex-col items-center justify-start w-full h-full min-h-[60px] isolate"
              :class="day.id <= todayYMD ? 'cursor-pointer' : 'cursor-default'"
              @click="day.id <= todayYMD && goToTunnel(day.date)"
            >
              <span class="text-xs font-semibold text-muted mb-0.5">
                {{ day.day }}
              </span>

              <div
                v-if="day.id <= todayYMD"
                class="flex-1 flex flex-col items-center justify-start"
              >
                <template v-if="attributes?.length > 0 && attributes[0].customData?.mood">
                  <div
                    class="w-7 h-7 rounded-full bg-white flex items-center justify-center relative z-10"
                  >
                    <component
                      :is="moodIcons[attributes[0].customData.mood]"
                      class="w-7 h-7 object-contain"
                    />
                  </div>

                  <div class="flex items-center justify-center gap-1 mt-0.5 relative z-10">
                    <span
                      v-if="String(attributes[0].customData.positivesText || '').trim().length > 0"
                      class="w-1.5 h-1.5 rounded-full"
                      :style="{ backgroundColor: POSITIVE_COLOR }"
                    />
                    <span
                      v-if="
                        Array.isArray(attributes[0].customData.successList) &&
                        attributes[0].customData.successList.length > 0
                      "
                      class="w-1.5 h-1.5 rounded-full"
                      :style="{ backgroundColor: SUCCESS_COLOR }"
                    />
                  </div>
                </template>

                <div
                  v-else
                  class="w-7 h-7 rounded-full flex items-center justify-center mt-0.5 transition-all relative z-0"
                  :class="
                    day.id === todayYMD
                      ? 'bg-accent-soft text-white shadow-sm'
                      : 'border border-dashed border-line-strong bg-surface-alt text-dim'
                  "
                >
                  <span class="text-lg font-light leading-none pb-0.5">+</span>
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
