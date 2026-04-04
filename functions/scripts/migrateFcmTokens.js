/**
 * One-time migration: move legacy fcmToken (string) and malformed
 * "fcmTokens.xxx" literal fields into a proper fcmTokens map.
 *
 * Run:  node functions/scripts/migrateFcmTokens.js
 */
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

async function migrate() {
  const usersSnap = await db.collection("users").get();
  let migrated = 0;

  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    const newTokens = {};
    const fieldsToDelete = {};

    // 1. Collect legacy single fcmToken
    if (typeof data.fcmToken === "string" && data.fcmToken) {
      newTokens["legacy"] = data.fcmToken;
      fieldsToDelete.fcmToken = admin.firestore.FieldValue.delete();
    }

    // 2. Collect literal "fcmTokens.xxx" fields (malformed dot-in-name)
    for (const key of Object.keys(data)) {
      if (key.startsWith("fcmTokens.")) {
        const deviceId = key.slice("fcmTokens.".length);
        if (typeof data[key] === "string" && data[key]) {
          newTokens[deviceId] = data[key];
        }
        fieldsToDelete[key] = admin.firestore.FieldValue.delete();
      }
    }

    // 3. Merge existing proper fcmTokens map (if any)
    if (data.fcmTokens && typeof data.fcmTokens === "object") {
      Object.assign(newTokens, data.fcmTokens);
    }

    if (Object.keys(newTokens).length === 0 && Object.keys(fieldsToDelete).length === 0) continue;

    // Step 1: Delete malformed fields first
    if (Object.keys(fieldsToDelete).length > 0) {
      await userDoc.ref.update(fieldsToDelete);
    }

    // Step 2: Set the clean fcmTokens map
    if (Object.keys(newTokens).length > 0) {
      await userDoc.ref.update({ fcmTokens: newTokens });
    }

    console.log(`Migrated ${userDoc.id}:`, JSON.stringify(newTokens));
    migrated++;
  }

  console.log(`Done. Migrated ${migrated} user(s).`);
}

migrate().catch(console.error);
