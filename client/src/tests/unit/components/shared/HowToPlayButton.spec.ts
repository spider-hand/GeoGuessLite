import { nextTick } from 'vue'
import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import HowToPlayButton from '@/components/shared/HowToPlayButton.vue'
import { createAppI18n } from '@/i18n'

const renderButton = () => render(HowToPlayButton, { global: { plugins: [createAppI18n()] } })

it('should render the default state properly', async () => {
  const screen = renderButton()

  await expect.element(screen.getByRole('button', { name: 'How to Play' })).toBeVisible()
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
})

it('should show and hide the instructions from the trigger', async () => {
  const screen = renderButton()
  const trigger = screen.getByRole('button', { name: 'How to Play' })

  await trigger.click()
  await expect.element(screen.getByRole('dialog', { name: 'How to Play' })).toBeVisible()

  await trigger.click()
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
})

it('should close the instructions when clicking outside', async () => {
  const screen = renderButton()

  await screen.getByRole('button', { name: 'How to Play' }).click()
  document.body.click()
  await nextTick()

  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
})
