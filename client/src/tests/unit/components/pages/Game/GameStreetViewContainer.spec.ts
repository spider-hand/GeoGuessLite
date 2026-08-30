import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import GameStreetViewContainer from '@/components/pages/Game/GameStreetViewContainer.vue'
import { createAppI18n } from '@/i18n'

vi.mock('@/components/pages/Game/GameStreetView.vue', () => ({
  default: { template: '<div data-testid="street-view" />' },
}))

it('should render the default state properly', async () => {
  const screen = await render(GameStreetViewContainer, {
    props: { imageId: '524779645570864' },
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByRole('button', { name: 'Show Street View' })).toBeVisible()
  await expect.element(screen.getByTestId('street-view')).not.toBeInTheDocument()
})
