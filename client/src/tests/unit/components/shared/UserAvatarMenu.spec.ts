import { nextTick, ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import { createAppI18n } from '@/i18n'

const isRegisteredUser = ref(true)

vi.mock('@/composables/useAuth', () => ({
  default: () => ({ isRegisteredUser }),
}))

const UserAvatarMenu = (await import('@/components/shared/UserAvatarMenu.vue')).default

beforeEach(() => {
  isRegisteredUser.value = true
})

const renderMenu = (country?: string) =>
  render(UserAvatarMenu, {
    props: { displayName: 'Taylor Swift', country },
    global: { plugins: [createAppI18n()] },
  })

it('should render the default state properly', async () => {
  const screen = renderMenu()

  await expect.element(screen.getByRole('button', { name: 'Account menu' })).toBeVisible()
  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument()
})

it('should show the registered user identity, country, and profile action', async () => {
  const screen = renderMenu('jp')

  await screen.getByRole('button', { name: 'Account menu' }).click()

  await expect.element(screen.getByText('Taylor Swift')).toBeVisible()
  await expect.element(screen.getByRole('img', { name: 'JP flag' })).toBeVisible()
  await expect.element(screen.getByRole('menuitem', { name: 'Profile' })).toBeVisible()
})

it('should omit the profile action for an unregistered user', async () => {
  isRegisteredUser.value = false
  const screen = renderMenu()

  await screen.getByRole('button', { name: 'Account menu' }).click()

  await expect.element(screen.getByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument()
  await expect.element(screen.getByRole('menuitem', { name: 'Sign Out' })).toBeVisible()
})

it.each([
  ['Profile', 'profileClick'],
  ['Sign Out', 'signOutClick'],
] as const)('should emit the %s account action and close the menu', async (label, event) => {
  const screen = renderMenu()

  await screen.getByRole('button', { name: 'Account menu' }).click()
  await screen.getByRole('menuitem', { name: label }).click()

  expect(screen.emitted(event)).toEqual([[]])
  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument()
})

it('should close the menu when clicking outside', async () => {
  const screen = renderMenu()

  await screen.getByRole('button', { name: 'Account menu' }).click()
  document.body.click()
  await nextTick()

  await expect.element(screen.getByRole('menu')).not.toBeInTheDocument()
})
