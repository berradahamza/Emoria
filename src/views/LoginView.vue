<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);

const onLogin = async () => {
  loading.value = true;
  authStore.error = null;
  try {
    await authStore.loginWithEmail(email.value.trim(), password.value);
    router.push("/home");
  } finally {
    loading.value = false;
  }
};

const onGoogle = async () => {
  loading.value = true;
  authStore.error = null;
  try {
    await authStore.loginWithGoogle();
    router.push("/home");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-surface px-8 py-12 font-sans overflow-x-hidden flex items-center transition-colors duration-200"
  >
    <div class="w-full max-w-md mx-auto">
      <header class="mb-10">
        <h1 class="text-3xl text-muted">
          Emoria <span class="text-accent font-bold">Connexion</span>
        </h1>
        <p class="text-muted mt-2">Connecte-toi pour retrouver ton calendrier.</p>
      </header>

      <div
        class="p-6 border-2 border-accent-faint rounded-3xl bg-surface shadow-xl shadow-accent-glow/40"
      >
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-body">Email</label>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="ex: marion@email.com"
              class="w-full p-4 rounded-3xl bg-input-bg border border-line outline-none focus:ring-2 focus:ring-accent-faint focus:border-accent-light transition-all"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-body">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full p-4 rounded-3xl bg-input-bg border border-line outline-none focus:ring-2 focus:ring-accent-faint focus:border-accent-light transition-all"
            />
          </div>

          <button
            @click="onLogin"
            :disabled="loading"
            class="w-full py-5 bg-accent text-white rounded-3xl font-bold text-lg shadow-xl shadow-accent-glow active:scale-95 transition-all disabled:opacity-50"
          >
            Se connecter
          </button>

          <div class="flex items-center gap-3 py-2">
            <div class="h-px flex-1 bg-line"></div>
            <span class="text-xs font-semibold text-dim">OU</span>
            <div class="h-px flex-1 bg-line"></div>
          </div>

          <button
            @click="onGoogle"
            :disabled="loading"
            class="w-full py-5 bg-surface border-2 border-accent-faint text-body rounded-3xl font-bold active:scale-95 transition-all disabled:opacity-50"
          >
            Continuer avec Google
          </button>

          <p v-if="authStore.error" class="text-sm text-danger pt-2">
            {{ authStore.error }}
          </p>

          <div class="pt-3 text-center">
            <p class="text-sm text-muted">
              Pas de compte ?
              <RouterLink to="/register" class="text-accent font-bold">
                Créer un compte
              </RouterLink>
            </p>
          </div>
        </div>
      </div>

      <p class="text-xs text-dim text-center mt-6">
        Astuce : installe l’app sur ton téléphone pour une expérience “vraie app”.
      </p>
    </div>
  </div>
</template>
