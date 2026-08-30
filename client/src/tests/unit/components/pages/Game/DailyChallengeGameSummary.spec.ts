import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import DailyChallengeGameSummary from '@/components/pages/Game/DailyChallengeGameSummary.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: { template: '<div data-testid="summary-map" />' },
}))

it('should render the default state properly', async () => {
  const screen = await render(DailyChallengeGameSummary, {
    props: {
      playerName: 'Guest',
      rounds: [
        {
          distanceKm: 18.4,
          imageId: '524779645570864',
          roundNumber: 1,
          score: 4210,
          selection: [139.6917, 35.6895],
          target: [139.7671, 35.6812],
        },
      ],
      totalScore: 4210,
    },
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByRole('heading', { name: '4,210' })).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Home' })).toBeVisible()
})
