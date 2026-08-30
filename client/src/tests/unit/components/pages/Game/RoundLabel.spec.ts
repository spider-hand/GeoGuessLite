import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import RoundLabel from '@/components/pages/Game/RoundLabel.vue'
import { createAppI18n } from '@/i18n'

it('should render the default state properly', async () => {
  const screen = await render(RoundLabel, {
    props: { currentRound: 1, totalRounds: 5 },
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByText('Round 1 of 5')).toBeVisible()
})
