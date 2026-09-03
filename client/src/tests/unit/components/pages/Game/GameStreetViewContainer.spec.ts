import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import GameStreetViewContainer from '@/components/pages/Game/GameStreetViewContainer.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameStreetView.vue', () => ({
  default: { template: '<div data-testid="street-view">Street View</div>' },
}))

const renderContainer = () =>
  render(GameStreetViewContainer, {
    props: { imageId: 'image-1' },
    global: { plugins: [createAppI18n()] },
  })

it('should render the default state properly', async () => {
  const screen = renderContainer()

  await expect.element(screen.getByRole('button', { name: 'Show Street View' })).toBeVisible()
  await expect.element(screen.getByTestId('street-view')).not.toBeInTheDocument()
})

it('should open Street View from the trigger', async () => {
  const screen = renderContainer()

  await screen.getByRole('button', { name: 'Show Street View' }).click()

  await expect.element(screen.getByRole('dialog', { name: 'Show Street View' })).toBeVisible()
  await expect.element(screen.getByTestId('street-view')).toBeVisible()
})

it('should close Street View from the dialog', async () => {
  const screen = renderContainer()

  await screen.getByRole('button', { name: 'Show Street View' }).click()
  await screen.getByRole('button', { name: 'Close Street View' }).click()

  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
})
