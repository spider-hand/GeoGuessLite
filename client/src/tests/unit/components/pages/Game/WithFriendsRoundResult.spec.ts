import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import WithFriendsRoundResult from '@/components/pages/Game/WithFriendsRoundResult.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: {
    props: ['markers'],
    template: '<div data-testid="result-map">{{ markers[0]?.label }}</div>',
  },
}))
vi.mock('@/components/pages/Game/GameStreetViewContainer.vue', () => ({
  default: { template: '<div>Street View</div>' },
}))

const defaultProps = {
  currentUserId: 'current-user',
  imageId: 'image-1',
  players: [
    {
      userId: 'current-user',
      displayName: 'Current Player',
      country: 'JP',
      distanceKm: 18.4 as number | null,
      guess: [139.6917, 35.6895] as [number, number] | null,
      roundScore: 4210,
      totalScore: 4750,
    },
    {
      userId: 'leader',
      displayName: 'Round Leader',
      country: 'US',
      distanceKm: 5.8 as number | null,
      guess: [139.74, 35.68] as [number, number] | null,
      roundScore: 4750,
      totalScore: 4750,
    },
  ],
  roundNumber: 1,
  target: [139.7671, 35.6812] as [number, number],
}

const renderResult = (props: Partial<typeof defaultProps> = {}) =>
  render(WithFriendsRoundResult, {
    props: { ...defaultProps, ...props },
    global: { plugins: [createAppI18n()] },
  })

it('should render the default state properly', async () => {
  const screen = renderResult()

  await expect.element(screen.getByRole('heading', { name: 'Round 1 Results' })).toBeVisible()
  await expect.element(screen.getByText('The next round will start shortly.')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'View Summary' })).not.toBeInTheDocument()
})

it('should rank players by total score and round score', () => {
  const screen = renderResult()

  expect(
    Array.from(screen.container.querySelectorAll('ol button'), (button) => button.textContent),
  ).toEqual([expect.stringContaining('Round Leader'), expect.stringContaining('Current Player')])
})

it('should update the selected player shown on the map', async () => {
  const screen = renderResult()

  await screen.getByRole('button', { name: /Round Leader/ }).click()

  await expect.element(screen.getByTestId('result-map')).toHaveTextContent('Round Leader')
})

it('should render a player without a guess', async () => {
  const screen = renderResult({
    players: [{ ...defaultProps.players[0]!, distanceKm: null, guess: null, roundScore: 0 }],
  })

  await expect
    .element(screen.getByRole('button', { name: /Current Player/ }))
    .toHaveTextContent('No guess')
  await expect.element(screen.getByTestId('result-map')).toHaveTextContent('Correct location')
})

it('should show and emit view summary only after the final round', async () => {
  const screen = renderResult({ roundNumber: 5 })
  const button = screen.getByRole('button', { name: 'View Summary' })

  await expect.element(button).toBeVisible()
  await button.click()

  expect(screen.emitted('viewSummary')).toEqual([[]])
})
