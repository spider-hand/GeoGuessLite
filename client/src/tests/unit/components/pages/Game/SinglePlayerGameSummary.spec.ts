import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import SinglePlayerGameSummary from '@/components/pages/Game/SinglePlayerGameSummary.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: { template: '<div data-testid="summary-map" />' },
}))

const rounds = [
  {
    distanceKm: 18.4,
    imageId: '524779645570864',
    roundNumber: 1,
    score: 4210,
    selection: [139.6917, 35.6895] as [number, number],
    target: [139.7671, 35.6812] as [number, number],
  },
  {
    distanceKm: null,
    imageId: '594714265713739',
    roundNumber: 2,
    score: 0,
    selection: null,
    target: [-74.006, 40.7128] as [number, number],
  },
]

it('should render the default state properly', async () => {
  const screen = await render(SinglePlayerGameSummary, {
    props: { isStartingNewGame: false, playerName: 'Guest', rounds, totalScore: 4210 },
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByRole('button', { name: 'Play Again' })).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Home' })).toBeVisible()
})
