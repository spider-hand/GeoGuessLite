import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import WithFriendsGameSummary from '@/components/pages/Game/WithFriendsGameSummary.vue'
import { createAppI18n } from '@/i18n'

const { mockConfetti } = vi.hoisted(() => ({ mockConfetti: vi.fn() }))

vi.mock('canvas-confetti', () => ({ default: mockConfetti }))
vi.mock('@/components/pages/Game/GameMap.vue', () => ({
  default: {
    props: ['markers'],
    template: '<div data-testid="summary-map">{{ markers[0]?.label }}</div>',
  },
}))
vi.mock('@/components/pages/Game/GameStreetViewContainer.vue', () => ({
  default: { props: ['imageId'], template: '<div>Street View {{ imageId }}</div>' },
}))

const defaultProps = {
  canCreateRoom: true,
  currentUserId: 'current-user',
  isCreatingRoom: false,
  players: [
    { userId: 'current-user', displayName: 'Current Player', country: 'JP', totalScore: 18_450 },
    { userId: 'winner', displayName: 'Winning Player', country: 'US', totalScore: 22_110 },
  ],
  rounds: [
    {
      imageId: 'image-1',
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
    {
      imageId: 'image-2',
      roundNumber: 2,
      target: [-74.006, 40.7128] as [number, number],
      results: [],
    },
  ],
}

beforeEach(() => mockConfetti.mockClear())

const renderSummary = (props: Partial<typeof defaultProps> = {}) =>
  render(WithFriendsGameSummary, {
    props: { ...defaultProps, ...props },
    global: { plugins: [createAppI18n()] },
  })

it('should render the default state properly', async () => {
  const screen = renderSummary()
  const playerButtons = screen.container.querySelectorAll('ol button')

  await expect.element(screen.getByRole('heading', { name: 'Game Summary' })).toBeVisible()
  await expect.element(screen.getByText('Street View image-1')).toBeVisible()
  expect(Array.from(playerButtons, (button) => button.textContent)).toEqual([
    expect.stringContaining('Winning Player'),
    expect.stringContaining('Current Player'),
  ])
})

it('should update the selected player shown on the map', async () => {
  const screen = renderSummary()

  await screen.getByRole('button', { name: /Winning Player/ }).click()

  await expect.element(screen.getByTestId('summary-map')).toHaveTextContent('Winning Player')
})

it('should switch the leaderboard and visual to the selected round', async () => {
  const screen = renderSummary()

  await screen.getByRole('button', { name: 'Round history' }).click()
  await screen.getByRole('menuitemradio', { name: 'Round 2' }).click()

  await expect.element(screen.getByText('Street View image-2')).toBeVisible()
  await expect
    .element(screen.getByRole('button', { name: /Winning Player/ }))
    .toHaveTextContent('No guess')
})

it('should show missing round results as no guess and zero points', async () => {
  const screen = renderSummary()

  await screen.getByRole('button', { name: 'Round history' }).click()
  await screen.getByRole('menuitemradio', { name: 'Round 2' }).click()

  await expect
    .element(screen.getByRole('button', { name: /Current Player/ }))
    .toHaveTextContent('No guess')
  await expect
    .element(screen.getByRole('button', { name: /Current Player/ }))
    .toHaveTextContent('0')
})

it.each([
  ['host', true, true],
  ['guest', false, false],
] as const)('should expose the correct %s actions', async (_, canCreateRoom, hasCreateRoom) => {
  const screen = renderSummary({ canCreateRoom })

  await expect.element(screen.getByRole('button', { name: 'Exit' })).toBeVisible()
  expect(screen.container.textContent?.includes('Create Room')).toBe(hasCreateRoom)
})

it('should emit create room and exit from their actions', async () => {
  const screen = renderSummary()

  await screen.getByRole('button', { name: 'Create Room' }).click()
  await screen.getByRole('button', { name: 'Exit' }).click()

  expect(screen.emitted('createRoom')).toEqual([[]])
  expect(screen.emitted('exit')).toEqual([[]])
})

it('should trigger confetti only when the current player ranks first', async () => {
  const losingScreen = renderSummary()
  expect(mockConfetti).not.toHaveBeenCalled()
  losingScreen.unmount()

  renderSummary({
    players: defaultProps.players.map((player) =>
      player.userId === 'current-user' ? { ...player, totalScore: 23_000 } : player,
    ),
  })

  expect(mockConfetti).toHaveBeenCalledOnce()
})
