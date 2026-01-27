import { defineStore } from 'pinia'

export const useJournalStore = defineStore('journal', {
  state: () => ({
    selectedDate: new Date().toISOString().split('T')[0],
    mood: 3,
    positivesText: '',
    successList: [],
    savedEntries: {}, 
    updateCounter: 0, // Clé de rafraîchissement forcée
    availableTags: [
      { id: 1, name: 'Sport' },
      { id: 2, name: 'Alimentation' },
      { id: 3, name: 'Travail' }
    ]
  }),

  getters: {
    calendarAttributes: (state) => {
      // On lie le getter au compteur pour forcer le recalcul
      const trigger = state.updateCounter 
      return Object.keys(state.savedEntries).map(dateKey => ({
        key: dateKey,
        dates: new Date(dateKey),
        customData: state.savedEntries[dateKey]
      }))
    }
  },

  actions: {
    loadDate(dateString) {
      this.selectedDate = dateString
      const entry = this.savedEntries[dateString]
      if (entry) {
        this.mood = entry.mood
        this.positivesText = entry.positivesText
        this.successList = [...entry.successList]
      } else {
        this.mood = 3
        this.positivesText = ''
        this.successList = []
      }
    },
    saveCurrentEntry() {
      // Recréation complète de l'objet pour la réactivité Vue 3
      const newEntries = { ...this.savedEntries }
      newEntries[this.selectedDate] = {
        mood: Number(this.mood),
        positivesText: this.positivesText,
        successList: [...this.successList]
      }
      this.savedEntries = newEntries
      this.updateCounter++ 
    },
    addNewTag(name) {
      this.availableTags.push({ id: Date.now(), name })
    },
    addSuccess(text, tagName) {
      this.successList.push({ text, tag: tagName })
    }
  }
})