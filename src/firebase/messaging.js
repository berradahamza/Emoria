// src/firebase/messaging.js
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp, getApps } from "firebase/app";

// Re-use the existing Firebase app (already initialized in config.js)
const app = getApps()[0];
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
