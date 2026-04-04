import * as admin from "firebase-admin";
import type { NotifHandler, NotifPref, UserNotifData } from "../types";

/**
 * Check if today's journal entry exists for this user.
 * Uses the user's timezone to determine "today".
 */
async function hasEntryToday(uid: string, timezone: string): Promise<boolean> {
  const db = admin.firestore();
  const now = new Date();
  // Format today's date in the user's local timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA produces YYYY-MM-DD format
  const todayKey = formatter.format(now);

  const snap = await db.doc(`users/${uid}/entries/${todayKey}`).get();
  return snap.exists && !!snap.data()?.mood;
}

export const dailyReminderHandler: NotifHandler = {
  type: "daily-reminder",

  async shouldSend(user: UserNotifData, _pref: NotifPref): Promise<boolean> {
    // Don't send if user already filled their journal today (in their timezone)
    return !(await hasEntryToday(user.uid, user.timezone || "Europe/Paris"));
  },

  buildMessage(): { title: string; body: string } {
    return {
      title: "Emoria 💜",
      body: "N'oublie pas de remplir ton journal aujourd'hui ! 📝",
    };
  },
};
