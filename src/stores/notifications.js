// src/stores/notifications.js
import { defineStore } from "pinia";
import { db } from "../firebase/config";
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";

/**
 * Notification types registry.
 * Each entry defines the type key, display info, and default config.
 * To add a new notification type, just add an entry here.
 */
export const NOTIF_TYPES = [
  {
    type: "daily-reminder",
    label: "Rappel journal quotidien",
    description: "Te rappelle de remplir ton journal à l'heure choisie.",
    icon: "📝",
    defaultSchedule: { hour: 21, minute: 0 },
  },
  // Future:
  // {
  //   type: "exposure-reminder",
  //   label: "Rappel expositions",
  //   description: "Te rappelle de pratiquer tes expositions TCC.",
  //   icon: "🎯",
  //   defaultSchedule: { hour: 10, minute: 0 },
  // },
];

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    /** { [notifType]: { enabled, schedule: { hour, minute }, config, lastSentAt } } */
    prefs: {},
    loading: false,
  }),

  actions: {
    _prefsCol(uid) {
      return collection(db, "users", uid, "notificationPrefs");
    },
    _prefDoc(uid, notifType) {
      return doc(db, "users", uid, "notificationPrefs", notifType);
    },

    async loadPrefs(uid) {
      if (!uid) return;
      this.loading = true;
      try {
        const snap = await getDocs(this._prefsCol(uid));
        const prefs = {};
        snap.docs.forEach((d) => {
          prefs[d.id] = d.data();
        });
        this.prefs = prefs;
      } finally {
        this.loading = false;
      }
    },

    async savePref(uid, notifType, data) {
      await setDoc(this._prefDoc(uid, notifType), data, { merge: true });
      this.prefs[notifType] = { ...this.prefs[notifType], ...data };
    },

    async togglePref(uid, notifType, enabled) {
      const existing = this.prefs[notifType];
      if (!existing && enabled) {
        // Create with defaults
        const typeDef = NOTIF_TYPES.find((t) => t.type === notifType);
        const defaultData = {
          enabled: true,
          schedule: typeDef?.defaultSchedule || { hour: 21, minute: 0 },
          config: {},
        };
        await this.savePref(uid, notifType, defaultData);
      } else {
        await this.savePref(uid, notifType, { enabled });
      }
    },

    async updateSchedule(uid, notifType, hour, minute) {
      await this.savePref(uid, notifType, {
        schedule: { hour: Number(hour), minute: Number(minute) },
      });
    },

    async deletePref(uid, notifType) {
      await deleteDoc(this._prefDoc(uid, notifType));
      delete this.prefs[notifType];
    },

    getPref(notifType) {
      return this.prefs[notifType] || null;
    },
  },
});
