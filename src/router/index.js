import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StepMoodView from '../views/StepMoodView.vue'
import StepPositiveView from '../views/StepPositiveView.vue'
import StepSuccessView from '../views/StepSuccessView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home' // Redirection par défaut
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/step-mood',
      name: 'step-mood',
      component: StepMoodView
    },
    {
      path: '/step-positives',
      name: 'step-positives',
      component: StepPositiveView
    },
    {
      path: '/step-success',
      name: 'step-success',
      component: StepSuccessView
    }
  ]
})

export default router