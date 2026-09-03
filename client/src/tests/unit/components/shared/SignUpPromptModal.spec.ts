import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import SignUpPromptModal from '@/components/shared/SignUpPromptModal.vue'
import { createAppI18n } from '@/i18n'

const renderModal = (isOpen = true, isSigningUp = false) =>
  render(SignUpPromptModal, {
    props: { isOpen, isSigningUp },
    global: { plugins: [createAppI18n()] },
  })

it('should render the default state properly', async () => {
  const screen = renderModal(false)

  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
})

it.each(['close button', 'backdrop'] as const)(
  'should emit close from the %s dismissal affordance',
  async (affordance) => {
    const screen = renderModal()

    if (affordance === 'close button') {
      await screen.getByRole('button', { name: 'Close' }).click()
    } else {
      await screen.getByRole('presentation').click({ position: { x: 2, y: 2 } })
    }

    expect(screen.emitted('close')?.length).toBeGreaterThan(0)
  },
)

it('should emit sign-up from the call to action', async () => {
  const screen = renderModal()

  await screen.getByRole('button', { name: 'Sign Up', exact: true }).click()

  expect(screen.emitted('signUp')).toEqual([[]])
})

it('should disable the sign-up action while signing up', async () => {
  const screen = renderModal(true, true)
  const button = screen.getByRole('button', { name: 'Sign Up', exact: true })

  await expect.element(button).toBeDisabled()
  await expect.element(button).toHaveAttribute('aria-busy', 'true')
})
