import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import type { RealtimeWithFriendsGame } from '@/composables/useRealtimeWithFriendsGame'
import { createAppI18n } from '@/i18n'
import GameWithFriendsPage from '@/pages/GameWithFriendsPage.vue'

const game = ref<RealtimeWithFriendsGame | null>({
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
  default: { template: '<div />' },
}))

vi.mock('@/components/pages/Game/WithFriendsGameSummary.vue', () => ({
  default: { template: '<div />' },
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
