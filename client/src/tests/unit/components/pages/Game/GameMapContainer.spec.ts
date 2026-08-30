import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import GameMapContainer from '@/components/pages/Game/GameMapContainer.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: { template: '<div />' },
}))

vi.mock('@/components/pages/Game/GameMapModal.vue', () => ({
  default: { template: '<div><slot /></div>' },
}))

it('should render the default state properly', async () => {
  const screen = await render(GameMapContainer, {
    props: { isSubmitting: false, playerName: 'Guest', selection: null },
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByRole('button', { name: 'Make Guess' }).first()).toBeDisabled()
})
