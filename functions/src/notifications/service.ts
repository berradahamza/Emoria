import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import type { NotifHandler, NotifPref, UserNotifData } from "./types";
import { sendPush } from "./sender";

// ── Handler registry ──
import { dailyReminderHandler } from "./handlers/dailyReminder";

const handlers: NotifHandler[] = [
  dailyReminderHandler,
  // Add future handlers here:
  // exposureReminderHandler,
  // weeklySummaryHandler,
];

function getDb() {
  return admin.firestore();
}

/**
 * Main entry point called by the scheduler.
 * Finds all users whose notification prefs match the current time window,
 * then dispatches to the appropriate handler.
 */
export async function processScheduledNotifications(): Promise<void> {
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();

  // We process in 15-minute windows
  const windowStart = currentMinute - (currentMinute % 15);
  const windowEnd = windowStart + 14;

  logger.info(
    `Processing notifications for UTC ${currentHour}:${String(windowStart).padStart(2, "0")}` +
      `-${currentHour}:${String(windowEnd).padStart(2, "0")}`,
  );

  // For each registered handler type, query prefs
  for (const handler of handlers) {
    await processHandler(handler, currentHour, windowStart, windowEnd);
  }
}

async function processHandler(
  handler: NotifHandler,
  utcHour: number,
  windowStart: number,
  windowEnd: number,
): Promise<void> {
  // Query all enabled notificationPrefs across all users, then filter by doc ID
  // (collectionGroup __name__ filters require the full document path which is
  //  unreliable, so we filter by the "type" field instead.)
  const prefsSnap = await getDb()
    .collectionGroup("notificationPrefs")
    .where("type", "==", handler.type)
    .where("enabled", "==", true)
    .get();

  if (prefsSnap.empty) {
    logger.info(`No active prefs for ${handler.type}`);
    return;
  }

  for (const prefDoc of prefsSnap.docs) {
    try {
      const pref = prefDoc.data() as NotifPref;

      // Get the parent user uid from the path: users/{uid}/notificationPrefs/{type}
      const pathParts = prefDoc.ref.path.split("/");
      const uid = pathParts[1];

      // Load user doc for fcmToken + timezone
      const userSnap = await getDb().doc(`users/${uid}`).get();
      if (!userSnap.exists) continue;

      const userData = userSnap.data() as UserNotifData & { fcmToken?: string; timezone?: string };
      if (!userData.fcmToken) continue;

      const user: UserNotifData = {
        uid,
        fcmToken: userData.fcmToken,
        timezone: userData.timezone || "Europe/Paris",
      };

      // Convert user's preferred time to UTC for comparison
      const userHourUTC = localHourToUTC(pref.schedule.hour, user.timezone || "Europe/Paris");

      if (userHourUTC !== utcHour) continue;
      if (pref.schedule.minute < windowStart || pref.schedule.minute > windowEnd) continue;

      // Check if already sent today (in the user's timezone)
      if (pref.lastSentAt) {
        const lastSent = pref.lastSentAt.toDate();
        const tz = user.timezone || "Europe/Paris";
        const todayLocalStr = new Intl.DateTimeFormat("en-CA", {
          timeZone: tz,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());
        const lastSentLocalStr = new Intl.DateTimeFormat("en-CA", {
          timeZone: tz,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(lastSent);
        if (lastSentLocalStr === todayLocalStr) continue;
      }

      // Ask handler if we should send
      if (!(await handler.shouldSend(user, pref))) continue;

      // Build and send
      const message = handler.buildMessage(user, pref);
      const sent = await sendPush(userData.fcmToken, message, uid);

      if (sent) {
        await prefDoc.ref.update({
          lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        logger.info(`Sent ${handler.type} to ${uid}`);
      }
    } catch (err) {
      logger.error(`Error processing ${handler.type} for ${prefDoc.ref.path}:`, err);
    }
  }
}

/**
 * Rough conversion of a local hour to UTC.
 * Uses Intl to get the current UTC offset for the timezone.
 */
function localHourToUTC(localHour: number, timezone: string): number {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    const localNowHour = parseInt(formatter.format(now), 10);
    const utcNowHour = now.getUTCHours();
    const offset = localNowHour - utcNowHour;
    return (((localHour - offset) % 24) + 24) % 24;
  } catch {
    // Fallback: assume Europe/Paris ≈ UTC+1 or +2
    return (((localHour - 1) % 24) + 24) % 24;
  }
}
