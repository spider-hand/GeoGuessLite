import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import PlayerMatchupCard from '@/components/pages/Game/PlayerMatchupCard.vue'
import { createAppI18n } from '@/i18n'

it('should render the default state properly', async () => {
  const screen = await render(PlayerMatchupCard, {
    props: {
      playerOne: { name: 'Taylor Swift', country: 'JP' },
      playerTwo: { name: 'Opponent', country: 'KR' },
    },
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByText('Taylor Swift')).toBeVisible()
  await expect.element(screen.getByText('Opponent')).toBeVisible()
  await expect.element(screen.getByText('vs')).toBeVisible()
  await expect.element(screen.getByRole('img', { name: 'JP flag' })).toBeVisible()
  await expect.element(screen.getByRole('img', { name: 'KR flag' })).toBeVisible()
})
