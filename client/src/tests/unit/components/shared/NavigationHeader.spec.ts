import { ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import { createAppI18n } from '@/i18n'

const username = ref('')
const userCountry = ref<string | undefined>()
const isAuthenticatedUser = ref(false)
const isRegisteredUser = ref(false)
const isCurrentUserLoaded = ref(true)
const signUpWithGoogle = vi.fn()
const signOutUser = vi.fn()
const push = vi.fn()

vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))
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

beforeEach(() => {
  username.value = ''
  userCountry.value = undefined
  isAuthenticatedUser.value = false
  isRegisteredUser.value = false
  isCurrentUserLoaded.value = true
  signUpWithGoogle.mockReset().mockResolvedValue(undefined)
  signOutUser.mockReset().mockResolvedValue(undefined)
  push.mockReset().mockResolvedValue(undefined)
  vi.spyOn(window, 'open').mockImplementation(() => null)
  localStorage.clear()
})

const renderHeader = () => render(NavigationHeader, { global: { plugins: [createAppI18n()] } })

it('should render the default state properly', async () => {
  const screen = renderHeader()

  await expect.element(screen.getByRole('button', { name: 'GeoGuessLite' })).toBeVisible()
  await expect.element(screen.getByText('Sign Up').first()).toBeInTheDocument()
})

it('should hide account actions until authentication has loaded', async () => {
  isCurrentUserLoaded.value = false
  const screen = renderHeader()

  await expect
    .element(screen.getByRole('button', { name: 'Sign Up', exact: true }))
    .not.toBeInTheDocument()
  await expect.element(screen.getByRole('button', { name: 'Account menu' })).not.toBeInTheDocument()
})

it('should navigate home from the brand', async () => {
  const screen = renderHeader()

  await screen.getByRole('button', { name: 'GeoGuessLite' }).click()

  expect(push).toHaveBeenCalledWith('/')
})

it.each([
  ['GitHub repository link', 'https://github.com/spider-hand/GeoGuessLite'],
  ['Discord server link', 'https://discord.gg/H9RwrfgeDH'],
] as const)('should open the configured %s community link', async (label, url) => {
  const screen = renderHeader()

  screen.container.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!.click()

  expect(window.open).toHaveBeenCalledWith(url, '_blank', 'noopener,noreferrer')
})

it('should show the signing-up state and navigate home after sign-up', async () => {
  let finishSignUp!: () => void
  signUpWithGoogle.mockImplementation(
    () => new Promise<void>((resolve) => (finishSignUp = resolve)),
  )
  const screen = renderHeader()
  const signUp = screen.container.querySelector<HTMLButtonElement>(
    '.navigation-header__cta-actions--desktop button',
  )!

  signUp.click()
  await expect.poll(() => signUp.getAttribute('aria-busy')).toBe('true')
  finishSignUp()

  await expect.poll(() => push.mock.calls).toContainEqual(['/'])
  await expect.poll(() => signUp.getAttribute('aria-busy')).toBe('false')
})

it('should expose registered-user profile and sign-out actions', async () => {
  username.value = 'Taylor Swift'
  userCountry.value = 'jp'
  isAuthenticatedUser.value = true
  isRegisteredUser.value = true
  const screen = renderHeader()

  screen.container.querySelector<HTMLButtonElement>('[aria-label="Account menu"]')!.click()
  await expect.element(screen.getByText('Profile')).toBeInTheDocument()
  Array.from(screen.container.querySelectorAll<HTMLButtonElement>('.user-avatar-menu__item'))
    .find((button) => button.textContent?.trim() === 'Profile')!
    .click()
  expect(push).toHaveBeenCalledWith('/user')

  screen.container.querySelector<HTMLButtonElement>('[aria-label="Account menu"]')!.click()
  Array.from(screen.container.querySelectorAll<HTMLButtonElement>('.user-avatar-menu__item'))
    .find((button) => button.textContent?.trim() === 'Sign Out')!
    .click()
  expect(signOutUser).toHaveBeenCalledOnce()
  await expect.poll(() => push.mock.calls).toContainEqual(['/'])
})

it('should open the mobile menu and expose its user-visible sections', async () => {
  const screen = renderHeader()

  await screen.getByRole('button', { name: 'Open navigation menu' }).click({ force: true })

  await expect.element(screen.getByTestId('navigation-header-mobile-panel')).toBeInTheDocument()
  await expect
    .element(screen.getByRole('button', { name: 'How to Play' }).last())
    .toBeInTheDocument()
  await expect.element(screen.getByRole('button', { name: 'Language' })).toBeInTheDocument()
})

it('should select a language from the mobile menu and emit the selection', async () => {
  const screen = renderHeader()

  await screen.getByRole('button', { name: 'Open navigation menu' }).click({ force: true })
  await screen.getByRole('button', { name: 'Language' }).click({ force: true })
  await screen.getByRole('button', { name: /日本語/ }).click({ force: true })

  expect(screen.emitted('languageSelect')).toEqual([['ja']])
  await expect.element(screen.getByTestId('navigation-header-mobile-panel')).not.toBeInTheDocument()
})
