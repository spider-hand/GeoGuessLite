import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import GameMapModal from '@/components/pages/Game/GameMapModal.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: {
    name: 'GameMap',
    template: '<div data-testid="game-map" />',
  },
}))

const defaultProps = {
  center: [139.6917, 35.6895] as [number, number],
  isOpen: true,
  isSelectable: true,
  markers: [],
  zoom: 10,
}

it('should render the default state properly', async () => {
  const screen = await render(GameMapModal, {
    props: defaultProps,
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByRole('dialog', { name: 'Show map' })).toBeVisible()
  await expect.element(screen.getByTestId('game-map')).toBeVisible()
})
