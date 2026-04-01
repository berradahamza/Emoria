/* eslint-disable no-undef */
// Firebase Messaging Service Worker
// This file MUST be at the root of the hosting (public/)
// It handles background push notifications via FCM.

importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCBxwd0EaRaAiP76OvcLdj3C5-fW_MpBZA",
  authDomain: "em0ria.firebaseapp.com",
  projectId: "em0ria",
  storageBucket: "em0ria.firebasestorage.app",
  messagingSenderId: "578405193165",
  appId: "1:578405193165:web:ed39fa23b9f2f61b74a084",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notif = payload.notification || {};
  self.registration.showNotification(notif.title || "Emoria", {
    body: notif.body || "",
    icon: "/EmoriaLogo192.png",
    badge: "/EmoriaLogo192.png",
    data: payload.data || {},
  });
});
