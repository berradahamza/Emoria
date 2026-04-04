// src/composables/useFCM.js
import { ref } from "vue";
import { messaging, getToken, onMessage } from "../firebase/messaging";
import { db } from "../firebase/config";
import { doc, setDoc, updateDoc, deleteField } from "firebase/firestore";

const VAPID_KEY =
  "BC2VBevz9BpubE3drDBSajs3w7JmNNPlMr5qT7h-6ekGNskpaFg0H2W3ru3efBlI5xEDcZwCqilwH-8ZJmnI9EE";

const fcmToken = ref(null);
const permissionStatus = ref("default"); // "default" | "granted" | "denied"

/** Stable per-browser device ID stored in localStorage */
function getDeviceId() {
  const KEY = "emoria_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * Request notification permission, get FCM token, save to Firestore.
 * Stores under fcmTokens.{deviceId} so each device has exactly one token.
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
    const swReg = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (token) {
      fcmToken.value = token;
      const deviceId = getDeviceId();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris";
      const userRef = doc(db, "users", uid);
      // updateDoc interprets dot-separated keys as field paths (nested map update)
      // setDoc with merge treats them as literal field names — wrong for nested maps
      try {
        await updateDoc(userRef, {
          [`fcmTokens.${deviceId}`]: token,
          timezone: tz,
        });
      } catch {
        // Doc doesn't exist yet (edge case) — create it with the nested map
        await setDoc(userRef, { fcmTokens: { [deviceId]: token }, timezone: tz });
      }
    }
    return token;
  } catch (err) {
    console.error("FCM getToken error:", err);
    return null;
  }
}

/**
 * Remove this device's FCM token from Firestore (called on sign-out).
 */
async function removeToken(uid) {
  try {
    const deviceId = getDeviceId();
    await updateDoc(doc(db, "users", uid), {
      [`fcmTokens.${deviceId}`]: deleteField(),
    });
  } catch (err) {
    console.error("FCM removeToken error:", err);
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
      // Support both notification and data-only payloads
      const notif = payload.notification || {};
      const data = payload.data || {};
      const title = notif.title || data.title || "Emoria";
      const options = {
        body: notif.body || data.body || "",
        icon: notif.icon || data.icon || "/EmoriaLogo192.png",
      };
      // On mobile, new Notification() is blocked — use SW showNotification
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.ready.then((reg) => reg.showNotification(title, options));
      } else {
        new Notification(title, options);
      }
    }
  });
}

export function useFCM() {
  return {
    fcmToken,
    permissionStatus,
    requestPermissionAndToken,
    removeToken,
    listenForegroundMessages,
  };
}
