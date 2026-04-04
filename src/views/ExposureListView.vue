<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useExposureStore } from "../stores/exposure";
import TopBanner from "../components/TopBanner.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";

const router = useRouter();
const authStore = useAuthStore();
const store = useExposureStore();

// ── Category form ──
const showCatForm = ref(false);
const editingCatId = ref(null);
const catName = ref("");

const openNewCat = () => {
  editingCatId.value = null;
  catName.value = "";
  showCatForm.value = true;
};

const openEditCat = (cat) => {
  editingCatId.value = cat.id;
  catName.value = cat.name;
  showCatForm.value = true;
};

const saveCat = async () => {
  if (!catName.value.trim()) return;
  if (editingCatId.value) {
    await store.updateCategory(authStore.uid, editingCatId.value, catName.value);
  } else {
    await store.addCategory(authStore.uid, catName.value);
  }
  showCatForm.value = false;
  catName.value = "";
  editingCatId.value = null;
};

const deleteCat = async (catId) => {
  pendingDeleteAction.value = () => store.deleteCategory(authStore.uid, catId);
  confirmMessage.value = "Cette catégorie et toutes ses expositions seront supprimées.";
  showConfirm.value = true;
};

// ── Exposure form ──
const showExpForm = ref(false);
const expCatId = ref(null);
const editingExpId = ref(null);
const expTitle = ref("");
const expDifficulty = ref(5);

const openNewExp = (catId) => {
  expCatId.value = catId;
  editingExpId.value = null;
  expTitle.value = "";
  expDifficulty.value = 5;
  showExpForm.value = true;
};

const openEditExp = (catId, exp) => {
  expCatId.value = catId;
  editingExpId.value = exp.id;
  expTitle.value = exp.title;
  expDifficulty.value = exp.difficulty;
  showExpForm.value = true;
};

const saveExp = async () => {
  if (!expTitle.value.trim()) return;
  if (editingExpId.value) {
    await store.updateExposure(
      authStore.uid,
      expCatId.value,
      editingExpId.value,
      expTitle.value,
      expDifficulty.value,
    );
  } else {
    await store.addExposure(authStore.uid, expCatId.value, expTitle.value, expDifficulty.value);
  }
  showExpForm.value = false;
};

const deleteExp = async (catId, expId) => {
  pendingDeleteAction.value = () => store.deleteExposure(authStore.uid, catId, expId);
  confirmMessage.value = "Cette exposition et tout son historique seront supprimés.";
  showConfirm.value = true;
};

// ── Confirm dialog ──
const showConfirm = ref(false);
const confirmMessage = ref("");
const pendingDeleteAction = ref(null);

const onConfirmDelete = async () => {
  if (pendingDeleteAction.value) {
    await pendingDeleteAction.value();
    pendingDeleteAction.value = null;
  }
  showConfirm.value = false;
};

const onCancelDelete = () => {
  showConfirm.value = false;
  pendingDeleteAction.value = null;
};

