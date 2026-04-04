import { Timestamp } from "firebase-admin/firestore";

/** Schedule for a notification (when to send it) */
export interface NotifSchedule {
  hour: number; // 0-23
  minute: number; // 0-59
}

/** Stored in Firestore: users/{uid}/notificationPrefs/{notifType} */
export interface NotifPref {
  type: string;
  enabled: boolean;
  schedule: NotifSchedule;
  config?: Record<string, unknown>; // type-specific extra config
  lastSentAt?: Timestamp | null;
}

/** User document fields relevant to notifications */
export interface UserNotifData {
  uid: string;
  fcmToken?: string;
  timezone?: string;
}

/** FCM message payload built by a handler */
export interface NotifMessage {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
}

/** Every notification handler must implement this */
export interface NotifHandler {
  /** Must match the Firestore doc ID in notificationPrefs */
  type: string;
  /** Decide whether to actually send (e.g. skip if already filled today) */
  shouldSend(user: UserNotifData, pref: NotifPref): Promise<boolean>;
  /** Build the push message content */
  buildMessage(user: UserNotifData, pref: NotifPref): NotifMessage;
}
