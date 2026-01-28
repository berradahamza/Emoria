// src/stores/auth.js
import { defineStore } from 'pinia'
import { db, auth } from '../firebase/config'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'

import { useJournalStore } from './journal'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,          // { uid, email, displayName, photoURL } ou null
    isReady: false,      // true après le 1er onAuthStateChanged
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    uid: (state) => state.user?.uid || null
  },

  actions: {
    initAuthListener() {
      onAuthStateChanged(auth, async (user) => {
        this.user = user
          ? {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            }
          : null

        const journal = useJournalStore()

        if (user) {
          // Recharge toutes les journées Firestore au login
          await journal.loadEntriesForUser(user.uid)
          // Recharge le formulaire sur la date courante
          journal.loadDate(journal.selectedDate)
        } else {
          journal.savedEntries = {}
          journal.updateCounter++
        }

        this.isReady = true
      })
    },

    async loginWithEmail(email, password) {
      this.error = null
      try {
        await signInWithEmailAndPassword(auth, email, password)
        // le chargement Firestore se fera via initAuthListener
      } catch (e) {
        this.error = this._friendlyError(e)
        throw e
      }
    },

    async registerWithEmail(email, password) {
      this.error = null
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password)

        // Crée/merge users/{uid}
        await setDoc(
          doc(db, 'users', cred.user.uid),
          {
            email: cred.user.email,
            displayName: cred.user.displayName ?? null,
            photoURL: cred.user.photoURL ?? null,
            createdAt: serverTimestamp()
          },
          { merge: true }
        )
      } catch (e) {
        this.error = this._friendlyError(e)
        throw e
      }
    },

    async loginWithGoogle() {
      this.error = null
      try {
        const provider = new GoogleAuthProvider()
        const cred = await signInWithPopup(auth, provider)

        await setDoc(
          doc(db, 'users', cred.user.uid),
          {
            email: cred.user.email,
            displayName: cred.user.displayName ?? null,
            photoURL: cred.user.photoURL ?? null,
            createdAt: serverTimestamp()
          },
          { merge: true }
        )
      } catch (e) {
        this.error = this._friendlyError(e)
        throw e
      }
    },

    async logout() {
      this.error = null
      await fbSignOut(auth)
    },

    _friendlyError(e) {
      const code = e?.code || ''
      if (code.includes('auth/invalid-credential')) return 'Identifiants incorrects.'
      if (code.includes('auth/user-not-found')) return 'Aucun compte trouvé.'
      if (code.includes('auth/wrong-password')) return 'Mot de passe incorrect.'
      if (code.includes('auth/email-already-in-use')) return 'Cet email est déjà utilisé.'
      if (code.includes('auth/weak-password')) return 'Mot de passe trop faible (6 caractères min).'
      if (code.includes('auth/popup-closed-by-user')) return 'Popup Google fermée.'
      return 'Erreur de connexion. Réessaie.'
    }
  }
})
