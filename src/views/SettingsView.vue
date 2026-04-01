<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useNotificationsStore, NOTIF_TYPES } from "../stores/notifications";
import { useFCM } from "../composables/useFCM";
import NotifPrefCard from "../components/NotifPrefCard.vue";
import TopBanner from "../components/TopBanner.vue";

const router = useRouter();
const authStore = useAuthStore();
const notifStore = useNotificationsStore();
const { permissionStatus, requestPermissionAndToken } = useFCM();

const loading = ref(true);
const testSending = ref(false);

// Check if browser supports notifications
// PushManager is the true gating API for FCM web push.
// "Notification" alone exists in old Safari on macOS but push still doesn't work there.
const supportsNotifs = "serviceWorker" in navigator && "PushManager" in window;

const notifGranted = computed(() => permissionStatus.value === "granted");

onMounted(async () => {
  if (authStore.uid) {
    await notifStore.loadPrefs(authStore.uid);
  }
  if ("Notification" in window) {
    permissionStatus.value = Notification.permission;
    // If permission already granted, refresh/store the token (handles missing token case)
    if (Notification.permission === "granted" && authStore.uid) {
      requestPermissionAndToken(authStore.uid);
    }
  }
  loading.value = false;
});

const enableNotifications = async () => {
  await requestPermissionAndToken(authStore.uid);
};

const handleToggle = async (notifType, enabled) => {
  // If enabling for the first time, request permission
  if (enabled && !notifGranted.value) {
    await enableNotifications();
    if (!notifGranted.value) return; // user denied
  }
  await notifStore.togglePref(authStore.uid, notifType, enabled);
};

const handleScheduleUpdate = async (notifType, hour, minute) => {
  await notifStore.updateSchedule(authStore.uid, notifType, hour, minute);
};

const sendTestNotification = async () => {
  testSending.value = true;
  try {
    const { getFunctions, httpsCallable } = await import("firebase/functions");
    const functions = getFunctions();
    const testFn = httpsCallable(functions, "testNotification");
    await testFn();
  } catch (err) {
    console.error("Test notification error:", err);
  } finally {
    testSending.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-surface px-6 pt-12 pb-28 font-sans overflow-x-hidden transition-colors duration-200"
  >
    <!-- Header -->
    <header class="mb-8 flex items-center justify-between">
      <button
        @click="router.push('/home')"
        class="p-2 -ml-2 text-muted hover:text-body active:scale-95 transition-all"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 class="text-xl font-bold text-heading">Réglages</h1>
      <div class="w-10" />
    </header>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-muted py-12">Chargement…</div>

    <template v-else>
      <!-- Notifications section -->
      <section class="mb-8">
        <h2 class="text-lg font-bold text-heading mb-4">Notifications</h2>

        <!-- Browser not supported -->
        <div
          v-if="!supportsNotifs"
          class="text-sm text-muted bg-surface-alt rounded-xl p-4 border border-line"
        >
          Ton navigateur ne supporte pas les notifications push.
          <span class="block mt-1">
            Sur Safari, le support est disponible depuis
            <strong>iOS 16.4</strong> et <strong>macOS Safari 16</strong>. Assure-toi que l'app
            n'est pas ouverte en navigation privée.
          </span>
        </div>

        <!-- Permission denied -->
        <div
          v-else-if="permissionStatus === 'denied'"
          class="text-sm text-danger bg-danger-bg rounded-xl p-4 border border-danger-border"
        >
          Les notifications sont bloquées. Active-les dans les paramètres de ton navigateur.
        </div>

        <template v-else>
          <!-- Permission not yet granted -->
          <div v-if="!notifGranted" class="mb-4 p-4 rounded-xl border border-line bg-surface-alt">
            <p class="text-sm text-body mb-3">
              Active les notifications pour recevoir tes rappels.
            </p>
            <button
              @click="enableNotifications"
              class="px-5 py-2.5 rounded-lg bg-accent-soft text-white font-semibold active:scale-95 transition-all"
            >
              🔔 Activer les notifications
            </button>
          </div>

          <!-- Notification prefs cards -->
          <div class="space-y-3">
            <NotifPrefCard
              v-for="nt in NOTIF_TYPES"
              :key="nt.type"
              :type="nt.type"
              :label="nt.label"
              :description="nt.description"
              :icon="nt.icon"
              :enabled="notifStore.getPref(nt.type)?.enabled || false"
              :hour="notifStore.getPref(nt.type)?.schedule?.hour ?? nt.defaultSchedule.hour"
              :minute="notifStore.getPref(nt.type)?.schedule?.minute ?? nt.defaultSchedule.minute"
              @toggle="(val) => handleToggle(nt.type, val)"
              @update:schedule="(h, m) => handleScheduleUpdate(nt.type, h, m)"
            />
          </div>

          <!-- Test button -->
          <button
            v-if="notifGranted"
            @click="sendTestNotification"
            :disabled="testSending"
            class="mt-4 w-full py-2.5 rounded-lg border border-line-strong text-muted font-semibold active:scale-95 transition-all disabled:opacity-50"
          >
            {{ testSending ? "Envoi…" : "🧪 Envoyer une notification test" }}
          </button>
        </template>
      </section>
    </template>

    <TopBanner />
  </div>
</template>
