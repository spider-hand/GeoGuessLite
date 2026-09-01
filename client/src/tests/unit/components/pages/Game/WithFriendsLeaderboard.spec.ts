import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'

import WithFriendsLeaderboard from '@/components/pages/Game/WithFriendsLeaderboard.vue'
import { createAppI18n } from '@/i18n'
import type { WithFriendsLeaderboardPlayer } from '@/types/game'

const players: Array<WithFriendsLeaderboardPlayer> = [
  {
    userId: 'second',
    displayName: 'Second Player',
    country: 'US',
    distanceKm: 12.4,
    roundScore: 4200,
    totalScore: 8200,
  },
  {
    userId: 'first',
    displayName: 'First Player',
    country: 'JP',
    distanceKm: 4.8,
    roundScore: 4800,
    totalScore: 9800,
  },
]

const renderLeaderboard = (
  overrides: Partial<{
    currentUserId: string
    players: Array<WithFriendsLeaderboardPlayer>
    selectedUserId: string
  }> = {},
) =>
  render(WithFriendsLeaderboard, {
    props: {
      currentUserId: 'second',
      players,
      selectedUserId: 'first',
      ...overrides,
    },
    global: { plugins: [createAppI18n()] },
  })

describe('WithFriendsLeaderboard', () => {
  it('should render the default state properly', async () => {
    const screen = await renderLeaderboard()
    const buttons = screen.container.querySelectorAll('ol button')

    await expect.element(screen.getByRole('list', { name: 'Round leaderboard' })).toBeVisible()
    await expect.element(screen.getByText('Distance')).toBeVisible()
    await expect.element(screen.getByText('12.4 km')).toBeVisible()
    expect(Array.from(buttons, (button) => button.textContent)).toEqual([
      expect.stringContaining('Second Player'),
      expect.stringContaining('First Player'),
    ])
    expect(buttons[0]).toHaveClass('with-friends-leaderboard__player--current')
    expect(buttons[1]).toHaveClass('with-friends-leaderboard__player--selected')
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true')
  })

  it('should emit the selected player', async () => {
    const screen = await renderLeaderboard()

    await screen.getByRole('button', { name: /Second Player/ }).click()

    expect(screen.emitted('select')).toEqual([['second']])
  })

  it('should render a missing guess and optional country properly', async () => {
    const screen = await renderLeaderboard({
      players: [{ ...players[0]!, country: undefined, distanceKm: null }],
    })

    await expect.element(screen.getByText('No guess')).toBeVisible()
    expect(screen.container.querySelector('img')).toBeNull()
  })
})
