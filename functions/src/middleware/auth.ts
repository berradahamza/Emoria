import { onCall, HttpsError } from "firebase-functions/https";
import * as admin from "firebase-admin";
import type { NotifMessage } from "../notifications/types";
import { sendPush } from "../notifications/sender";

/**
 * Authenticated onCall endpoint for testing notifications.
 * Only the authenticated user can trigger a test push to themselves.
 */
export const testNotification = onCall({ maxInstances: 5 }, async (request) => {
  // ── Auth middleware ──
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be logged in to test notifications.");
  }

  const uid = request.auth.uid;
  const db = admin.firestore();

  const userSnap = await db.doc(`users/${uid}`).get();
  if (!userSnap.exists) {
    throw new HttpsError("not-found", "User document not found.");
  }

  const userData = userSnap.data();
  const fcmToken = userData?.fcmToken;
  if (!fcmToken) {
    throw new HttpsError("failed-precondition", "No FCM token found. Enable notifications first.");
  }

  const message: NotifMessage = {
    title: "Test Emoria 🔔",
    body: "Si tu vois ça, les notifications fonctionnent !",
  };

  const sent = await sendPush(fcmToken, message, uid);
  return { success: sent };
});
