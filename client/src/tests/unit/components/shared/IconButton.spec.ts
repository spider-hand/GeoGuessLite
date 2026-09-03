import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import IconButton from '@/components/shared/IconButton.vue'

const renderButton = (disabled = false) =>
  render(IconButton, {
    props: { ariaLabel: 'Close', disabled },
    slots: { default: '<span aria-hidden="true">×</span>' },
  })

it('should render the default state properly', async () => {
  const screen = renderButton()

  await expect.element(screen.getByRole('button', { name: 'Close' })).toBeEnabled()
})

it('should emit the click event when enabled', async () => {
  const screen = renderButton()

  await screen.getByRole('button', { name: 'Close' }).click()

  expect(screen.emitted('click')).toHaveLength(1)
})

it('should prevent interaction when disabled', async () => {
  const screen = renderButton(true)
  const button = screen.getByRole('button', { name: 'Close' })

  await expect.element(button).toBeDisabled()
  await button.click({ force: true })
  expect(screen.emitted('click')).toBeUndefined()
})
