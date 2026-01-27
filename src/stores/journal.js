// journal.js
import { defineStore } from 'pinia'

export const useJournalStore = defineStore('journal', {
  state: () => ({
    // IMPORTANT: format YYYY-MM-DD en LOCAL (pas UTC)
    selectedDate: (() => {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    })(),

    mood: 3,
    positivesText: '',
    successList: [],

    // clé = "YYYY-MM-DD"
    savedEntries: {},

    // utilisé pour forcer le recalcul / rerender si nécessaire
    updateCounter: 0,

    availableTags: [
      { id: 1, name: 'Sport' },
      { id: 2, name: 'Alimentation' },
      { id: 3, name: 'Travail' }
    ]
  }),

  getters: {
    // IMPORTANT: convertir "YYYY-MM-DD" -> Date locale stable (pas new Date("YYYY-MM-DD") qui part en UTC)
    calendarAttributes() {
      // dépendance explicite pour forcer le recalcul quand on sauvegarde
      const _ = this.updateCounter

      return Object.keys(this.savedEntries).map((dateKey) => ({
        key: dateKey,
        dates: this.parseYMDLocal(dateKey),
        customData: this.savedEntries[dateKey]
      }))
    }
  },

  actions: {
    // ===== Helpers dates (LOCAL) =====
    toYMDLocal(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },

    parseYMDLocal(ymd) {
      // "YYYY-MM-DD" -> Date en timezone locale (minuit local)
      const [y, m, d] = String(ymd).split('-').map(Number)
      return new Date(y, m - 1, d)
    },

    normalizeDate(dateInput) {
      // v-calendar peut fournir un Date -> on force toujours "YYYY-MM-DD" local
      if (dateInput instanceof Date) return this.toYMDLocal(dateInput)
      return String(dateInput)
    },

    // ===== Logique métier =====
    loadDate(dateInput) {
      const dateString = this.normalizeDate(dateInput)
      this.selectedDate = dateString

      const entry = this.savedEntries[dateString]
      if (entry) {
        this.mood = Number(entry.mood ?? 3)
        this.positivesText = entry.positivesText ?? ''
        this.successList = Array.isArray(entry.successList) ? [...entry.successList] : []
      } else {
        this.mood = 3
        this.positivesText = ''
        this.successList = []
      }
    },

    saveCurrentEntry() {
      const dateString = this.normalizeDate(this.selectedDate)

      // Copie immuable -> réactivité Vue/Pinia nickel
      this.savedEntries = {
        ...this.savedEntries,
        [dateString]: {
          mood: Number(this.mood),
          positivesText: this.positivesText,
          successList: [...this.successList]
        }
      }

      // Trigger recalcul + éventuellement rerender côté HomeView (si tu utilises :key)
      this.updateCounter++
    },

    addNewTag(name) {
      const clean = String(name ?? '').trim()
      if (!clean) return
      this.availableTags.push({ id: Date.now(), name: clean })
    },

    addSuccess(text, tagName) {
      const t = String(text ?? '').trim()
      if (!t) return
      this.successList.push({ text: t, tag: tagName })
    },

    removeSuccess(index) {
      if (index < 0 || index >= this.successList.length) return
      this.successList.splice(index, 1)
    }
  }
})
