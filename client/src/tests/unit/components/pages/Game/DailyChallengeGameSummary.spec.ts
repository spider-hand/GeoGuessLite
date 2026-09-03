import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import DailyChallengeGameSummary from '@/components/pages/Game/DailyChallengeGameSummary.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: {
    props: ['markers'],
    template: '<div data-testid="summary-map">{{ markers[0]?.label }}</div>',
  },
}))
vi.mock('@/components/pages/Game/GameStreetViewContainer.vue', () => ({
  default: { props: ['imageId'], template: '<div>Street View {{ imageId }}</div>' },
}))

const rounds = [
  {
    distanceKm: 18.4,
    imageId: 'image-1',
    roundNumber: 1,
    score: 4210,
    selection: [139.6917, 35.6895] as [number, number],
    target: [139.7671, 35.6812] as [number, number],
  },
  {
    distanceKm: null,
    imageId: 'image-2',
    roundNumber: 2,
    score: 0,
    selection: null,
    target: [-74.006, 40.7128] as [number, number],
  },
]

const renderSummary = () =>
  render(DailyChallengeGameSummary, {
    props: { playerName: 'Guest', rounds, totalScore: 4210 },
    global: { plugins: [createAppI18n()] },
  })

it('should render the default state properly', async () => {
  const screen = renderSummary()

  await expect.element(screen.getByRole('heading', { name: '4,210' })).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Home' })).toBeVisible()
  await expect.element(screen.getByText('Street View image-1')).toBeVisible()
})

it('should show the selected round on the map and Street View', async () => {
  const screen = renderSummary()

  await screen.getByRole('button', { name: /Round 2/ }).click()

  await expect
    .element(screen.getByRole('button', { name: /Round 2/ }))
    .toHaveAttribute('aria-pressed', 'true')
  await expect.element(screen.getByText('Street View image-2')).toBeVisible()
  await expect.element(screen.getByTestId('summary-map')).toHaveTextContent('Correct location')
})

it('should show the no-guess result for a timed-out round', async () => {
  const screen = renderSummary()

  await expect
    .element(screen.getByRole('button', { name: /Round 2/ }))
    .toHaveTextContent('No guess')
})

it('should emit home from the home action', async () => {
  const screen = renderSummary()

  await screen.getByRole('button', { name: 'Home' }).click()

  expect(screen.emitted('home')).toEqual([[]])
})
