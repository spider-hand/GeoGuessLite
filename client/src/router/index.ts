import { createRouter, createWebHistory } from 'vue-router'

import GameRandomMatchPage from '@/pages/GameRandomMatchPage.vue'
import GameVsAiPage from '@/pages/GameVsAiPage.vue'
import GameWithFriendsPage from '@/pages/GameWithFriendsPage.vue'
import HomePage from '@/pages/HomePage.vue'
import PrivacyPage from '@/pages/PrivacyPage.vue'
import TermsPage from '@/pages/TermsPage.vue'
import UserPage from '@/pages/UserPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/terms',
      component: TermsPage,
    },
    {
      path: '/privacy',
      component: PrivacyPage,
    },
    {
      path: '/user',
      component: UserPage,
    },
    {
      path: '/game/vs-ai/:gameId',
      component: GameVsAiPage,
    },
    {
      path: '/game/with-friends/:gameId',
      component: GameWithFriendsPage,
    },
    {
      path: '/game/random-match',
      component: GameRandomMatchPage,
    },
  ],
})

export default router
