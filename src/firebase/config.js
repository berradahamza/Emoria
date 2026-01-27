import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyACB2GPzG4sVX0cVxiO1TxpZoxe3DDt_d4",
  authDomain: "emoria-a9a96.firebaseapp.com",
  projectId: "emoria-a9a96",
  storageBucket: "emoria-a9a96.firebasestorage.app",
  messagingSenderId: "986456022233",
  appId: "1:986456022233:web:d75ef35173b65f94eeb2c8",
  measurementId: "G-2BZ3Q9RQ7J"
};

// Initialisation de l'App
const app = initializeApp(firebaseConfig);

// Initialisation des services
const db = getFirestore(app);
const auth = getAuth(app);

// Étape 7 de ta roadmap : Activer la persistance locale (Offline-first)
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn("La persistance a échoué (multiples onglets ouverts)");
    } else if (err.code == 'unimplemented') {
        console.warn("Le navigateur ne supporte pas la persistance");
    }
});

export { db, auth };