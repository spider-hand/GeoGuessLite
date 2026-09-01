import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { ref } from 'vue'

import { createAppI18n } from '@/i18n'
import HomePage from '@/pages/HomePage.vue'

const isCurrentUserLoaded = ref(true)
const isLoadingUser = ref(false)
const isRegisteredUser = ref(false)
const signInAnonymously = vi.fn()
const signUpWithGoogle = vi.fn()
const createGameAsync = vi.fn()
const createWithFriendsGame = vi.fn()
const joinWithFriendsGame = vi.fn()
const user = ref({ dailyChallengeStatus: 'available' as const })

vi.mock('@/composables/useAuth', () => ({
  default: () => ({
    username: ref(''),
    userCountry: ref(undefined),
    isAuthenticatedUser: ref(false),
    isRegisteredUser,
    isCurrentUserLoaded,
    isLoadingUser,
    user,
    signInAnonymously,
    signUpWithGoogle,
    signOutUser: vi.fn(),
  }),
}))

vi.mock('@/composables/useSinglePlayerGameQuery', () => ({
  default: () => ({ createGameAsync }),
}))

vi.mock('@/composables/useWithFriendsGameApi', () => ({
  default: () => ({
    createGame: createWithFriendsGame,
    joinGame: joinWithFriendsGame,
  }),
}))

const createHomeRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomePage },
      { path: '/privacy', component: HomePage },
      { path: '/terms', component: HomePage },
      { path: '/game/single-player/:gameId', name: 'single-player-game', component: HomePage },
      { path: '/game/daily-challenge', name: 'daily-challenge-game', component: HomePage },
      { path: '/game/with-friends/:gameId', component: HomePage },
      { path: '/game/random-match', component: HomePage },
    ],
  })

const renderHomePage = async () => {
  const router = createHomeRouter()
  await router.push('/')
  await router.isReady()

  return {
    router,
    view: render(HomePage, { global: { plugins: [router, createAppI18n()] } }),
  }
}

const resetAuthState = () => {
  isCurrentUserLoaded.value = true
  isLoadingUser.value = false
  isRegisteredUser.value = false
  signInAnonymously.mockReset().mockResolvedValue(undefined)
  signUpWithGoogle.mockReset()
  createGameAsync.mockReset().mockResolvedValue({ id: 'game-123' })
  createWithFriendsGame.mockReset().mockResolvedValue({ id: 'friends-123', roomKey: '123456' })
  joinWithFriendsGame.mockReset().mockResolvedValue({ id: 'friends-456' })
  user.value = { dailyChallengeStatus: 'available' }
}

describe('HomePage', () => {
  it('should render the default state properly', async () => {
    resetAuthState()
    const { view } = await renderHomePage()
    const { container, getByRole } = view

    await expect.element(getByRole('img', { name: 'Hero Image' })).toBeVisible()
    expect(
      Array.from(container.querySelectorAll('h2'), (heading) => heading.textContent?.trim()),
    ).toEqual(['Single Player', 'Play with Friends', 'Daily Challenge', 'Random Match'])
    expect(container.textContent).not.toContain('Play vs AI')
  })

  it.each([
    { action: 'create room', buttonIndex: 0, buttonName: 'Create Room' },
    { action: 'daily challenge', buttonIndex: 1, buttonName: 'Start Game' },
  ])(
    'should prompt an unregistered user before starting $action',
    async ({ buttonIndex, buttonName }) => {
      resetAuthState()
      const { router, view } = await renderHomePage()
      const { getByRole, getByText } = view

      await getByRole('button', { name: buttonName }).nth(buttonIndex).click()

      await expect.element(getByText('Welcome to GeoGuessLite')).toBeInTheDocument()
      expect(router.currentRoute.value.path).toBe('/')
    },
  )

  it('should prompt an unregistered user before entering a room', async () => {
    resetAuthState()
    const { router, view } = await renderHomePage()
    const { getByPlaceholder, getByRole, getByText } = view

    await getByPlaceholder('6-Digit Key').fill('123456')
    await getByRole('button', { name: 'Enter Room' }).click()

    await expect.element(getByText('Welcome to GeoGuessLite')).toBeInTheDocument()
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('should disable with-friends actions while authentication is loading', async () => {
    resetAuthState()
    isCurrentUserLoaded.value = false
    const { view } = await renderHomePage()

    await expect.element(view.getByRole('button', { name: 'Create Room' })).toBeDisabled()
    await expect.element(view.getByPlaceholder('6-Digit Key')).toBeDisabled()
    await expect.element(view.getByRole('button', { name: 'Enter Room' })).toBeDisabled()
  })

  it('should disable the daily challenge while the user profile is loading', async () => {
    resetAuthState()
    isLoadingUser.value = true
    const { view } = await renderHomePage()

    await expect.element(view.getByRole('button', { name: 'Start Game' }).nth(1)).toBeDisabled()
  })

  it('should disable other game actions while opening the daily challenge', async () => {
    resetAuthState()
    isRegisteredUser.value = true
    const { router, view } = await renderHomePage()
    let finishNavigation: () => void = () => undefined
    router.beforeEach(
      (to) =>
        new Promise<boolean>((resolve) => {
          if (to.name !== 'daily-challenge-game') {
            resolve(true)
            return
          }
          finishNavigation = () => resolve(true)
        }),
    )

    await view.getByRole('button', { name: 'Start Game' }).nth(1).click()

    await expect.element(view.getByRole('button', { name: 'Start Game' }).nth(0)).toBeDisabled()
    await expect.element(view.getByRole('button', { name: 'Create Room' })).toBeDisabled()
    finishNavigation()
  })

  it('should allow registered users to use gated actions', async () => {
    resetAuthState()
    isRegisteredUser.value = true
    const { router, view } = await renderHomePage()
    const { getByRole } = view

    await getByRole('button', { name: 'Create Room' }).click()

    await expect.poll(() => router.currentRoute.value.path).toBe('/game/with-friends/friends-123')
  })

  it('should sign up from the prompt', async () => {
    resetAuthState()
    const { view } = await renderHomePage()
    const { getByRole } = view

    await getByRole('button', { name: 'Create Room' }).click()
    await getByRole('button', { name: 'Sign Up', exact: true }).click()

    expect(signUpWithGoogle).toHaveBeenCalledOnce()
  })
})