// ── Accordion ──
const openCats = ref({});
const toggleCat = (catId) => {
  openCats.value[catId] = !openCats.value[catId];
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

// ── Init ──
onMounted(async () => {
  if (authStore.uid) {
    await store.loadAll(authStore.uid);
    // Open all categories by default
    store.categories.forEach((c) => {
      openCats.value[c.id] = true;
    });
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-surface px-6 pt-12 pb-28 font-sans overflow-x-hidden transition-colors duration-200"
  >
    <!-- Header -->
    <header class="mb-8 flex items-center justify-between">
      <div>
        <button
          @click="router.push('/home')"
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
      </div>
      <h1 class="text-xl font-bold text-heading">Expositions TCC</h1>
      <div class="w-10" />
    </header>

    <!-- Loading -->
    <div v-if="store.loading" class="text-center text-muted py-12">Chargement…</div>

    <!-- Empty state -->
    <div v-else-if="store.categories.length === 0 && !showCatForm" class="text-center py-16">
      <p class="text-muted mb-4">Aucune catégorie pour le moment</p>
      <button
        @click="openNewCat"
        class="px-5 py-2.5 rounded-lg bg-accent-soft text-white font-semibold active:scale-95 transition-all"
      >
        + Nouvelle catégorie
      </button>
    </div>

    <!-- Categories list -->
    <div v-else class="space-y-4">
      <div
        v-for="cat in store.sortedCategories"
        :key="cat.id"
        class="rounded-xl border border-line shadow-sm overflow-hidden"
      >
        <!-- Category header -->
        <div
          class="flex items-center justify-between px-4 py-3 bg-surface-alt cursor-pointer select-none"
          @click="toggleCat(cat.id)"
        >
          <div class="flex items-center gap-2">
            <svg
              class="w-4 h-4 text-muted transition-transform duration-200"
              :class="{ 'rotate-90': openCats[cat.id] }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
            <span class="font-bold text-heading">{{ cat.name }}</span>
            <span class="text-xs text-muted">({{ cat.exposures.length }})</span>
          </div>
          <div class="flex items-center gap-1" @click.stop>
            <button
              @click="openEditCat(cat)"
              class="p-1.5 text-muted hover:text-accent-soft transition-colors"
              title="Modifier"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              @click="deleteCat(cat.id)"
              class="p-1.5 text-muted hover:text-danger transition-colors"
              title="Supprimer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Exposures list (accordion body) -->
        <div v-show="openCats[cat.id]" class="px-4 py-2 space-y-2">
          <div
            v-for="exp in cat.exposures"
            :key="exp.id"
            class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-alt transition-colors cursor-pointer group"
            @click="
              router.push({ name: 'exposure-detail', params: { catId: cat.id, expId: exp.id } })
            "
          >
            <div class="flex-1 min-w-0">
              <span class="text-body font-medium block truncate">{{ exp.title }}</span>
              <span class="text-xs text-muted">
                {{ exp.logs?.length || 0 }} réalisation{{ (exp.logs?.length || 0) > 1 ? "s" : "" }}
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-2">
              <div
                class="px-2 py-0.5 rounded-full text-xs font-bold"
                :class="[diffColor(exp.difficulty), diffBg(exp.difficulty)]"
              >
                {{ exp.difficulty }}/10
              </div>
              <button
                @click.stop="openEditExp(cat.id, exp)"
                class="p-1 text-muted hover:text-accent-soft transition-colors"
                title="Modifier"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                @click.stop="deleteExp(cat.id, exp.id)"
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

          <!-- Empty exposures -->
          <p v-if="cat.exposures.length === 0" class="text-sm text-muted py-2 text-center">
            Aucune exposition
          </p>

          <!-- Add exposure button -->
          <button
            @click.stop="openNewExp(cat.id)"
            class="w-full py-2 text-sm text-accent-soft font-semibold hover:bg-accent-faint rounded-lg transition-colors"
          >
            + Ajouter une exposition
          </button>
        </div>
      </div>

      <!-- Add category button -->
      <button
        @click="openNewCat"
        class="w-full py-3 rounded-xl border-2 border-dashed border-line-strong text-muted font-semibold hover:border-accent-soft hover:text-accent-soft transition-colors"
      >
        + Nouvelle catégorie
      </button>
    </div>

    <!-- ═══ Category modal ═══ -->
    <Teleport to="body">
      <div
        v-if="showCatForm"
        class="fixed inset-0 z-100 flex items-end justify-center bg-black/40"
        @click.self="showCatForm = false"
      >
        <div class="w-full max-w-md bg-surface rounded-t-2xl p-6 pb-8 animate-slide-up">
          <h2 class="text-lg font-bold text-heading mb-4">
            {{ editingCatId ? "Modifier la catégorie" : "Nouvelle catégorie" }}
          </h2>
          <input
            v-model="catName"
            placeholder="Nom de la catégorie (ex: Voiture, Train…)"
            class="w-full px-4 py-3 rounded-lg border border-line-strong bg-input-bg text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-soft/40"
            @keyup.enter="saveCat"
            autofocus
          />
          <div class="flex gap-3 mt-5">
            <button
              @click="showCatForm = false"
              class="flex-1 py-2.5 rounded-lg border border-line-strong text-muted font-semibold active:scale-95 transition-all"
            >
              Annuler
            </button>
            <button
              @click="saveCat"
              class="flex-1 py-2.5 rounded-lg bg-accent-soft text-white font-semibold active:scale-95 transition-all"
            >
              {{ editingCatId ? "Modifier" : "Créer" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══ Exposure modal ═══ -->
    <Teleport to="body">
      <div
        v-if="showExpForm"
        class="fixed inset-0 z-100 flex items-end justify-center bg-black/40"
        @click.self="showExpForm = false"
      >
        <div class="w-full max-w-md bg-surface rounded-t-2xl p-6 pb-8 animate-slide-up">
          <h2 class="text-lg font-bold text-heading mb-4">
            {{ editingExpId ? "Modifier l'exposition" : "Nouvelle exposition" }}
          </h2>

          <input
            v-model="expTitle"
            placeholder="Description (ex: Conduire jusqu'à la piscine)"
            class="w-full px-4 py-3 rounded-lg border border-line-strong bg-input-bg text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-soft/40 mb-4"
            autofocus
          />

          <label class="block text-sm font-semibold text-heading mb-2">
            Difficulté prévue :
            <span :class="diffColor(expDifficulty)" class="font-bold">{{ expDifficulty }}/10</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            v-model="expDifficulty"
            class="custom-slider w-full"
          />
          <div
            class="flex justify-between text-[10px] text-dim font-bold uppercase tracking-widest mt-1 mb-4"
          >
            <span>Facile</span>
            <span>Très dur</span>
          </div>

          <div class="flex gap-3 mt-2">
            <button
              @click="showExpForm = false"
              class="flex-1 py-2.5 rounded-lg border border-line-strong text-muted font-semibold active:scale-95 transition-all"
            >
              Annuler
            </button>
            <button
              @click="saveExp"
              class="flex-1 py-2.5 rounded-lg bg-accent-soft text-white font-semibold active:scale-95 transition-all"
            >
              {{ editingExpId ? "Modifier" : "Créer" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <TopBanner />

    <ConfirmDialog
      :visible="showConfirm"
      title="Supprimer ?"
      :message="confirmMessage"
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
