import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import { createAppI18n } from '@/i18n'

const isCurrentUserLoaded = ref(true)
const isLoadingUser = ref(false)
const isRegisteredUser = ref(false)
const user = ref({ dailyChallengeStatus: 'available' as const })
const signInAnonymously = vi.fn()
const signUpWithGoogle = vi.fn()
const createGameAsync = vi.fn()
const createWithFriendsGame = vi.fn()
const joinWithFriendsGame = vi.fn()

vi.mock('@/composables/useAuth', () => ({
  default: () => ({
    isCurrentUserLoaded,
    isLoadingUser,
    isRegisteredUser,
    signInAnonymously,
    signUpWithGoogle,
    user,
  }),
}))
vi.mock('@/composables/useSinglePlayerGameQuery', () => ({
  default: () => ({ createGameAsync }),
}))
vi.mock('@/composables/useWithFriendsGameApi', () => ({
  default: () => ({ createGame: createWithFriendsGame, joinGame: joinWithFriendsGame }),
}))
vi.mock('@/components/shared/NavigationHeader.vue', () => ({ default: { template: '<header />' } }))
vi.mock('@/components/shared/NavigationFooter.vue', () => ({ default: { template: '<footer />' } }))

const HomePage = (await import('@/pages/HomePage.vue')).default

beforeEach(() => {
  isCurrentUserLoaded.value = true
  isLoadingUser.value = false
  isRegisteredUser.value = false
  user.value = { dailyChallengeStatus: 'available' }
  signInAnonymously.mockReset().mockResolvedValue(undefined)
  signUpWithGoogle.mockReset().mockResolvedValue(undefined)
  createGameAsync.mockReset().mockResolvedValue({ id: 'single-123' })
  createWithFriendsGame.mockReset().mockResolvedValue({ id: 'friends-123' })
  joinWithFriendsGame.mockReset().mockResolvedValue({ id: 'friends-456' })
})

const renderPage = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomePage },
      {
        path: '/game/single-player/:gameId',
        name: 'single-player-game',
        component: { template: '<div />' },
      },
      {
        path: '/game/daily-challenge',
        name: 'daily-challenge-game',
        component: { template: '<div />' },
      },
      { path: '/game/with-friends/:gameId', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  await router.isReady()
  return { router, screen: render(HomePage, { global: { plugins: [router, createAppI18n()] } }) }
}

it('should render the default state properly', async () => {
  const { screen } = await renderPage()

  await expect.element(screen.getByRole('img', { name: 'Hero Image' })).toBeVisible()
  expect(
    Array.from(screen.container.querySelectorAll('h2'), (heading) => heading.textContent?.trim()),
  ).toEqual(['Single Player', 'Play with Friends', 'Daily Challenge', 'Random Match'])
})

it('should create and enter a single-player game', async () => {
  const { router, screen } = await renderPage()

  await screen.getByRole('button', { name: 'Start Game' }).first().click()

  expect(signInAnonymously).toHaveBeenCalledOnce()
  expect(createGameAsync).toHaveBeenCalledOnce()
  await expect.poll(() => router.currentRoute.value.path).toBe('/game/single-player/single-123')
})

it.each(['create room', 'enter room', 'daily challenge'] as const)(
  'should prompt an unregistered user before the %s action',
  async (action) => {
    const { router, screen } = await renderPage()

    if (action === 'create room') await screen.getByRole('button', { name: 'Create Room' }).click()
    if (action === 'enter room') {
      await screen.getByPlaceholder('6-Digit Key').fill('123456')
      await screen.getByRole('button', { name: 'Enter Room' }).click()
    }
    if (action === 'daily challenge')
      await screen.getByRole('button', { name: 'Start Game' }).last().click()

    await expect
      .element(screen.getByRole('dialog', { name: 'Welcome to GeoGuessLite' }))
      .toBeVisible()
    expect(router.currentRoute.value.path).toBe('/')
  },
)

it.each(['create room', 'enter room', 'daily challenge'] as const)(
  'should navigate registered users to the selected %s mode',
  async (action) => {
    isRegisteredUser.value = true
    const { router, screen } = await renderPage()

    if (action === 'create room') await screen.getByRole('button', { name: 'Create Room' }).click()
    if (action === 'enter room') {
      await screen.getByPlaceholder('6-Digit Key').fill('123456')
      await screen.getByRole('button', { name: 'Enter Room' }).click()
    }
    if (action === 'daily challenge')
      await screen.getByRole('button', { name: 'Start Game' }).last().click()

    const expectedPath =
      action === 'create room'
        ? '/game/with-friends/friends-123'
        : action === 'enter room'
          ? '/game/with-friends/friends-456'
          : '/game/daily-challenge'
    await expect.poll(() => router.currentRoute.value.path).toBe(expectedPath)
  },
)

it('should disable registered-only actions while authentication is loading', async () => {
  isCurrentUserLoaded.value = false
  const { screen } = await renderPage()

  await expect.element(screen.getByRole('button', { name: 'Create Room' })).toBeDisabled()
  await expect.element(screen.getByPlaceholder('6-Digit Key')).toBeDisabled()
  await expect.element(screen.getByRole('button', { name: 'Start Game' }).last()).toBeDisabled()
})

it('should disable competing actions while a game operation is active', async () => {
  let finishGame!: (game: { id: string }) => void
  createGameAsync.mockImplementation(() => new Promise((resolve) => (finishGame = resolve)))
  const { screen } = await renderPage()

  await screen.getByRole('button', { name: 'Start Game' }).first().click()

  await expect.element(screen.getByRole('button', { name: 'Create Room' })).toBeDisabled()
  await expect.element(screen.getByRole('button', { name: 'Start Game' }).last()).toBeDisabled()
  finishGame({ id: 'single-123' })
})

it('should sign up from the prompt and close it', async () => {
  const { screen } = await renderPage()

  await screen.getByRole('button', { name: 'Create Room' }).click()
  await screen.getByRole('button', { name: 'Sign Up', exact: true }).click()

  expect(signUpWithGoogle).toHaveBeenCalledOnce()
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
})

it('should close the sign-up prompt without signing up', async () => {
  const { screen } = await renderPage()

  await screen.getByRole('button', { name: 'Create Room' }).click()
  await screen.getByRole('button', { name: 'Close sign up prompt' }).click()

  expect(signUpWithGoogle).not.toHaveBeenCalled()
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
})
