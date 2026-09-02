import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import type { RealtimeWithFriendsGame } from '@/composables/useRealtimeWithFriendsGame'
import { createAppI18n } from '@/i18n'
import GameWithFriendsPage from '@/pages/GameWithFriendsPage.vue'

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

beforeEach(() => {
  game.value = { ...defaultGame }
})

vi.mock('@/composables/useAuth', () => ({
  default: () => ({
    currentUser: ref({ uid: 'host' }),
    isCurrentUserLoaded: ref(true),
    username: ref('Host Player'),
  }),
}))

vi.mock('@/composables/useRealtimeWithFriendsGame', () => ({
  default: () => ({ error: ref(null), game, isLoading: ref(false) }),
}))

vi.mock('@/composables/useWithFriendsGameApi', () => ({
  default: () => ({ createGame: vi.fn(), startGame: vi.fn(), submitGuess: vi.fn() }),
}))

vi.mock('@/components/shared/NavigationHeader.vue', () => ({
  default: { template: '<header />' },
}))

vi.mock('@/components/shared/NavigationFooter.vue', () => ({
  default: { template: '<footer />' },
}))

vi.mock('@/components/pages/Game/GameMapContainer.vue', () => ({
  default: { template: '<div />' },
}))

vi.mock('@/components/pages/Game/GameStreetView.vue', () => ({
  default: { template: '<div />' },
}))

vi.mock('@/components/pages/Game/WithFriendsRoundResult.vue', () => ({
  default: {
    emits: ['viewSummary'],
    template:
      '<button data-testid="round-result" @click="$emit(\'viewSummary\')">View Summary</button>',
  },
}))

vi.mock('@/components/pages/Game/WithFriendsGameSummary.vue', () => ({
  default: { template: '<div data-testid="game-summary" />' },
}))

it('should render the default state properly', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/game/with-friends/:gameId', component: GameWithFriendsPage },
    ],
  })
  await router.push('/game/with-friends/game-1')
  await router.isReady()

  const screen = render(GameWithFriendsPage, {
    global: { plugins: [router, createAppI18n()] },
  })

  await expect
    .element(screen.getByRole('heading', { name: 'Waiting for players...' }))
    .toBeVisible()
  await expect.element(screen.getByRole('region', { name: 'Room Key, 123456' })).toBeVisible()
  await expect.element(screen.getByText('Host Player')).toBeVisible()
  await expect.element(screen.getByText('Guest Player')).toBeVisible()
})

it('should render the starting state properly', async () => {
  game.value = { ...game.value!, status: 'starting' }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/game/with-friends/:gameId', component: GameWithFriendsPage },
    ],
  })
  await router.push('/game/with-friends/game-1')
  await router.isReady()

  const screen = render(GameWithFriendsPage, {
    global: { plugins: [router, createAppI18n()] },
  })

  await expect.element(screen.getByText('The game is ready and will start shortly.')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()
  await expect.element(screen.getByRole('button', { name: 'Exit' })).toBeEnabled()
  await expect
    .element(screen.getByRole('heading', { name: 'Waiting for players...' }))
    .toBeVisible()
  expect(screen.container.querySelector('.with-friends-page__play-area')).toBeNull()
})

it('should show final results until summary is requested and restore them after remount', async () => {
  game.value = {
    ...defaultGame,
    status: 'completed',
    currentRound: 5,
    completedAt: 1788134400000,
    rounds: {
      'round-5': {
        roundNumber: 5,
        imageId: 'image-5',
        startedAt: 1788134340000,
        revealedAt: 1788134400000,
        target: { latitude: 35, longitude: 139 },
        results: {
          host: { score: 5000, distanceKm: 0, guess: { latitude: 35, longitude: 139 } },
          guest: { score: 4000 },
        },
      },
    },
  }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/game/with-friends/:gameId', component: GameWithFriendsPage },
    ],
  })
  await router.push('/game/with-friends/game-1')
  await router.isReady()

  const screen = render(GameWithFriendsPage, {
    global: { plugins: [router, createAppI18n()] },
  })

  await expect.element(screen.getByTestId('round-result')).toBeVisible()
  expect(screen.container.querySelector('[data-testid="game-summary"]')).toBeNull()

  await screen.getByRole('button', { name: 'View Summary' }).click()

  await expect.element(screen.getByTestId('game-summary')).toBeInTheDocument()
  screen.unmount()

  const reloadedScreen = render(GameWithFriendsPage, {
    global: { plugins: [router, createAppI18n()] },
  })

  await expect.element(reloadedScreen.getByTestId('round-result')).toBeVisible()
  expect(reloadedScreen.container.querySelector('[data-testid="game-summary"]')).toBeNull()
})
