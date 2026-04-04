import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import type { NotifMessage } from "./types";

/**
 * Send a push notification via FCM.
 * Returns true if sent successfully, false if the token was invalid (and cleaned up).
 */
export async function sendPush(
  fcmToken: string,
  message: NotifMessage,
  uid: string,
): Promise<boolean> {
  try {
    // Use webpush.notification (platform-specific) instead of top-level
    // notification. This ensures the service worker receives and displays
    // the full notification content on Android Chrome without the
    // duplicate/empty notification issue.
    await admin.messaging().send({
      token: fcmToken,
      data: {
        title: message.title,
        body: message.body,
        ...(message.data ?? {}),
      },
      webpush: {
        notification: {
          title: message.title,
          body: message.body,
          icon: message.icon || "/EmoriaLogo192.png",
          badge: "/EmoriaLogo192.png",
        },
        fcmOptions: {
          link: "/",
        },
      },
    });
    return true;
  } catch (err: unknown) {
    const error = err as { code?: string };
    // Token is no longer valid → clean it up
    if (
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      logger.warn(`Invalid FCM token for user ${uid}, removing.`);
      await admin
        .firestore()
        .doc(`users/${uid}`)
        .update({ fcmToken: admin.firestore.FieldValue.delete() });
      return false;
    }
    logger.error(`FCM send error for user ${uid}:`, err);
    return false;
  }
}
