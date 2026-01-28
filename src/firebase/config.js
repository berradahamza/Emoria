// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHmrIqrrWplLgF696F_usEzgUQc9V52Pg",
  authDomain: "emoria2-3de35.firebaseapp.com",
  projectId: "emoria2-3de35",
  storageBucket: "emoria2-3de35.firebasestorage.app",
  messagingSenderId: "899425997371",
  appId: "1:899425997371:web:f919228294d02706d8421e",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// ✅ Offline persistence (IndexedDB) + multi-tab
// - Évite l'erreur "exclusive access" quand plusieurs tabs sont ouverts
// - Si l'environnement ne le supporte pas, on ignore proprement
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  // failed-precondition / unimplemented: pas grave -> Firestore bascule en mémoire
  // (ex: navigateur/onglets/environnement non compatibles)
});
