// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import StepMoodView from '../views/StepMoodView.vue'
import StepPositiveView from '../views/StepPositiveView.vue'
import StepSuccessView from '../views/StepSuccessView.vue'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/home' },

    // Public
    { path: '/login', name: 'login', component: LoginView, meta: { requiresAuth: false } },
    { path: '/register', name: 'register', component: RegisterView, meta: { requiresAuth: false } },

    // Private
    { path: '/home', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/step-mood', name: 'step-mood', component: StepMoodView, meta: { requiresAuth: true } },
    { path: '/step-positives', name: 'step-positives', component: StepPositiveView, meta: { requiresAuth: true } },
    { path: '/step-success', name: 'step-success', component: StepSuccessView, meta: { requiresAuth: true } }
  ]
})

// ✅ Guard
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Attendre que Firebase ait répondu au moins une fois
  if (!authStore.isReady && to.meta.requiresAuth) {
    return { name: 'login' } // fallback simple (on améliorera si besoin)
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    return { name: 'home' }
  }

  return true
})

export default router
