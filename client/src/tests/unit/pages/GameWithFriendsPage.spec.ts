import { nextTick, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import type { RealtimeWithFriendsGame } from '@/composables/useRealtimeWithFriendsGame'
import { createAppI18n } from '@/i18n'

const defaultGame: RealtimeWithFriendsGame = {
  id: 'game-1',
  roomKey: '123456',
  hostUserId: 'host',
  status: 'waiting',
  currentRound: 0,
  players: {
    host: {
      userId: 'host',
      displayName: 'Host Player',
      isConnected: true,
      isHost: true,
      guessStatus: 'waiting',
      totalScore: 0,
      joinedAt: 1,
    },
    guest: {
      userId: 'guest',
      displayName: 'Guest Player',
      isConnected: true,
      isHost: false,
      guessStatus: 'waiting',
      totalScore: 0,
      joinedAt: 2,
    },
  },
  rounds: {},
  createdAt: 1,
  updatedAt: 1,
}
const game = ref<RealtimeWithFriendsGame | null>(defaultGame)
const realtimeError = ref<Error | null>(null)
const isLoading = ref(false)
const currentUser = ref<{ uid: string } | null>({ uid: 'host' })
const isCurrentUserLoaded = ref(true)
const createGame = vi.fn()
const startGame = vi.fn()
const submitGuess = vi.fn()

vi.mock('@/composables/useAuth', () => ({
  default: () => ({ currentUser, isCurrentUserLoaded, username: ref('Host Player') }),
}))
vi.mock('@/composables/useRealtimeWithFriendsGame', () => ({
  default: () => ({ error: realtimeError, game, isLoading }),
}))
vi.mock('@/composables/useWithFriendsGameApi', () => ({
  default: () => ({ createGame, startGame, submitGuess }),
}))
vi.mock('@/components/shared/NavigationHeader.vue', () => ({ default: { template: '<header />' } }))
vi.mock('@/components/shared/NavigationFooter.vue', () => ({ default: { template: '<footer />' } }))
vi.mock('@/components/pages/Game/GameStreetView.vue', () => ({
  default: { template: '<div>Street View</div>' },
}))
vi.mock('@/components/pages/Game/RoundLabel.vue', () => ({
  default: { template: '<div>Round label</div>' },
}))
vi.mock('@/components/pages/Game/CountdownTimer.vue', () => ({
  default: { template: '<div>Timer</div>' },
}))
vi.mock('@/components/pages/Game/GameMapContainer.vue', () => ({
  default: {
    props: ['isSubmitted'],
    emits: ['select', 'submit'],
    template: `<div><span v-if="isSubmitted">Guess submitted</span><button @click="$emit('select', [139.7, 35.6])">Select location</button><button @click="$emit('submit')">Submit guess</button></div>`,
  },
}))
vi.mock('@/components/pages/Game/WithFriendsRoundResult.vue', () => ({
  default: {
    emits: ['viewSummary'],
    template:
      '<section><h1>Round results</h1><button @click="$emit(\'viewSummary\')">View summary</button></section>',
  },
}))
vi.mock('@/components/pages/Game/WithFriendsGameSummary.vue', () => ({
  default: {
    emits: ['createRoom', 'exit'],
    template:
      '<section><h1>Game summary</h1><button @click="$emit(\'createRoom\')">Create another room</button><button @click="$emit(\'exit\')">Exit summary</button></section>',
  },
}))

const GameWithFriendsPage = (await import('@/pages/GameWithFriendsPage.vue')).default

const guessingGame = (): RealtimeWithFriendsGame => ({
  ...defaultGame,
  status: 'guessing',
  currentRound: 1,
  rounds: {
    'round-1': { roundNumber: 1, imageId: 'image-1', startedAt: 1, results: {} },
  },
})

const completedGame = (): RealtimeWithFriendsGame => ({
  ...defaultGame,
  status: 'completed',
  currentRound: 5,
  completedAt: 2,
  rounds: {
    'round-5': {
      roundNumber: 5,
      imageId: 'image-5',
      startedAt: 1,
      revealedAt: 2,
      target: { latitude: 35, longitude: 139 },
      results: {
        host: { score: 5000, distanceKm: 0, guess: { latitude: 35, longitude: 139 } },
        guest: { score: 4000 },
      },
    },
  },
})

beforeEach(() => {
  game.value = structuredClone(defaultGame)
  realtimeError.value = null
  isLoading.value = false
  currentUser.value = { uid: 'host' }
  isCurrentUserLoaded.value = true
  createGame.mockReset().mockResolvedValue({ id: 'game-2' })
  startGame.mockReset().mockResolvedValue(undefined)
  submitGuess.mockReset().mockResolvedValue(undefined)
})

const renderPage = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/game/with-friends/:gameId', component: GameWithFriendsPage },
    ],
  })
  await router.push('/game/with-friends/game-1')
  await router.isReady()
  return {
    router,
    screen: render(GameWithFriendsPage, { global: { plugins: [router, createAppI18n()] } }),
  }
}

