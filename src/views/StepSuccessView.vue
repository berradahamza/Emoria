<script setup>
import { ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useJournalStore } from "../stores/journal";
import { useAuthStore } from "../stores/auth";

const store = useJournalStore();
const authStore = useAuthStore();
const router = useRouter();

const currentSuccess = ref("");
const selectedTag = ref(null);

const isAddingTag = ref(false);
const newTagName = ref("");
const tagInputRef = ref(null);

const showTagInput = async () => {
  isAddingTag.value = true;
  await nextTick();
  tagInputRef.value?.focus();
};

const handleAddTag = async () => {
  const clean = newTagName.value.trim();
  if (clean) {
    // On passe l'UID pour sauvegarder le tag dans Firebase
    const created = await store.addNewTag(clean, authStore.uid);
    if (created) selectedTag.value = created;
    newTagName.value = "";
  }
  isAddingTag.value = false;
};

const handleDeleteTag = async (tag) => {
  if (selectedTag.value?.id === tag.id) {
    selectedTag.value = null;
  }
  // Suppression dans Firebase via l'UID
  await store.deleteTag(tag.id, authStore.uid);
};

const handleAddSuccess = () => {
  if (currentSuccess.value.trim()) {
    store.addSuccess(currentSuccess.value, selectedTag.value?.name ?? null);
    currentSuccess.value = "";
    selectedTag.value = null;
  }
};

const handleFinalSave = async () => {
  handleAddSuccess();
  await store.saveCurrentEntryToCloud(authStore.uid);
  router.push("/home");
};

const goBack = () => {
  router.push("/step-positives");
};
</script>

<template>
  <div
    class="flex flex-col items-center justify-between min-h-screen px-8 py-12 bg-surface overflow-y-auto transition-colors duration-200"
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

      <div class="text-dim text-sm font-medium">3/3</div>
    </div>

    <div class="w-full flex-1 mt-4">
      <h1 class="text-2xl font-bold text-center text-heading mb-8">
        Quelles sont tes <span class="text-accent-pink">réussites</span><br />
        du jour ? 💪
      </h1>

      <div class="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        <div
          v-for="(item, index) in store.successList"
          :key="index"
          class="relative p-5 pr-10 bg-surface-alt rounded-xl border border-line shadow-sm transition-all hover:shadow-md"
        >
          <button
            @click="store.removeSuccess(index)"
            class="absolute top-4 right-4 text-danger-dim hover:text-danger hover:bg-danger-bg rounded-full p-1 transition-all active:scale-90"
            title="Supprimer cette réussite"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <p class="text-body font-semibold text-lg leading-snug">{{ item.text }}</p>
          <span
            v-if="item.tag"
            class="text-xs text-accent-vivid font-bold mt-2 block uppercase tracking-wider"
          >
            # {{ item.tag }}
          </span>
        </div>
      </div>

      <textarea
        v-model="currentSuccess"
        placeholder="Faire 30 min de vélo"
        class="w-full h-32 p-6 bg-surface rounded-xl border border-line shadow-sm outline-none resize-none placeholder-dim text-body focus:ring-2 focus:ring-accent-faint transition-all"
      ></textarea>

      <div class="mt-8 px-2">
        <p class="font-bold mb-4 text-sm ml-2 italic text-muted">Associer un Tag :</p>

        <div class="flex flex-wrap gap-3 items-center">
          <button
            v-if="!isAddingTag"
            @click="showTagInput"
            class="w-10 h-10 rounded-full border border-line-strong flex items-center justify-center text-dim font-bold text-2xl active:scale-90 transition-all"
          >
            +
          </button>

          <div v-else class="flex items-center gap-1">
            <input
              ref="tagInputRef"
              v-model="newTagName"
              @keyup.enter="handleAddTag"
              @blur="handleAddTag"
              placeholder="Nom..."
              class="px-4 py-2 w-28 rounded-full border border-accent-muted text-xs font-bold text-accent-vivid outline-none bg-surface"
            />
          </div>

          <div v-for="tag in store.availableTags" :key="tag.id" class="relative group">
            <button
              @click="selectedTag = tag"
              :class="[
                'px-5 py-2 rounded-full border text-xs font-bold transition-all duration-200',
                selectedTag?.id === tag.id
                  ? 'bg-accent-vivid border-accent-vivid text-white shadow-lg'
                  : 'border-accent-light text-accent-muted bg-surface',
              ]"
            >
              {{ tag.name }}
            </button>

            <button
              @click.stop="handleDeleteTag(tag)"
              class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-danger-bg text-danger border border-danger-border flex items-center justify-center text-[9px] shadow-sm hover:bg-danger-hover active:scale-90"
              title="Supprimer ce tag"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full flex flex-col gap-3 mt-8">
      <button
        @click="handleAddSuccess"
        class="w-full py-5 bg-surface border border-line-strong text-muted font-bold rounded-xl active:bg-surface-alt transition-all"
      >
        Enregister la réussite
      </button>

      <button
        @click="handleFinalSave"
        class="w-full py-5 bg-accent text-white font-bold text-lg rounded-xl shadow-xl shadow-accent-glow active:scale-95 transition-all"
      >
        Enregistrer le bilan de ma journée
      </button>
    </div>
  </div>
</template>
