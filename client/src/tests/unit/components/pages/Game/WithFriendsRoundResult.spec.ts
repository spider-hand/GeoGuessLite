import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import WithFriendsRoundResult from '@/components/pages/Game/WithFriendsRoundResult.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: {
    props: ['markers'],
    template:
      '<div data-testid="result-map" :data-marker-count="markers.length" :data-first-marker="markers[0]?.label" />',
  },
}))

const defaultProps = {
  currentUserId: 'current-user',
  imageId: '524779645570864',
  players: [
    {
      userId: 'current-user',
      displayName: 'Current Player',
      country: 'JP',
      distanceKm: 18.4,
      guess: [139.6917, 35.6895] as [number, number],
      roundScore: 4210,
      totalScore: 4750,
    },
    {
      userId: 'leader',
      displayName: 'Round Leader',
      country: 'US',
      distanceKm: 5.8,
      guess: [139.74, 35.68] as [number, number],
      roundScore: 4750,
      totalScore: 4750,
    },
  ],
  roundNumber: 1,
  target: [139.7671, 35.6812] as [number, number],
}

it('should render the default state properly', async () => {
  const screen = await render(WithFriendsRoundResult, {
    props: defaultProps,
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByRole('heading', { name: 'Round 1 Results' })).toBeVisible()
  await expect.element(screen.getByText('Distance')).toBeVisible()
  await expect.element(screen.getByText('Round Leader')).toBeVisible()
  await expect.element(screen.getByText('Current Player')).toBeVisible()
  await expect.element(screen.getByText('18.4 km')).toBeVisible()
  await expect.element(screen.getByText('The next round will start shortly.')).toBeVisible()
  expect(screen.container.textContent).not.toContain('View Summary')
  await expect.element(screen.getByTestId('result-map')).toHaveAttribute('data-marker-count', '3')
  expect(
    Array.from(screen.container.querySelectorAll('ol button'), (button) => button.textContent),
  ).toEqual([expect.stringContaining('Round Leader'), expect.stringContaining('Current Player')])

  await screen.getByRole('button', { name: /Round Leader/ }).click()

  await expect
    .element(screen.getByTestId('result-map'))
    .toHaveAttribute('data-first-marker', 'Round Leader')
})

it('should emit view summary from the final round', async () => {
  const screen = await render(WithFriendsRoundResult, {
    props: { ...defaultProps, roundNumber: 5 },
    global: { plugins: [createAppI18n()] },
  })

  expect(screen.container.textContent).not.toContain('The next round will start shortly.')
  await screen.getByRole('button', { name: 'View Summary' }).click()

  expect(screen.emitted('viewSummary')).toEqual([[]])
})
