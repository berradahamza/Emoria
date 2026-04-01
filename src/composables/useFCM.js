// src/composables/useFCM.js
import { ref } from "vue";
import { messaging, getToken, onMessage } from "../firebase/messaging";
import { db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

const VAPID_KEY =
  "BC2VBevz9BpubE3drDBSajs3w7JmNNPlMr5qT7h-6ekGNskpaFg0H2W3ru3efBlI5xEDcZwCqilwH-8ZJmnI9EE";

const fcmToken = ref(null);
const permissionStatus = ref("default"); // "default" | "granted" | "denied"

/**
 * Request notification permission, get FCM token, save to Firestore.
 */
async function requestPermissionAndToken(uid) {
  if (!("Notification" in window)) {
    permissionStatus.value = "denied";
    return null;
  }

  const permission = await Notification.requestPermission();
  permissionStatus.value = permission;

  if (permission !== "granted") return null;

  try {
    // Wait for the active service worker — avoids timing issues on fresh loads
    const swReg = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (token) {
      fcmToken.value = token;
      // Use setDoc+merge so it works even if the user doc doesn't exist yet
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris";
      await setDoc(doc(db, "users", uid), { fcmToken: token, timezone: tz }, { merge: true });
    }
    return token;
  } catch (err) {
    console.error("FCM getToken error:", err);
    return null;
  }
}

/**
 * Listen for foreground messages (app is open).
 */
function listenForegroundMessages(callback) {
  onMessage(messaging, (payload) => {
    if (callback) {
      callback(payload);
    } else {
      // Default: show a browser notification even in foreground
      const notif = payload.notification || {};
      new Notification(notif.title || "Emoria", {
        body: notif.body || "",
        icon: "/EmoriaLogo192.png",
      });
    }
  });
}

export function useFCM() {
  return {
    fcmToken,
    permissionStatus,
    requestPermissionAndToken,
    listenForegroundMessages,
  };
}
