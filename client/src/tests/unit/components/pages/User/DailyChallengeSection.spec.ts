import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import { createAppI18n } from '@/i18n'

vi.mock('@/composables/useAuth', () => ({
  default: () => ({ user: ref({ userId: 'user-1' }) }),
}))
vi.mock('@/composables/useDailyChallengeLeaderboardQuery', () => ({
  default: () => ({
    entries: ref([
      { rank: 1, userId: 'user-1', displayName: 'Taylor', country: 'JP', totalScore: 25000 },
    ]),
    isError: ref(false),
    isLoading: ref(false),
  }),
}))
vi.mock('@/composables/useDailyChallengeHistoryQuery', () => ({
  default: () => ({
    games: ref([
      {
        id: 'daily-1',
        date: new Date('2026-09-04T00:00:00Z'),
        totalScore: 21000,
        totalDistanceKm: null,
      },
    ]),
    isError: ref(false),
    isLoading: ref(false),
  }),
}))

const DailyChallengeSection = (await import('@/components/pages/User/DailyChallengeSection.vue'))
  .default

it('should render the leaderboard and recent challenges', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/game/daily-challenge/:gameId',
        name: 'daily-challenge-history',
        component: {},
      },
    ],
  })
  const screen = render(DailyChallengeSection, {
    global: { plugins: [router, createAppI18n()] },
  })

  await expect.element(screen.getByText('Taylor')).toBeVisible()
  await expect.element(screen.getByText('25,000')).toBeVisible()
  await expect.element(screen.getByText('—')).toBeVisible()
  await expect
    .element(screen.getByRole('link', { name: /View game/ }))
    .toHaveAttribute('href', '/game/daily-challenge/daily-1')
})

it('should offer the seven supported UTC challenge dates', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/game/daily-challenge/:gameId',
        name: 'daily-challenge-history',
        component: {},
      },
    ],
  })
  const screen = render(DailyChallengeSection, { global: { plugins: [router, createAppI18n()] } })

  await screen.getByRole('button', { expanded: false }).click()

  await expect.element(screen.getByRole('menu')).toBeVisible()
  expect(screen.getByRole('menuitemradio').all()).toHaveLength(7)
})
