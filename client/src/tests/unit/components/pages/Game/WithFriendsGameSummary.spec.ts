import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import WithFriendsGameSummary from '@/components/pages/Game/WithFriendsGameSummary.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: {
    props: ['markers'],
    template: '<div data-testid="summary-map" :data-marker-count="markers.length" />',
  },
}))

it('should render the default state properly', async () => {
  const screen = await render(WithFriendsGameSummary, {
    props: {
      canCreateRoom: true,
      currentUserId: 'current-user',
      isCreatingRoom: false,
      players: [
        {
          userId: 'current-user',
          displayName: 'Current Player',
          country: 'JP',
          totalScore: 18_450,
        },
        {
          userId: 'winner',
          displayName: 'Winning Player',
          country: 'US',
          totalScore: 22_110,
        },
      ],
      rounds: [
        {
          imageId: '524779645570864',
          roundNumber: 1,
          target: [139.7671, 35.6812],
          results: [
            {
              userId: 'current-user',
              distanceKm: 18.4,
              guess: [139.6917, 35.6895],
              score: 4210,
            },
            {
              userId: 'winner',
              distanceKm: 5.8,
              guess: [139.74, 35.68],
              score: 4750,
            },
          ],
        },
      ],
    },
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByRole('heading', { name: 'Game Summary' })).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Round history' })).toBeVisible()
  await expect.element(screen.getByText('Distance')).toBeVisible()
  await expect.element(screen.getByText('Winning Player')).toBeVisible()
  await expect.element(screen.getByText('Current Player')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Create Room' })).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Exit' })).toBeVisible()
  await expect.element(screen.getByTestId('summary-map')).toHaveAttribute('data-marker-count', '3')
})
