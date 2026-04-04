<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useExposureStore } from "../stores/exposure";
import TopBanner from "../components/TopBanner.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const store = useExposureStore();

const catId = route.params.catId;
const expId = route.params.expId;

const category = computed(() => store.getCategory(catId));
const exposure = computed(() => store.getExposure(catId, expId));

// ── Log form ──
const showLogForm = ref(false);
const logDate = ref(nowLocal());
const logFelt = ref(5);
const logComment = ref("");

function nowLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const openLogForm = () => {
  logDate.value = nowLocal();
  logFelt.value = 5;
  logComment.value = "";
  showLogForm.value = true;
};

const saveLog = async () => {
  if (!logDate.value) return;
  await store.addLog(authStore.uid, catId, expId, logDate.value, logFelt.value, logComment.value);
  showLogForm.value = false;
};

const deleteLog = async (logId) => {
  pendingDeleteLogId.value = logId;
  showConfirm.value = true;
};

// ── Confirm dialog ──
const showConfirm = ref(false);
const pendingDeleteLogId = ref(null);

const onConfirmDelete = async () => {
  if (pendingDeleteLogId.value) {
    await store.deleteLog(authStore.uid, catId, expId, pendingDeleteLogId.value);
    pendingDeleteLogId.value = null;
  }
  showConfirm.value = false;
};

const onCancelDelete = () => {
  showConfirm.value = false;
  pendingDeleteLogId.value = null;
};

// ── Difficulty colors ──
const diffColor = (val) => {
  const n = Number(val);
  if (n <= 3) return "text-green-500";
  if (n <= 5) return "text-yellow-500";
  if (n <= 7) return "text-orange-500";
  return "text-red-500";
};

const diffBg = (val) => {
  const n = Number(val);
  if (n <= 3) return "bg-green-50 dark:bg-green-950/30";
  if (n <= 5) return "bg-yellow-50 dark:bg-yellow-950/30";
  if (n <= 7) return "bg-orange-50 dark:bg-orange-950/30";
  return "bg-red-50 dark:bg-red-950/30";
};

const formatDate = (dt) => {
  if (!dt) return "";
  const d = new Date(dt);
  if (isNaN(d)) return dt;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Init ──
onMounted(async () => {
  if (authStore.uid && store.categories.length === 0) {
    await store.loadAll(authStore.uid);
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-surface px-6 pt-12 pb-28 font-sans overflow-x-hidden transition-colors duration-200"
  >
    <!-- Header -->
    <header class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <button
          @click="router.push('/exposures')"
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
        <span class="text-xs text-muted font-medium">{{ category?.name }}</span>
        <div class="w-10" />
      </div>

      <div v-if="exposure" class="text-center">
        <h1 class="text-xl font-bold text-heading mb-2">{{ exposure.title }}</h1>
        <div
          class="inline-block px-3 py-1 rounded-full text-sm font-bold"
          :class="[diffColor(exposure.difficulty), diffBg(exposure.difficulty)]"
        >
          Difficulté prévue : {{ exposure.difficulty }}/10
        </div>
      </div>
    </header>

    <div v-if="!exposure" class="text-center text-muted py-12">Exposition introuvable</div>

    <template v-else>
      <!-- Add log CTA -->
      <button
        @click="openLogForm"
        class="w-full py-3 mb-6 rounded-xl bg-accent-soft text-white font-semibold active:scale-95 transition-all shadow-sm"
      >
        + J'ai fait cette exposition
      </button>

      <!-- Logs timeline -->
      <section>
        <h2 class="text-lg font-bold text-heading mb-4">
          Historique
          <span class="text-sm font-normal text-muted">({{ exposure.logs.length }})</span>
        </h2>

        <div v-if="exposure.logs.length === 0" class="text-center text-muted py-8">
          Aucune réalisation enregistrée
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="log in exposure.logs"
            :key="log.id"
            class="rounded-xl border border-line p-4 shadow-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-bold text-heading">{{ formatDate(log.date) }}</span>
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-bold"
                  :class="[diffColor(log.feltDifficulty), diffBg(log.feltDifficulty)]"
                >
                  Ressenti : {{ log.feltDifficulty }}/10
                </span>
                <button
                  @click="deleteLog(log.id)"
                  class="p-1 text-muted hover:text-danger transition-colors"
                  title="Supprimer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <p v-if="log.comment" class="text-sm text-body leading-relaxed">{{ log.comment }}</p>
            <p v-else class="text-sm text-dim italic">Pas de commentaire</p>
          </div>
        </div>
      </section>
    </template>

    <!-- ═══ Log modal ═══ -->
    <Teleport to="body">
      <div
        v-if="showLogForm"
        class="fixed inset-0 z-100 flex items-end justify-center bg-black/40"
        @click.self="showLogForm = false"
      >
        <div class="w-full max-w-md bg-surface rounded-t-2xl p-6 pb-8 animate-slide-up">
          <h2 class="text-lg font-bold text-heading mb-4">Nouvelle réalisation</h2>

          <!-- Date -->
          <label class="block text-sm font-semibold text-heading mb-1">Date</label>
          <input
            type="datetime-local"
            v-model="logDate"
            class="w-full px-4 py-3 rounded-lg border border-line-strong bg-input-bg text-body focus:outline-none focus:ring-2 focus:ring-accent-soft/40 mb-4"
          />

          <!-- Felt difficulty -->
          <label class="block text-sm font-semibold text-heading mb-2">
            Difficulté ressentie :
            <span :class="diffColor(logFelt)" class="font-bold">{{ logFelt }}/10</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            v-model="logFelt"
            class="custom-slider w-full"
          />
          <div
            class="flex justify-between text-[10px] text-dim font-bold uppercase tracking-widest mt-1 mb-4"
          >
            <span>Facile</span>
            <span>Très dur</span>
          </div>

          <!-- Comment -->
          <label class="block text-sm font-semibold text-heading mb-1"
            >Commentaire (optionnel)</label
          >
          <textarea
            v-model="logComment"
            rows="3"
            placeholder="Comment ça s'est passé ?"
            class="w-full px-4 py-3 rounded-lg border border-line-strong bg-input-bg text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-soft/40 resize-none mb-4"
          />

          <div class="flex gap-3">
            <button
              @click="showLogForm = false"
              class="flex-1 py-2.5 rounded-lg border border-line-strong text-muted font-semibold active:scale-95 transition-all"
            >
              Annuler
            </button>
            <button
              @click="saveLog"
              class="flex-1 py-2.5 rounded-lg bg-accent-soft text-white font-semibold active:scale-95 transition-all"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <TopBanner />

    <ConfirmDialog
      :visible="showConfirm"
      title="Supprimer ?"
      message="Cette réalisation sera supprimée."
      @confirm="onConfirmDelete"
      @cancel="onCancelDelete"
    />
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slide-up 0.25s ease-out;
}
</style>
