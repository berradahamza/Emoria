<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);

const onRegister = async () => {
  loading.value = true;
  authStore.error = null;
  try {
    await authStore.registerWithEmail(email.value.trim(), password.value);
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
          Emoria <span class="text-accent font-bold">Inscription</span>
        </h1>
        <p class="text-muted mt-2">Crée ton compte pour sauvegarder tes journées.</p>
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
              class="w-full p-4 rounded-3xl bg-input-bg border border-line outline-none text-heading placeholder-dim focus:ring-2 focus:ring-accent-faint focus:border-accent-light transition-all"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-body">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              autocomplete="new-password"
              placeholder="6 caractères minimum"
              class="w-full p-4 rounded-3xl bg-input-bg border border-line outline-none text-heading placeholder-dim focus:ring-2 focus:ring-accent-faint focus:border-accent-light transition-all"
            />
          </div>

          <button
            @click="onRegister"
            :disabled="loading"
            class="w-full py-5 bg-accent text-white rounded-3xl font-bold text-lg shadow-xl shadow-accent-glow active:scale-95 transition-all disabled:opacity-50"
          >
            Créer mon compte
          </button>

          <p v-if="authStore.error" class="text-sm text-danger pt-2">
            {{ authStore.error }}
          </p>

          <div class="pt-3 text-center">
            <p class="text-sm text-muted">
              Déjà un compte ?
              <RouterLink to="/login" class="text-accent font-bold"> Se connecter </RouterLink>
            </p>
          </div>
        </div>
      </div>

      <p class="text-xs text-dim text-center mt-6">
        Tes données sont privées et rattachées à ton compte.
      </p>
    </div>
  </div>
</template>
