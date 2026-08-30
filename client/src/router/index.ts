import { createRouter, createWebHistory } from 'vue-router'

import { signInAnonymouslyIfNeeded } from '@/composables/useAuth'
import GameDailyChallengePage from '@/pages/GameDailyChallengePage.vue'
import GameRandomMatchPage from '@/pages/GameRandomMatchPage.vue'
import GameSinglePlayerPage from '@/pages/GameSinglePlayerPage.vue'
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
      path: '/game/single-player/:gameId',
      name: 'single-player-game',
      component: GameSinglePlayerPage,
      beforeEnter: async () => {
        await signInAnonymouslyIfNeeded()
      },
    },
    {
      path: '/game/daily-challenge',
      component: GameDailyChallengePage,
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
