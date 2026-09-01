import type { Meta, StoryObj } from '@storybook/vue3-vite'

import WithFriendsLeaderboard from '@/components/pages/Game/WithFriendsLeaderboard.vue'
import type { WithFriendsLeaderboardPlayer } from '@/types/game'

const players: Array<WithFriendsLeaderboardPlayer> = [
  {
    userId: 'current-user',
    displayName: 'Taylor Swift',
    country: 'JP',
    distanceKm: 18.4,
    roundScore: 4210,
    totalScore: 18_450,
  },
  {
    userId: 'guest-1',
    displayName: 'Alex Morgan',
    country: 'US',
    distanceKm: 5.8,
    roundScore: 4750,
    totalScore: 22_110,
  },
  {
    userId: 'guest-2',
    displayName: 'Sam Lee',
    country: 'KR',
    distanceKm: 42,
    roundScore: 4010,
    totalScore: 17_980,
  },
]

const meta = {
  title: 'Components/Pages/Game/WithFriendsLeaderboard',
  component: WithFriendsLeaderboard,
  tags: ['autodocs'],
  args: {
    currentUserId: 'current-user',
    players,
    selectedUserId: 'guest-1',
  },
} satisfies Meta<typeof WithFriendsLeaderboard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithMissingGuess: Story = {
  args: {
    players: players.map((player, index) =>
      index === 2 ? { ...player, country: undefined, distanceKm: null, roundScore: 0 } : player,
    ),
  },
}

export const HundredPlayers: Story = {
  args: {
    players: Array.from({ length: 100 }, (_, index) => ({
      userId: `player-${index + 1}`,
      displayName: `Player ${index + 1}`,
      country: index % 2 === 0 ? 'JP' : 'US',
      distanceKm: 6000 + index * 50,
      roundScore: 5000 - index * 40,
      totalScore: 25_000 - index * 100,
    })),
  },
}
