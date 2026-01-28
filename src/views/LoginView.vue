<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

const onLogin = async () => {
  loading.value = true
  authStore.error = null
  try {
    await authStore.loginWithEmail(email.value.trim(), password.value)
    router.push('/home')
  } finally {
    loading.value = false
  }
}

const onGoogle = async () => {
  loading.value = true
  authStore.error = null
  try {
    await authStore.loginWithGoogle()
    router.push('/home')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white px-8 py-12 font-sans overflow-x-hidden flex items-center">
    <div class="w-full max-w-md mx-auto">
      <header class="mb-10">
        <h1 class="text-3xl text-slate-400">
          Emoria <span class="text-[--color-emoria-purple] font-bold">Connexion</span>
        </h1>
        <p class="text-slate-400 mt-2">Connecte-toi pour retrouver ton calendrier.</p>
      </header>

      <div class="p-6 border-2 border-purple-100 rounded-3xl bg-white shadow-xl shadow-purple-100/40">
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-600">Email</label>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="ex: marion@email.com"
              class="w-full p-4 rounded-3xl bg-slate-50 border border-slate-100 outline-none
                     focus:ring-2 focus:ring-purple-100 focus:border-purple-200 transition-all"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-600">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full p-4 rounded-3xl bg-slate-50 border border-slate-100 outline-none
                     focus:ring-2 focus:ring-purple-100 focus:border-purple-200 transition-all"
            />
          </div>

          <button
            @click="onLogin"
            :disabled="loading"
            class="w-full py-5 bg-[#6B46C1] text-white rounded-3xl font-bold text-lg
                   shadow-xl shadow-purple-100 active:scale-95 transition-all disabled:opacity-50"
          >
            Se connecter
          </button>

          <div class="flex items-center gap-3 py-2">
            <div class="h-px flex-1 bg-slate-100"></div>
            <span class="text-xs font-semibold text-slate-300">OU</span>
            <div class="h-px flex-1 bg-slate-100"></div>
          </div>

          <button
            @click="onGoogle"
            :disabled="loading"
            class="w-full py-5 bg-white border-2 border-purple-100 text-slate-700 rounded-3xl font-bold
                   active:scale-95 transition-all disabled:opacity-50"
          >
            Continuer avec Google
          </button>

          <p v-if="authStore.error" class="text-sm text-red-500 pt-2">
            {{ authStore.error }}
          </p>

          <div class="pt-3 text-center">
            <p class="text-sm text-slate-400">
              Pas de compte ?
              <RouterLink to="/register" class="text-[--color-emoria-purple] font-bold">
                Créer un compte
              </RouterLink>
            </p>
          </div>
        </div>
      </div>

      <p class="text-xs text-slate-300 text-center mt-6">
        Astuce : installe l’app sur ton téléphone pour une expérience “vraie app”.
      </p>
    </div>
  </div>
</template>
