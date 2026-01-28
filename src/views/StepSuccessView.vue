<!-- src/views/StepSuccessView.vue -->
<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useJournalStore } from '../stores/journal'
import { useAuthStore } from '../stores/auth'

const store = useJournalStore()
const authStore = useAuthStore()
const router = useRouter()

const currentSuccess = ref('')
const selectedTag = ref(null)

const isAddingTag = ref(false)
const newTagName = ref('')
const tagInputRef = ref(null)

const showTagInput = async () => {
  isAddingTag.value = true
  await nextTick()
  tagInputRef.value?.focus()
}

const handleAddTag = () => {
  const clean = newTagName.value.trim()
  if (clean) {
    const created = store.addNewTag(clean)
    if (created) selectedTag.value = created // auto-select
    newTagName.value = ''
  }
  isAddingTag.value = false
}

const handleAddSuccess = () => {
  if (currentSuccess.value.trim()) {
    store.addSuccess(currentSuccess.value, selectedTag.value?.name ?? null)
    currentSuccess.value = ''
    selectedTag.value = null
  }
}

const handleFinalSave = async () => {
  handleAddSuccess()
  await store.saveCurrentEntryToCloud(authStore.uid)
  router.push('/home')
}
</script>

<template>
  <div class="flex flex-col items-center justify-between min-h-screen px-8 py-12 bg-white overflow-y-auto">
    <div class="w-full flex justify-end text-slate-300 text-sm font-medium">3/3</div>

    <div class="w-full flex-1">
      <h1 class="text-2xl font-bold text-center text-slate-900 mb-8">
        Quelles sont tes <span class="text-[#C46BCF]">réussites</span><br> du jour ? 💪
      </h1>

      <div class="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
        <div
          v-for="(item, index) in store.successList"
          :key="index"
          class="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm"
        >
          <p class="text-slate-700 font-semibold text-lg">{{ item.text }}</p>
          <span
            v-if="item.tag"
            class="text-xs text-purple-400 font-bold mt-2 block uppercase tracking-wider"
          >
            # {{ item.tag }}
          </span>
        </div>
      </div>

      <textarea
        v-model="currentSuccess"
        placeholder="Faire 30 min de vélo"
        class="w-full h-32 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm outline-none resize-none placeholder-slate-200 text-slate-600 focus:ring-2 focus:ring-purple-50 transition-all"
      ></textarea>

      <div class="mt-8 px-2">
        <p class="font-bold text-slate-900 mb-4 text-sm ml-2 italic text-slate-400">Associer un Tag :</p>

        <div class="flex flex-wrap gap-2 items-center">
          <button
            v-if="!isAddingTag"
            @click="showTagInput"
            class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 font-bold text-2xl active:scale-90 transition-all"
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
              class="px-4 py-2 w-28 rounded-full border border-purple-300 text-xs font-bold text-purple-400 outline-none"
            />
          </div>

          <button
            v-for="tag in store.availableTags"
            :key="tag.id"
            @click="selectedTag = tag"
            :class="[
              'px-5 py-2 rounded-full border text-xs font-bold transition-all duration-200',
              selectedTag?.id === tag.id
                ? 'bg-purple-400 border-purple-400 text-white shadow-lg'
                : 'border-purple-200 text-purple-300 bg-white'
            ]"
          >
            {{ tag.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="w-full flex flex-col gap-3 mt-8">
      <button
        @click="handleAddSuccess"
        class="w-full py-5 bg-white border border-slate-200 text-slate-400 font-bold rounded-xl active:bg-slate-50 transition-all"
      >
        Ajouter une réussite
      </button>

      <button
        @click="handleFinalSave"
        class="w-full py-5 bg-[#6B46C1] text-white font-bold text-lg rounded-xl shadow-xl shadow-purple-100 active:scale-95 transition-all"
      >
        Enregistrer le bilan de ma journée
      </button>
    </div>
  </div>
</template>
