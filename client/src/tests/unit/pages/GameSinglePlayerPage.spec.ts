import { nextTick, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import { createAppI18n } from '@/i18n'

type TestRound = {
  roundNumber: number
  imageId: string
  startedAt: Date
  result?: {
    score: number
    distanceKm: number | null
    guess: { longitude: number; latitude: number } | null
    target: { longitude: number; latitude: number }
    completedAt: Date
  }
}

type TestGame = {
  id: string
  status: 'ongoing' | 'completed'
  currentRound: number
  rounds: Array<TestRound>
  createdAt: Date
}

const game = ref<TestGame | null>(null)
const gameError = ref<Error | null>(null)
const isCreatingGame = ref(false)
const isLoadingGame = ref(false)
const isStartingRound = ref(false)
const isSubmittingGuess = ref(false)
const createGameAsync = vi.fn()
const refetchGame = vi.fn()
const startRoundAsync = vi.fn()
const submitGuessAsync = vi.fn()

vi.mock('@/composables/useAuth', () => ({ default: () => ({ username: ref('Guest') }) }))
vi.mock('@/composables/useSinglePlayerGameQuery', () => ({
  default: () => ({
    game,
    gameError,
    isCreatingGame,
    isLoadingGame,
    isStartingRound,
    isSubmittingGuess,
    createGameAsync,
    refetchGame,
    startRoundAsync,
    submitGuessAsync,
  }),
}))
vi.mock('@/components/shared/NavigationHeader.vue', () => ({ default: { template: '<header />' } }))
vi.mock('@/components/shared/NavigationFooter.vue', () => ({ default: { template: '<footer />' } }))
vi.mock('@/components/pages/Game/GameStreetView.vue', () => ({
  default: { template: '<div>Street View</div>' },
}))
vi.mock('@/components/pages/Game/RoundLabel.vue', () => ({
  default: { template: '<div>Round label</div>' },
}))
vi.mock('@/components/pages/Game/GameMapContainer.vue', () => ({
  default: {
    props: ['selection'],
    emits: ['select', 'submit'],
    template: `<div><button @click="$emit('select', [139.7, 35.6])">Select location</button><button @click="$emit('submit')">Submit guess</button></div>`,
  },
}))
vi.mock('@/components/pages/Game/CountdownTimer.vue', () => ({
  default: {
    emits: ['expired'],
    template: '<button @click="$emit(\'expired\')">Expire timer</button>',
  },
}))
vi.mock('@/components/pages/Game/SinglePlayerRoundResult.vue', () => ({
  default: {
    emits: ['continue'],
    template: '<button @click="$emit(\'continue\')">Continue result</button>',
  },
}))
vi.mock('@/components/pages/Game/SinglePlayerGameSummary.vue', () => ({
  default: {
    emits: ['playAgain', 'home'],
    template:
      '<section><h1>Game summary</h1><button @click="$emit(\'playAgain\')">Play again</button><button @click="$emit(\'home\')">Summary home</button></section>',
  },
}))

const GameSinglePlayerPage = (await import('@/pages/GameSinglePlayerPage.vue')).default

const round = (roundNumber = 1, withResult = false): TestRound => ({
  roundNumber,
  imageId: `image-${roundNumber}`,
  startedAt: new Date('2026-09-04T00:00:00Z'),
  result: withResult
    ? {
        score: 4200,
        distanceKm: 12.4,
        guess: { longitude: 139.7, latitude: 35.6 },
        target: { longitude: 139.8, latitude: 35.7 },
        completedAt: new Date('2026-09-04T00:01:00Z'),
      }
    : undefined,
})

const ongoingGame = (currentRound = 1, withResult = false): TestGame => ({
  id: 'game-1',
  status: 'ongoing',
  currentRound,
  rounds: currentRound ? [round(currentRound, withResult)] : [],
  createdAt: new Date('2026-09-04T00:00:00Z'),
})

beforeEach(() => {
  game.value = ongoingGame()
  gameError.value = null
  isCreatingGame.value = false
  isLoadingGame.value = false
  isStartingRound.value = false
  isSubmittingGuess.value = false
  createGameAsync.mockReset().mockResolvedValue({ id: 'game-2' })
  refetchGame.mockReset().mockResolvedValue({ data: game.value, error: null })
  startRoundAsync.mockReset().mockResolvedValue(round(2))
  submitGuessAsync.mockReset().mockResolvedValue(round(1, true))
})

const renderPage = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      {
        path: '/game/single-player/:gameId',
        name: 'single-player-game',
        component: GameSinglePlayerPage,
      },
    ],
  })
  await router.push('/game/single-player/game-1')
  await router.isReady()
  return {
    router,
    screen: render(GameSinglePlayerPage, { global: { plugins: [router, createAppI18n()] } }),
  }
}

