// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Use Vite environment variables when available. Copy `.env.example` to
// `.env.local` and fill values. Vite exposes vars via `import.meta.env`.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID || "",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// ✅ Offline persistence (IndexedDB) + multi-tab
// - Évite l'erreur "exclusive access" quand plusieurs tabs sont ouverts
// - Si l'environnement ne le supporte pas, on ignore proprement
enableMultiTabIndexedDbPersistence(db).catch(() => {
  // failed-precondition / unimplemented: pas grave -> Firestore bascule en mémoire
  // (ex: navigateur/onglets/environnement non compatibles)
});
