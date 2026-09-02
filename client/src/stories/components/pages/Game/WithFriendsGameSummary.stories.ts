import type { Meta, StoryObj } from '@storybook/vue3-vite'

import WithFriendsGameSummary from '@/components/pages/Game/WithFriendsGameSummary.vue'
import type { WithFriendsSummaryPlayer, WithFriendsSummaryRound } from '@/types/game'

const random = (seed: number) => {
  const value = Math.sin(seed) * 10_000
  return value - Math.floor(value)
}
const scatteredGuess = (playerIndex: number, roundIndex: number): [number, number] => [
  random((playerIndex + 1) * 17 + roundIndex * 101) * 340 - 170,
  random((playerIndex + 1) * 29 + roundIndex * 103) * 140 - 70,
]

const players: Array<WithFriendsSummaryPlayer> = [
  { userId: 'current-user', displayName: 'Taylor Swift', country: 'JP', totalScore: 21_840 },
  { userId: 'guest-1', displayName: 'Alex Morgan', country: 'US', totalScore: 22_110 },
  { userId: 'guest-2', displayName: 'Sam Lee', country: 'KR', totalScore: 18_450 },
]

const rounds: Array<WithFriendsSummaryRound> = Array.from({ length: 5 }, (_, index) => ({
  imageId: `${524779645570864 + index}`,
  roundNumber: index + 1,
  target: [139.7671 - index * 20, 35.6812 - index * 10],
  results: players.map((player, playerIndex) => ({
    userId: player.userId,
    distanceKm: 5.8 + playerIndex * 15 + index,
    guess: [139.72 - index * 20 - playerIndex, 35.68 - index * 10] as [number, number],
    score: 4750 - playerIndex * 300 - index * 100,
  })),
}))

const meta = {
  title: 'Components/Pages/Game/WithFriendsGameSummary',
  component: WithFriendsGameSummary,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    canCreateRoom: true,
    currentUserId: 'current-user',
    isCreatingRoom: false,
    players,
    rounds,
  },
} satisfies Meta<typeof WithFriendsGameSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Winner: Story = {
  args: {
    players: players.map((player) =>
      player.userId === 'current-user' ? { ...player, totalScore: 23_000 } : player,
    ),
  },
}

export const Guest: Story = {
  args: { canCreateRoom: false },
}

export const HundredPlayers: Story = {
  args: {
    players: Array.from({ length: 100 }, (_, index) => ({
      userId: `player-${index + 1}`,
      displayName: `Player ${index + 1}`,
      country: index % 2 === 0 ? 'JP' : 'US',
      totalScore: 25_000 - index * 100,
    })),
    rounds: Array.from({ length: 5 }, (_, roundIndex) => ({
      imageId: `${524779645570864 + roundIndex}`,
      roundNumber: roundIndex + 1,
      target: [139.7671 - roundIndex * 20, 35.6812 - roundIndex * 10] as [number, number],
      results: Array.from({ length: 100 }, (_, playerIndex) => ({
        userId: `player-${playerIndex + 1}`,
        distanceKm: 6000 + playerIndex * 50,
        guess: scatteredGuess(playerIndex, roundIndex),
        score: 5000 - playerIndex * 40,
      })),
    })),
  },
}
