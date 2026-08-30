import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import SinglePlayerRoundResult from '@/components/pages/Game/SinglePlayerRoundResult.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: { template: '<div data-testid="result-map" />' },
}))

const defaultProps = {
  distanceKm: 18.4,
  imageId: '524779645570864',
  isFinalRound: false,
  isStartingNextRound: false,
  playerName: 'Guest',
  roundNumber: 1,
  score: 4210,
  selection: [139.6917, 35.6895] as [number, number],
  target: [139.7671, 35.6812] as [number, number],
  totalScore: 4210,
}

it('should render the default state properly', async () => {
  const screen = await render(SinglePlayerRoundResult, {
    props: defaultProps,
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByRole('heading', { name: '4,210' })).toBeVisible()
  await expect.element(screen.getByText('18.4 km')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Next Round' })).toBeVisible()
})
