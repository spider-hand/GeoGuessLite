import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import GameMapModal from '@/components/pages/Game/GameMapModal.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: {
    emits: ['select'],
    template:
      '<button data-testid="game-map" @click="$emit(\'select\', [139.7, 35.6])">Map</button>',
  },
}))

const defaultProps = {
  center: [139.6917, 35.6895] as [number, number],
  isOpen: true,
  isSelectable: true,
  markers: [],
  zoom: 10,
}

const renderModal = (isOpen = true) =>
  render(GameMapModal, {
    props: { ...defaultProps, isOpen },
    global: { plugins: [createAppI18n()] },
  })

it('should render the default state properly', async () => {
  const screen = renderModal()

  await expect.element(screen.getByRole('dialog', { name: 'Show map' })).toBeVisible()
  await expect.element(screen.getByTestId('game-map')).toBeVisible()
})

it('should emit open from the collapsed trigger', async () => {
  const screen = renderModal(false)

  await screen.getByRole('button', { name: 'Show map' }).click()

  expect(screen.emitted('open')).toEqual([[]])
})

it('should emit close from the open dialog', async () => {
  const screen = renderModal()

  await screen.getByRole('button', { name: 'Close' }).click()

  expect(screen.emitted('close')).toEqual([[]])
})

it('should forward a selected location', async () => {
  const screen = renderModal()

  await screen.getByTestId('game-map').click()

  expect(screen.emitted('select')).toEqual([[[139.7, 35.6]]])
})
