// src/stores/journal.js
import { defineStore } from 'pinia'
import { db } from '../firebase/config'
import {
  doc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp
} from 'firebase/firestore'

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
    calendarAttributes() {
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
      const [y, m, d] = String(ymd).split('-').map(Number)
      return new Date(y, m - 1, d)
    },

    normalizeDate(dateInput) {
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

    // Local save (utile si tu veux garder un mode offline)
    saveCurrentEntry() {
      const dateString = this.normalizeDate(this.selectedDate)
      this.savedEntries = {
        ...this.savedEntries,
        [dateString]: {
          mood: Number(this.mood),
          positivesText: this.positivesText,
          successList: [...this.successList]
        }
      }
      this.updateCounter++
    },

    // ===== Firestore =====
    async saveCurrentEntryToCloud(uid) {
      if (!uid) throw new Error('No uid')

      const dateString = this.normalizeDate(this.selectedDate)

      const payload = {
        mood: Number(this.mood),
        positivesText: this.positivesText,
        successList: [...this.successList],
        updatedAt: serverTimestamp()
      }

      await setDoc(doc(db, 'users', uid, 'entries', dateString), payload, { merge: true })

      // UX instant: on maintient le cache local synchro
      this.savedEntries = { ...this.savedEntries, [dateString]: payload }
      this.updateCounter++
    },

    async loadEntriesForUser(uid) {
      if (!uid) return

      const colRef = collection(db, 'users', uid, 'entries')
      const snap = await getDocs(colRef)

      // Tri côté client sur l'ID (YYYY-MM-DD)
      const entries = {}
      snap.docs
        .sort((a, b) => a.id.localeCompare(b.id))
        .forEach((d) => {
          entries[d.id] = d.data()
        })

      this.savedEntries = entries
      this.updateCounter++
    },

    // ===== Tags & Success =====
    addNewTag(name) {
      const clean = String(name ?? '').trim()
      if (!clean) return null

      const newTag = { id: Date.now(), name: clean }
      this.availableTags.push(newTag)

      // IMPORTANT: on retourne le tag créé pour que la vue puisse le sélectionner
      return newTag
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
