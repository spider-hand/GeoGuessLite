import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import WithFriendsGameSummary from '@/components/pages/Game/WithFriendsGameSummary.vue'
import { createAppI18n } from '@/i18n'

const { mockConfetti } = vi.hoisted(() => ({ mockConfetti: vi.fn() }))

vi.mock('canvas-confetti', () => ({ default: mockConfetti }))

vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: {
    props: ['markers'],
    template:
      '<div data-testid="summary-map" :data-marker-count="markers.length" :data-first-marker="markers[0]?.label" />',
  },
}))

const defaultProps = {
  canCreateRoom: true,
  currentUserId: 'current-user',
  isCreatingRoom: false,
  players: [
    {
      userId: 'current-user',
      displayName: 'Current Player',
      country: 'JP',
      totalScore: 18_450,
    },
    {
      userId: 'winner',
      displayName: 'Winning Player',
      country: 'US',
      totalScore: 22_110,
    },
  ],
  rounds: [
    {
      imageId: '524779645570864',
      roundNumber: 1,
      target: [139.7671, 35.6812] as [number, number],
      results: [
        {
          userId: 'current-user',
          distanceKm: 18.4,
          guess: [139.6917, 35.6895] as [number, number],
          score: 4210,
        },
        {
          userId: 'winner',
          distanceKm: 5.8,
          guess: [139.74, 35.68] as [number, number],
          score: 4750,
        },
      ],
    },
  ],
}

beforeEach(() => {
  mockConfetti.mockClear()
})

it('should render the default state properly', async () => {
  const screen = await render(WithFriendsGameSummary, {
    props: defaultProps,
    global: { plugins: [createAppI18n()] },
  })

  await expect.element(screen.getByRole('heading', { name: 'Game Summary' })).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Round history' })).toBeVisible()
  await expect.element(screen.getByText('Distance')).toBeVisible()
  await expect.element(screen.getByText('Winning Player')).toBeVisible()
  await expect.element(screen.getByText('Current Player')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Create Room' })).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Exit' })).toBeVisible()
  await expect.element(screen.getByTestId('summary-map')).toHaveAttribute('data-marker-count', '3')
  expect(
    Array.from(screen.container.querySelectorAll('ol button'), (button) => button.textContent),
  ).toEqual([expect.stringContaining('Winning Player'), expect.stringContaining('Current Player')])

  await screen.getByRole('button', { name: /Winning Player/ }).click()

  await expect
    .element(screen.getByTestId('summary-map'))
    .toHaveAttribute('data-first-marker', 'Winning Player')
  expect(mockConfetti).not.toHaveBeenCalled()
})

it('should trigger confetti when the current player is ranked first', async () => {
  await render(WithFriendsGameSummary, {
    props: {
      ...defaultProps,
      players: defaultProps.players.map((player) =>
        player.userId === 'current-user' ? { ...player, totalScore: 23_000 } : player,
      ),
    },
    global: { plugins: [createAppI18n()] },
  })

  expect(mockConfetti).toHaveBeenCalledExactlyOnceWith({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
    disableForReducedMotion: true,
  })
})