it('should render the default state properly', async () => {
  const { screen } = await renderPage()

  await expect
    .element(screen.getByRole('heading', { name: 'Waiting for players...' }))
    .toBeVisible()
  await expect.element(screen.getByRole('region', { name: 'Room Key, 123456' })).toBeVisible()
  await expect.element(screen.getByText('Host Player')).toBeVisible()
  await expect.element(screen.getByText('Guest Player')).toBeVisible()
})

it.each(['invalid room', 'inaccessible room', 'unauthenticated user'] as const)(
  'should return home for an %s',
  async (scenario) => {
    if (scenario === 'invalid room') realtimeError.value = new Error('missing')
    if (scenario === 'inaccessible room') delete game.value!.players.host
    if (scenario === 'unauthenticated user') currentUser.value = null
    const { router } = await renderPage()

    await expect.poll(() => router.currentRoute.value.path).toBe('/')
  },
)

it('should let a host start a room with enough connected players', async () => {
  const { screen } = await renderPage()

  await screen.getByRole('button', { name: 'Start Game' }).click()

  expect(startGame).toHaveBeenCalledWith('game-1')
})

it('should show a start error while keeping the lobby usable', async () => {
  startGame.mockRejectedValue(new Error('failed'))
  const { screen } = await renderPage()

  await screen.getByRole('button', { name: 'Start Game' }).click()

  await expect.element(screen.getByRole('alert')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Exit' })).toBeEnabled()
})

it('should show a guest waiting for the host without a start action', async () => {
  currentUser.value = { uid: 'guest' }
  const { screen } = await renderPage()

  await expect.element(screen.getByText('Waiting for the host to start the game.')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Start Game' })).not.toBeInTheDocument()
})

it('should show the non-interactive starting state', async () => {
  game.value = { ...defaultGame, status: 'starting' }
  const { screen } = await renderPage()

  await expect.element(screen.getByText('The game is ready and will start shortly.')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()
})

it('should submit the selected guess and prevent another submission', async () => {
  game.value = guessingGame()
  const { screen } = await renderPage()

  Array.from(screen.container.querySelectorAll('button'))
    .find((button) => button.textContent === 'Select location')!
    .click()
  await nextTick()
  const submit = Array.from(screen.container.querySelectorAll('button')).find(
    (button) => button.textContent === 'Submit guess',
  )!
  submit.click()
  await nextTick()
  submit.click()

  expect(submitGuess).toHaveBeenCalledExactlyOnceWith('game-1', 1, {
    longitude: 139.7,
    latitude: 35.6,
  })
  await expect.element(screen.getByText('Guess submitted')).toBeVisible()
})

it('should show an error when guess submission fails', async () => {
  game.value = guessingGame()
  submitGuess.mockRejectedValue(new Error('failed'))
  const { screen } = await renderPage()

  Array.from(screen.container.querySelectorAll('button'))
    .find((button) => button.textContent === 'Select location')!
    .click()
  await nextTick()
  Array.from(screen.container.querySelectorAll('button'))
    .find((button) => button.textContent === 'Submit guess')!
    .click()

  await expect.element(screen.getByText('Something went wrong. Please try again.')).toBeVisible()
})

it('should show round results before the final summary', async () => {
  game.value = completedGame()
  const { screen } = await renderPage()

  await expect.element(screen.getByRole('heading', { name: 'Round results' })).toBeVisible()
  await expect
    .element(screen.getByRole('heading', { name: 'Game summary' }))
    .not.toBeInTheDocument()
})

it('should show the final summary only after it is requested', async () => {
  game.value = completedGame()
  const { screen } = await renderPage()

  await screen.getByRole('button', { name: 'View summary' }).click()

  await expect.element(screen.getByRole('heading', { name: 'Game summary' })).toBeVisible()
})

it('should restore final-round results after remounting', async () => {
  game.value = completedGame()
  const first = await renderPage()
  await first.screen.getByRole('button', { name: 'View summary' }).click()
  first.screen.unmount()

  const second = await renderPage()

  await expect.element(second.screen.getByRole('heading', { name: 'Round results' })).toBeVisible()
})

it('should let the host create another room and let any player exit', async () => {
  game.value = completedGame()
  const first = await renderPage()
  await first.screen.getByRole('button', { name: 'View summary' }).click()
  await first.screen.getByRole('button', { name: 'Exit summary' }).click()
  await expect.poll(() => first.router.currentRoute.value.path).toBe('/')
  first.screen.unmount()

  game.value = completedGame()
  const second = await renderPage()
  await second.screen.getByRole('button', { name: 'View summary' }).click()
  await second.screen.getByRole('button', { name: 'Create another room' }).click()

  expect(createGame).toHaveBeenCalledOnce()
  await expect.poll(() => second.router.currentRoute.value.path).toBe('/game/with-friends/game-2')
})
