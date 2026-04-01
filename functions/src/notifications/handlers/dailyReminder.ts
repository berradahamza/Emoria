import * as admin from "firebase-admin";
import type { NotifHandler, NotifPref, UserNotifData } from "../types";

/**
 * Check if today's journal entry exists for this user.
 */
async function hasEntryToday(uid: string): Promise<boolean> {
  const db = admin.firestore();
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const todayKey = `${y}-${m}-${d}`;

  const snap = await db.doc(`users/${uid}/entries/${todayKey}`).get();
  return snap.exists && !!snap.data()?.mood;
}

export const dailyReminderHandler: NotifHandler = {
  type: "daily-reminder",

  async shouldSend(user: UserNotifData, _pref: NotifPref): Promise<boolean> {
    // Don't send if user already filled their journal today
    return !(await hasEntryToday(user.uid));
  },

  buildMessage(): { title: string; body: string } {
    return {
      title: "Emoria 💜",
      body: "N'oublie pas de remplir ton journal aujourd'hui ! 📝",
    };
  },
};
