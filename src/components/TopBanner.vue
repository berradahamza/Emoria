<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useTheme } from "../composables/useTheme";

const router = useRouter();
const authStore = useAuthStore();
const { isDark, toggle: toggleTheme } = useTheme();

const goHome = () => router.push("/home");
const goSuccessHistory = () => router.push("/success-history");

const logout = async () => {
  await authStore.logout();
  router.push("/login");
};
</script>

<template>
  <div
    class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-14 bg-surface border-t border-line px-6 flex items-center justify-between z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] transition-colors duration-200"
  >
    <div class="flex items-center gap-6">
      <button
        @click="goHome"
        class="flex flex-col items-center justify-center active:scale-95 transition-all"
        :class="router.currentRoute.value.path === '/home' ? 'text-accent-soft' : 'text-muted'"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 10.5L12 3l9 7.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M6.5 10.5V21h11V10.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        @click="goSuccessHistory"
        class="flex flex-col items-center justify-center active:scale-95 transition-all"
        :class="
          router.currentRoute.value.path === '/success-history' ? 'text-accent-soft' : 'text-muted'
        "
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div class="flex items-center gap-4">
      <button
        @click="toggleTheme"
        class="text-muted hover:text-heading active:scale-95 transition-all"
        :title="isDark ? 'Mode clair' : 'Mode sombre'"
      >
        <svg
          v-if="isDark"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg
          v-else
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      <button
        @click="logout"
        class="text-danger-dim hover:text-danger active:scale-95 transition-all"
        title="Déconnexion"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
    </div>
  </div>
</template>
