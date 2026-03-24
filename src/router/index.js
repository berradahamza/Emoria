// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import DashboardView from "../views/DashboardView.vue";
import StepMoodView from "../views/StepMoodView.vue";
import StepFactorsView from "../views/StepFactorsView.vue";
import StepPositiveView from "../views/StepPositiveView.vue";
import StepSuccessView from "../views/StepSuccessView.vue";
import SuccessHistoryView from "../views/SuccessHistoryView.vue";

import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";

import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/home" },

    // Public
    { path: "/login", name: "login", component: LoginView, meta: { requiresAuth: false } },
    { path: "/register", name: "register", component: RegisterView, meta: { requiresAuth: false } },

    // Private
    { path: "/home", name: "home", component: HomeView, meta: { requiresAuth: true } },
    { path: "/dashboard", name: "dashboard", component: DashboardView, meta: { requiresAuth: true } },

    {
      path: "/step-mood",
      name: "step-mood",
      component: StepMoodView,
      meta: { requiresAuth: true },
    },
    {
      path: "/step-factors",
      name: "step-factors",
      component: StepFactorsView,
      meta: { requiresAuth: true },
    },
    {
      path: "/step-positives",
      name: "step-positives",
      component: StepPositiveView,
      meta: { requiresAuth: true },
    },
    {
      path: "/step-success",
      name: "step-success",
      component: StepSuccessView,
      meta: { requiresAuth: true },
    },
    {
      path: "/success-history",
      name: "success-history",
      component: SuccessHistoryView,
      meta: { requiresAuth: true },
    },
  ],
});

// Guard final (anti “déconnexion” au refresh)
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.isReady) {
    await authStore.initAuthListener();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "login" };
  }

  if ((to.name === "login" || to.name === "register") && authStore.isAuthenticated) {
    return { name: "home" };
  }

  return true;
});

export default router;
