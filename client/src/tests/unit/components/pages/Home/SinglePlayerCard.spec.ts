import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import SinglePlayerCard from '@/components/pages/Home/SinglePlayerCard.vue'
import { createAppI18n } from '@/i18n'

describe('SinglePlayerCard', () => {
  it('should render the default state properly', async () => {
    const screen = await render(SinglePlayerCard, {
      props: { disabled: false, isStartingGame: false },
      global: { plugins: [createAppI18n()] },
    })

    await expect.element(screen.getByRole('heading', { name: 'Single Player' })).toBeVisible()
    await expect.element(screen.getByRole('button', { name: 'Start Game' })).toBeEnabled()
  })

  it('should emit the start action', async () => {
    const screen = await render(SinglePlayerCard, {
      props: { disabled: false, isStartingGame: false },
      global: { plugins: [createAppI18n()] },
    })

    await screen.getByRole('button', { name: 'Start Game' }).click()

    expect(screen.emitted('startSinglePlayer')).toHaveLength(1)
  })

  it.each<[string, { disabled: boolean; isStartingGame: boolean }]>([
    ['unavailable', { disabled: true, isStartingGame: false }],
    ['starting', { disabled: false, isStartingGame: true }],
  ])('should disable the start action when %s', async (_, props) => {
    const screen = await render(SinglePlayerCard, {
      props,
      global: { plugins: [createAppI18n()] },
    })

    const button = screen.getByRole('button', { name: 'Start Game' })
    await expect.element(button).toBeDisabled()
    expect(screen.container.querySelector('button')?.getAttribute('aria-busy')).toBe(
      String(props.isStartingGame),
    )
  })
})
