import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { ref } from 'vue'

import { createAppI18n } from '@/i18n'

const username = ref('')
const userCountry = ref<string | undefined>(undefined)
const isAuthenticatedUser = ref(false)
const isRegisteredUser = ref(false)
const isCurrentUserLoaded = ref(true)
const signUpWithGoogle = vi.fn()
const signOutUser = vi.fn()
const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/composables/useAuth', () => ({
  default: () => ({
    username,
    userCountry,
    isAuthenticatedUser,
    isRegisteredUser,
    isCurrentUserLoaded,
    signUpWithGoogle,
    signOutUser,
  }),
}))

const NavigationHeader = (await import('@/components/shared/NavigationHeader.vue')).default

const resetAuthState = () => {
  username.value = ''
  userCountry.value = undefined
  isAuthenticatedUser.value = false
  isRegisteredUser.value = false
  isCurrentUserLoaded.value = true
  push.mockReset()
  signUpWithGoogle.mockReset()
  signOutUser.mockReset()
}

const renderNavigationHeader = () =>
  render(NavigationHeader, {
    global: { plugins: [createAppI18n()] },
  })

it('should render the default state properly', async () => {
  resetAuthState()
  const { getByRole, getByText } = renderNavigationHeader()

  await expect.element(getByRole('button', { name: 'GeoGuessLite' })).toBeInTheDocument()
  await expect.element(getByText('Sign Up')).toBeInTheDocument()
})

it('should hide account actions while authentication is loading', () => {
  resetAuthState()
  isCurrentUserLoaded.value = false
  const { container } = renderNavigationHeader()

  expect(container.textContent).not.toContain('Sign Up')
  expect(container.querySelector('[aria-label="Account menu"]')).toBeNull()
})

it('should sign up and navigate home', async () => {
  resetAuthState()
  const { getByRole } = renderNavigationHeader()

  await getByRole('button', { name: 'Open navigation menu' }).click()
  await getByRole('button', { name: 'Sign Up' }).click()

  expect(signUpWithGoogle).toHaveBeenCalledOnce()
  await expect.poll(() => push.mock.calls).toContainEqual(['/'])
})

it('should render the authenticated account UI', () => {
  resetAuthState()
  username.value = 'Taylor Swift'
  userCountry.value = 'JP'
  isAuthenticatedUser.value = true
  isRegisteredUser.value = true
  const { container } = renderNavigationHeader()

  expect(container.querySelector('[aria-label="Account menu"]')).not.toBeNull()
})

it('should render the loading state when signing up', async () => {
  resetAuthState()
  let finishSignUp!: () => void
  signUpWithGoogle.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finishSignUp = resolve
      }),
  )
  const { container, getByRole } = renderNavigationHeader()

  await getByRole('button', { name: 'Open navigation menu' }).click()
  await getByRole('button', { name: 'Sign Up' }).click()

  await expect
    .poll(() =>
      container
        .querySelector('.navigation-header__cta-actions--desktop .button')
        ?.getAttribute('aria-busy'),
    )
    .toBe('true')

  finishSignUp()

  await expect
    .poll(() =>
      container
        .querySelector('.navigation-header__cta-actions--desktop .button')
        ?.getAttribute('aria-busy'),
    )
    .toBe('false')
})
