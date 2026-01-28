// src/stores/journal.js
import { defineStore } from 'pinia'
import { db } from '../firebase/config'
import {
  doc,
  setDoc,
  getDoc,       // <-- AJOUTÉ
  updateDoc,    // <-- AJOUTÉ
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
    savedEntries: {},
    updateCounter: 0,

    // Liste par défaut (sera écrasée par celle de l'utilisateur s'il en a une)
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

      this.savedEntries = { ...this.savedEntries, [dateString]: payload }
      this.updateCounter++
    },

    async loadEntriesForUser(uid) {
      if (!uid) return

      // 1. Charger les entrées journalières
      const colRef = collection(db, 'users', uid, 'entries')
      const snap = await getDocs(colRef)

      const entries = {}
      snap.docs
        .sort((a, b) => a.id.localeCompare(b.id))
        .forEach((d) => {
          entries[d.id] = d.data()
        })
      this.savedEntries = entries

      // 2. Charger les TAGS personnalisés du user (s'ils existent)
      try {
        const userDocRef = doc(db, 'users', uid)
        const userSnap = await getDoc(userDocRef)
        if (userSnap.exists()) {
          const data = userSnap.data()
          if (Array.isArray(data.tags) && data.tags.length > 0) {
            this.availableTags = data.tags
          }
        }
      } catch (e) {
        console.error("Erreur chargement tags", e)
      }

      this.updateCounter++
    },

    // ===== Tags & Success =====

    // MODIFIÉ: Ajout du paramètre `uid` pour sauvegarder
    async addNewTag(name, uid) {
      const clean = String(name ?? '').trim()
      if (!clean) return null

      const newTag = { id: Date.now(), name: clean }
      this.availableTags.push(newTag)

      // Sauvegarde Cloud si uid présent
      if (uid) {
        try {
          await updateDoc(doc(db, 'users', uid), {
            tags: this.availableTags
          })
        } catch (e) {
          console.error("Erreur sauvegarde tag", e)
        }
      }

      return newTag
    },

    // AJOUTÉ: Suppression de tag
    async deleteTag(tagId, uid) {
      const index = this.availableTags.findIndex(t => t.id === tagId)
      if (index !== -1) {
        this.availableTags.splice(index, 1) // Retrait local instantané

        // Mise à jour Cloud
        if (uid) {
          try {
            await updateDoc(doc(db, 'users', uid), {
              tags: this.availableTags
            })
          } catch (e) {
            console.error("Erreur suppression tag", e)
          }
        }
      }
    },

    addSuccess(text, tagName) {
      const t = String(text ?? '').trim()
      if (!t) return

      const tag = (tagName ?? null)
      this.successList.push({ text: t, tag })
    },

    removeSuccess(index) {
      if (index < 0 || index >= this.successList.length) return
      this.successList.splice(index, 1)
    }
  }
})
