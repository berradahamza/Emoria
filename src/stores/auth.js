// src/stores/auth.js
import { defineStore } from "pinia";
import { db, auth } from "../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { useJournalStore } from "./journal";
import { useExposureStore } from "./exposure";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null, // { uid, email, displayName, photoURL } ou null
    isReady: false, // true après le 1er onAuthStateChanged
    error: null,
    _unsub: null, // pour éviter plusieurs listeners
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    uid: (state) => state.user?.uid || null,
  },

  actions: {
    initAuthListener() {
      // déjà initialisé => on renvoie une Promise déjà résolue
      if (this.isReady) return Promise.resolve(this.user);

      // évite d’empiler des listeners si init est appelé 2 fois
      if (this._unsub) {
        return new Promise((resolve) => {
          const stop = setInterval(() => {
            if (this.isReady) {
              clearInterval(stop);
              resolve(this.user);
            }
          }, 10);
        });
      }

      return new Promise((resolve) => {
        this._unsub = onAuthStateChanged(auth, async (fbUser) => {
          this.user = fbUser
            ? {
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName,
                photoURL: fbUser.photoURL,
              }
            : null;

          const journal = useJournalStore();
          const exposureStore = useExposureStore();

          try {
            if (fbUser) {
              // Recharge toutes les journées Firestore au login
              await journal.loadEntriesForUser(fbUser.uid);
              // Recharge le formulaire sur la date courante
              journal.loadDate(journal.selectedDate);
              // Recharge les expositions TCC
              await exposureStore.loadAll(fbUser.uid);
            } else {
              journal.savedEntries = {};
              journal.updateCounter++;
              exposureStore.categories = [];
            }
          } finally {
            // on passe ready à true QUOI QU’IL ARRIVE
            this.isReady = true;
            resolve(this.user);
          }
        });
      });
    },

    async loginWithEmail(email, password) {
      this.error = null;
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (e) {
        this.error = this._friendlyError(e);
        throw e;
      }
    },

    async registerWithEmail(email, password) {
      this.error = null;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(
          doc(db, "users", cred.user.uid),
          {
            email: cred.user.email,
            displayName: cred.user.displayName ?? null,
            photoURL: cred.user.photoURL ?? null,
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (e) {
        this.error = this._friendlyError(e);
        throw e;
      }
    },

    async loginWithGoogle() {
      this.error = null;
      try {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);

        await setDoc(
          doc(db, "users", cred.user.uid),
          {
            email: cred.user.email,
            displayName: cred.user.displayName ?? null,
            photoURL: cred.user.photoURL ?? null,
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (e) {
        this.error = this._friendlyError(e);
        throw e;
      }
    },

    async logout() {
      this.error = null;
      await fbSignOut(auth);
    },

    _friendlyError(e) {
      const code = e?.code || "";
      if (code.includes("auth/invalid-credential")) return "Identifiants incorrects.";
      if (code.includes("auth/user-not-found")) return "Aucun compte trouvé.";
      if (code.includes("auth/wrong-password")) return "Mot de passe incorrect.";
      if (code.includes("auth/email-already-in-use")) return "Cet email est déjà utilisé.";
      if (code.includes("auth/weak-password"))
        return "Mot de passe trop faible (6 caractères min).";
      if (code.includes("auth/popup-closed-by-user")) return "Popup Google fermée.";
      return "Erreur de connexion. Réessaie.";
    },
  },
});
