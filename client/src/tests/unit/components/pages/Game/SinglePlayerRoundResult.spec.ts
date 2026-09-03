import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import SinglePlayerRoundResult from '@/components/pages/Game/SinglePlayerRoundResult.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: {
    props: ['markers'],
    template:
      '<div data-testid="result-map">{{ markers.map((marker) => marker.label).join(\', \') }}</div>',
  },
}))
vi.mock('@/components/pages/Game/GameStreetViewContainer.vue', () => ({
  default: { template: '<div>Street View</div>' },
}))

const defaultProps = {
  distanceKm: 18.4 as number | null,
  imageId: 'image-1',
  isFinalRound: false,
  isStartingNextRound: false,
  playerName: 'Guest',
  roundNumber: 1,
  score: 4210,
  selection: [139.6917, 35.6895] as [number, number] | null,
  target: [139.7671, 35.6812] as [number, number],
  totalScore: 4210,
}

const renderResult = (props: Partial<typeof defaultProps> = {}) =>
  render(SinglePlayerRoundResult, {
    props: { ...defaultProps, ...props },
    global: { plugins: [createAppI18n()] },
  })

it('should render the default state properly', async () => {
  const screen = renderResult()

  await expect.element(screen.getByRole('heading', { name: '4,210' })).toBeVisible()
  await expect.element(screen.getByText('18.4 km')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Next Round' })).toBeEnabled()
})

it('should show a timed-out round without a player guess', async () => {
  const screen = renderResult({ distanceKm: null, score: 0, selection: null })

  await expect.element(screen.getByText('No guess')).toBeVisible()
  await expect.element(screen.getByTestId('result-map')).toHaveTextContent('Correct location')
  await expect.element(screen.getByTestId('result-map')).not.toHaveTextContent('Guest')
})

it('should offer the summary after the final round', async () => {
  const screen = renderResult({ isFinalRound: true, roundNumber: 5 })

  await expect.element(screen.getByRole('button', { name: 'View Summary' })).toBeEnabled()
})

it('should emit continue from the primary action', async () => {
  const screen = renderResult()

  await screen.getByRole('button', { name: 'Next Round' }).click()

  expect(screen.emitted('continue')).toEqual([[]])
})

it('should disable the primary action while the next round is starting', async () => {
  const screen = renderResult({ isStartingNextRound: true })
  const button = screen.getByRole('button', { name: 'Next Round' })

  await expect.element(button).toBeDisabled()
  await expect.element(button).toHaveAttribute('aria-busy', 'true')
})
