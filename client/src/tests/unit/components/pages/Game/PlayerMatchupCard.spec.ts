import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import PlayerMatchupCard from '@/components/pages/Game/PlayerMatchupCard.vue'
import { createAppI18n } from '@/i18n'

const renderCard = (withCountries = false) =>
  render(PlayerMatchupCard, {
    props: {
      playerOne: { name: 'Taylor Swift', country: withCountries ? 'jp' : undefined },
      playerTwo: { name: 'Opponent', country: withCountries ? 'kr' : undefined },
    },
    global: { plugins: [createAppI18n()] },
  })

it('should render the default state properly', async () => {
  const screen = renderCard()

  await expect.element(screen.getByText('Taylor Swift')).toBeVisible()
  await expect.element(screen.getByText('Opponent')).toBeVisible()
  await expect.element(screen.getByText('vs')).toBeVisible()
  expect(screen.container.querySelectorAll('img')).toHaveLength(0)
})

it('should show country flags when countries are provided', async () => {
  const screen = renderCard(true)

  await expect.element(screen.getByRole('img', { name: 'JP flag' })).toBeVisible()
  await expect.element(screen.getByRole('img', { name: 'KR flag' })).toBeVisible()
})
