import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import Button from '@/components/shared/Button.vue'

it('should render the default state properly', async () => {
  const screen = render(Button, { slots: { default: 'Continue' } })

  await expect.element(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
})

it('should emit the click event when enabled', async () => {
  const screen = render(Button, { slots: { default: 'Continue' } })

  await screen.getByRole('button', { name: 'Continue' }).click()

  expect(screen.emitted('click')).toHaveLength(1)
})

it('should prevent interaction when disabled', async () => {
  const screen = render(Button, { props: { disabled: true }, slots: { default: 'Continue' } })
  const button = screen.getByRole('button', { name: 'Continue' })

  await expect.element(button).toBeDisabled()
  await button.click({ force: true })
  expect(screen.emitted('click')).toBeUndefined()
})

it('should expose a busy disabled state and prevent interaction while loading', async () => {
  const screen = render(Button, { props: { loading: true }, slots: { default: 'Continue' } })
  const button = screen.getByRole('button', { name: 'Continue' })

  await expect.element(button).toBeDisabled()
  await expect.element(button).toHaveAttribute('aria-busy', 'true')
  await button.click({ force: true })
  expect(screen.emitted('click')).toBeUndefined()
})
