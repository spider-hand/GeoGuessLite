import { nextTick, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import { createAppI18n } from '@/i18n'

const round = (roundNumber = 1, withResult = false) => ({
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
const ongoingGame = (currentRound = 1, withResult = false) => ({
  id: 'daily-1',
  status: 'ongoing' as 'ongoing' | 'completed',
  currentRound,
  rounds: currentRound ? [round(currentRound, withResult)] : [],
  createdAt: new Date('2026-09-04T00:00:00Z'),
})

const game = ref<ReturnType<typeof ongoingGame> | null>(null)
const gameError = ref<Error | null>(null)
const isLoadingGame = ref(false)
const isStartingRound = ref(false)
const isSubmittingGuess = ref(false)
const createGameAsync = vi.fn()
const refetchGame = vi.fn()
const startRoundAsync = vi.fn()
const submitGuessAsync = vi.fn()
const queryGameId = vi.fn()

vi.mock('@/composables/useAuth', () => ({ default: () => ({ username: ref('Taylor') }) }))
vi.mock('@/composables/useDailyChallengeGameQuery', () => ({
  default: (gameId: string | null) => {
    queryGameId(gameId)
    return {
      game,
      gameError,
      isLoadingGame,
      isStartingRound,
      isSubmittingGuess,
      createGameAsync,
      refetchGame,
      startRoundAsync,
      submitGuessAsync,
    }
  },
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
vi.mock('@/components/pages/Game/DailyChallengeGameSummary.vue', () => ({
  default: {
    emits: ['home'],
    template:
      '<section><h1>Challenge summary</h1><button @click="$emit(\'home\')">Summary home</button></section>',
  },
}))

const GameDailyChallengePage = (await import('@/pages/GameDailyChallengePage.vue')).default

beforeEach(() => {
  game.value = ongoingGame()
  gameError.value = null
  isLoadingGame.value = false
  isStartingRound.value = false
  isSubmittingGuess.value = false
  createGameAsync.mockReset().mockResolvedValue(ongoingGame(0))
  refetchGame.mockReset().mockResolvedValue({ data: game.value, error: null })
  startRoundAsync.mockReset().mockResolvedValue(round(2))
  submitGuessAsync.mockReset().mockResolvedValue(round(1, true))
  queryGameId.mockReset()
})

const renderPage = async (path = '/game/daily-challenge') => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      {
        path: '/game/daily-challenge',
        name: 'daily-challenge-game',
        component: GameDailyChallengePage,
      },
      {
        path: '/game/daily-challenge/:gameId',
        name: 'daily-challenge-history',
        component: GameDailyChallengePage,
      },
    ],
  })
  await router.push(path)
  await router.isReady()
  return {
    router,
    screen: render(GameDailyChallengePage, { global: { plugins: [router, createAppI18n()] } }),
  }
}

it('should render the default state properly', async () => {
  const { screen } = await renderPage()

  await expect.element(screen.getByText('Street View')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Submit guess' })).toBeVisible()
})

it("should create today's challenge when none exists", async () => {
  game.value = null
  refetchGame.mockResolvedValue({ data: undefined, error: null })
  await renderPage()

  await expect.poll(() => createGameAsync.mock.calls.length).toBe(1)
})

it('should show the already-played state for a completed challenge', async () => {
  game.value = { ...ongoingGame(5, true), status: 'completed' }
  const { screen } = await renderPage()

  await expect.element(screen.getByRole('heading', { name: 'Already played today' })).toBeVisible()
  await expect.element(screen.getByText('Come back tomorrow for a new challenge.')).toBeVisible()
})

it('should show retry and home actions when the challenge is unavailable', async () => {
  game.value = null
  refetchGame.mockResolvedValue({ data: undefined, error: new Error('failed') })
  const { router, screen } = await renderPage()

  await expect
    .element(screen.getByRole('heading', { name: "Today's daily challenge is unavailable" }))
    .toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
  await screen.getByRole('button', { name: 'Home' }).click()
  await expect.poll(() => router.currentRoute.value.path).toBe('/')
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
    gameId: 'daily-1',
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

  expect(submitGuessAsync).toHaveBeenCalledWith({ gameId: 'daily-1', roundNumber: 1, guess: null })
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

  expect(startRoundAsync).toHaveBeenCalledWith({ gameId: 'daily-1', roundNumber: 2 })
})

it('should show the challenge summary after the final result', async () => {
  game.value = ongoingGame(5, true)
  const { screen } = await renderPage()

  await screen.getByRole('button', { name: 'Continue result' }).click()

  await expect.element(screen.getByRole('heading', { name: 'Challenge summary' })).toBeVisible()
})

it('should show a historical challenge summary without starting a game', async () => {
  game.value = { ...ongoingGame(5, true), status: 'completed' }

  const { screen } = await renderPage('/game/daily-challenge/daily-1')

  await expect.element(screen.getByRole('heading', { name: 'Challenge summary' })).toBeVisible()
  expect(queryGameId).toHaveBeenCalledWith('daily-1')
  expect(createGameAsync).not.toHaveBeenCalled()
  expect(startRoundAsync).not.toHaveBeenCalled()
})
