import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import type { NotifMessage } from "./types";

/**
 * Send a push notification to a single FCM token.
 * Returns true if sent, false if the token was invalid (cleaned up from the map).
 */
async function sendToToken(
  token: string,
  message: NotifMessage,
  uid: string,
  deviceId?: string,
): Promise<boolean> {
  try {
    await admin.messaging().send({
      token,
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
    if (
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      logger.warn(`Invalid FCM token for user ${uid} (device ${deviceId}), removing.`);
      if (deviceId) {
        await admin
          .firestore()
          .doc(`users/${uid}`)
          .update({ [`fcmTokens.${deviceId}`]: admin.firestore.FieldValue.delete() });
      }
      return false;
    }
    logger.error(`FCM send error for user ${uid}:`, err);
    return false;
  }
}

/**
 * Send a push notification to ALL devices of a user.
 * Reads the fcmTokens map, sends to each, cleans up invalid tokens.
 * Returns true if at least one device received the notification.
 */
export async function sendPushToAll(
  fcmTokens: Record<string, string>,
  message: NotifMessage,
  uid: string,
): Promise<boolean> {
  const entries = Object.entries(fcmTokens);
  if (entries.length === 0) return false;

  const results = await Promise.all(
    entries.map(([deviceId, token]) => sendToToken(token, message, uid, deviceId)),
  );
  return results.some(Boolean);
}

// Keep backward-compatible single-token helper for edge cases
export { sendToToken as sendPush };
