import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions";
import { onSchedule } from "firebase-functions/scheduler";
import { processScheduledNotifications } from "./notifications/service";
import { testNotification } from "./middleware/auth";

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

/**
 * Scheduled function: runs every 15 minutes.
 * Checks all users' notification preferences and sends push notifications
 * to those whose scheduled time falls within the current window.
 */
export const sendScheduledNotifications = onSchedule(
  {
    schedule: "every 15 minutes",
    timeZone: "UTC",
    maxInstances: 1,
  },
  async () => {
    await processScheduledNotifications();
  },
);

/**
 * Callable function: test notification (requires auth).
 */
export { testNotification };
