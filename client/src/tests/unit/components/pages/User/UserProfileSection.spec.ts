import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import { createAppI18n } from '@/i18n'

const username = ref('Taylor')
const userCountry = ref<string | undefined>('JP')
const updateUserAsync = vi.fn()
const deleteUserAsync = vi.fn()
const signOutUser = vi.fn()

vi.mock('@/composables/useAuth', () => ({
  default: () => ({ username, userCountry, signOutUser }),
}))
vi.mock('@/composables/useUserQuery', () => ({
  default: () => ({
    deleteUserAsync,
    isDeletingUser: ref(false),
    isUpdatingUser: ref(false),
    updateUserAsync,
  }),
}))

const UserProfileSection = (await import('@/components/pages/User/UserProfileSection.vue')).default

beforeEach(() => {
  updateUserAsync.mockReset().mockResolvedValue(undefined)
  deleteUserAsync.mockReset().mockResolvedValue(undefined)
  signOutUser.mockReset().mockResolvedValue(undefined)
})

const renderSection = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  })
  await router.push('/user')
  return render(UserProfileSection, { global: { plugins: [router, createAppI18n()] } })
}

it('should render the default state properly', async () => {
  const screen = await renderSection()

  await expect.element(screen.getByText('Taylor')).toBeVisible()
  await expect.element(screen.getByAltText('JP flag')).toBeVisible()
})

it('should save an edited display name', async () => {
  const screen = await renderSection()

  await screen.getByRole('button', { name: 'Edit Profile' }).click()
  await screen.getByRole('textbox').first().fill('Taylor Two')
  await screen.getByRole('button', { name: 'Save Changes' }).click()

  expect(updateUserAsync).toHaveBeenCalledWith({ displayName: 'Taylor Two', country: 'JP' })
})

it('should delete the account and sign out after confirmation', async () => {
  const screen = await renderSection()

  await screen.getByRole('button', { name: 'Delete Account' }).click()
  await screen.getByPlaceholder('Type Delete to continue').fill('Delete')
  await screen.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect.poll(() => signOutUser.mock.calls.length).toBe(1)
  expect(deleteUserAsync).toHaveBeenCalledOnce()
})
