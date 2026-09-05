import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import { createAppI18n } from '@/i18n'

vi.mock('@/composables/useWithFriendsGamesQuery', () => ({
  default: () => ({
    games: ref([
      {
        id: 'friends-1',
        hostDisplayName: 'Host Player',
        hostCountry: 'JP',
        rank: 2,
        playerCount: 4,
        totalScore: 18000,
        totalDistanceKm: 81.2,
        completedAt: new Date('2026-09-05T00:00:00Z'),
      },
    ]),
    isError: ref(false),
    isLoading: ref(false),
  }),
}))

const FriendsGamesSection = (await import('@/components/pages/User/FriendsGamesSection.vue'))
  .default

it('should render the host and current player result', async () => {
  const router = createRouter({ history: createMemoryHistory(), routes: [] })
  const screen = render(FriendsGamesSection, { global: { plugins: [router, createAppI18n()] } })

  await expect.element(screen.getByText('Host Player')).toBeVisible()
  await expect.element(screen.getByText('2nd')).toBeVisible()
  await expect.element(screen.getByText('of 4')).toBeVisible()
  await expect.element(screen.getByText('81.2 km')).toBeVisible()
  await expect
    .element(screen.getByRole('link', { name: /View game/ }))
    .toHaveAttribute('href', '/game/with-friends/friends-1')
})
