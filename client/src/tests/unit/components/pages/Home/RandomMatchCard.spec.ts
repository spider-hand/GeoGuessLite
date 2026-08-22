import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import RandomMatchCard from '@/components/pages/Home/RandomMatchCard.vue'
import { createAppI18n } from '@/i18n'

describe('RandomMatchCard', () => {
  it('should render the default state properly', async () => {
    const screen = await render(RandomMatchCard, {
      props: { disabled: false, onlinePlayers: 40 },
      global: { plugins: [createAppI18n()] },
    })

    await expect.element(screen.getByRole('heading', { name: 'Random Match' })).toBeVisible()
    await expect.element(screen.getByText('40 players online')).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Coming Soon' })).toBeDisabled()
  })

  it.each([
    [1, '1 player online'],
    [1234, '1,234 players online'],
  ])('should format the online player count for %s players', async (onlinePlayers, label) => {
    const screen = await render(RandomMatchCard, {
      props: { disabled: false, onlinePlayers },
      global: { plugins: [createAppI18n()] },
    })

    await expect.element(screen.getByText(label)).toBeVisible()
  })
})
