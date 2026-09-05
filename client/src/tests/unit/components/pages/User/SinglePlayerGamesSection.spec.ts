import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import { createAppI18n } from '@/i18n'

vi.mock('@/composables/useAuth', () => ({
  default: () => ({
    isLoadingUser: ref(false),
    user: ref({ gamesPlayed: 12, bestScore: 24000, averageScore: 12345.5 }),
  }),
}))
vi.mock('@/composables/useSinglePlayerGamesQuery', () => ({
  default: () => ({
    games: ref([
      {
        id: 'single-1',
        totalScore: 20000,
        totalDistanceKm: 42.5,
        completedAt: new Date('2026-09-05T00:00:00Z'),
      },
    ]),
    isError: ref(false),
    isLoading: ref(false),
  }),
}))

const SinglePlayerGamesSection = (
  await import('@/components/pages/User/SinglePlayerGamesSection.vue')
).default

it('should render stats and recent games', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/game/single-player/:gameId', name: 'single-player-game', component: {} }],
  })
  const screen = render(SinglePlayerGamesSection, {
    global: { plugins: [router, createAppI18n()] },
  })

  await expect.element(screen.getByText('24,000')).toBeVisible()
  await expect.element(screen.getByText('42.5 km')).toBeVisible()
  await expect
    .element(screen.getByRole('link', { name: /View game/ }))
    .toHaveAttribute('href', '/game/single-player/single-1')
})
