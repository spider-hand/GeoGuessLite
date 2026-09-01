import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import WithFriendsRoundResult from '@/components/pages/Game/WithFriendsRoundResult.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: {
    props: ['markers'],
    template: '<div data-testid="result-map" :data-marker-count="markers.length" />',
  },
}))

it('should render the default state properly', async () => {
  const screen = await render(WithFriendsRoundResult, {
    props: {
      currentUserId: 'current-user',
      imageId: '524779645570864',
      players: [
        {
          userId: 'current-user',
          displayName: 'Current Player',
          country: 'JP',
          distanceKm: 18.4,
          guess: [139.6917, 35.6895],
          roundScore: 4210,
          totalScore: 4210,
        },
        {
          userId: 'leader',
          displayName: 'Round Leader',
          country: 'US',
          distanceKm: 5.8,
          guess: [139.74, 35.68],
          roundScore: 4750,
          totalScore: 4750,
        },
      ],
      roundNumber: 1,
      target: [139.7671, 35.6812],
    },
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByRole('heading', { name: 'Round 1 Results' })).toBeVisible()
  await expect.element(screen.getByText('Distance')).toBeVisible()
  await expect.element(screen.getByText('Round Leader')).toBeVisible()
  await expect.element(screen.getByText('Current Player')).toBeVisible()
  await expect.element(screen.getByText('18.4 km')).toBeVisible()
  await expect.element(screen.getByTestId('result-map')).toHaveAttribute('data-marker-count', '3')
})