it('should render the default state properly', async () => {
  const { screen } = await renderPage()

  await expect.element(screen.getByText('Street View')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Submit guess' })).toBeVisible()
})

it('should show retry and home actions when the game cannot be loaded', async () => {
  game.value = null
  refetchGame.mockResolvedValue({ data: undefined, error: new Error('failed') })
  const { router, screen } = await renderPage()

  await expect
    .element(screen.getByRole('heading', { name: 'Unable to load the game' }))
    .toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
  await screen.getByRole('button', { name: 'Home' }).click()
  await expect.poll(() => router.currentRoute.value.path).toBe('/')
})

it('should start the first round of an ongoing game', async () => {
  game.value = ongoingGame(0)
  await renderPage()

  await expect
    .poll(() => startRoundAsync.mock.calls)
    .toContainEqual([{ gameId: 'game-1', roundNumber: 1 }])
})

it('should submit the selected location and show the round result', async () => {
  const { screen } = await renderPage()

  Array.from(screen.container.querySelectorAll('button'))
    .find((button) => button.textContent === 'Select location')!
    .click()
  await nextTick()
  Array.from(screen.container.querySelectorAll('button'))
    .find((button) => button.textContent === 'Submit guess')!
    .click()
  expect(submitGuessAsync).toHaveBeenCalledWith({
    gameId: 'game-1',
    roundNumber: 1,
    guess: { longitude: 139.7, latitude: 35.6 },
  })

  game.value = ongoingGame(1, true)
  await nextTick()
  await expect.element(screen.getByRole('button', { name: 'Continue result' })).toBeVisible()
})

it('should submit an empty guess when the timer expires', async () => {
  const { screen } = await renderPage()

  await screen.getByRole('button', { name: 'Expire timer' }).click()

  expect(submitGuessAsync).toHaveBeenCalledWith({ gameId: 'game-1', roundNumber: 1, guess: null })
})

it('should retain a failed timeout submission and offer retry', async () => {
  submitGuessAsync.mockRejectedValueOnce(new Error('failed')).mockResolvedValueOnce(round(1, true))
  const { screen } = await renderPage()

  await screen.getByRole('button', { name: 'Expire timer' }).click()
  await expect.element(screen.getByRole('alert')).toBeVisible()
  await screen.getByRole('button', { name: 'Retry' }).click()

  expect(submitGuessAsync).toHaveBeenCalledTimes(2)
})

it('should advance from a completed round to the next round', async () => {
  game.value = ongoingGame(1, true)
  const { screen } = await renderPage()

  await screen.getByRole('button', { name: 'Continue result' }).click()

  expect(startRoundAsync).toHaveBeenCalledWith({ gameId: 'game-1', roundNumber: 2 })
})

it('should show the game summary after the final result', async () => {
  game.value = ongoingGame(5, true)
  const { screen } = await renderPage()

  await screen.getByRole('button', { name: 'Continue result' }).click()

  await expect.element(screen.getByRole('heading', { name: 'Game summary' })).toBeVisible()
})

it('should show a completed game summary and start a new game from play again', async () => {
  game.value = { ...ongoingGame(5, true), status: 'completed' }
  const { router, screen } = await renderPage()

  await expect.element(screen.getByRole('heading', { name: 'Game summary' })).toBeVisible()
  await screen.getByRole('button', { name: 'Play again' }).click()

  expect(createGameAsync).toHaveBeenCalledOnce()
  await expect.poll(() => router.currentRoute.value.path).toBe('/game/single-player/game-2')
  expect(startRoundAsync).toHaveBeenCalledWith({ gameId: 'game-2', roundNumber: 1 })
})
