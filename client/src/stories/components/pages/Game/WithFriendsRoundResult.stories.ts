import type { Meta, StoryObj } from '@storybook/vue3-vite'

import WithFriendsRoundResult from '@/components/pages/Game/WithFriendsRoundResult.vue'
import type { WithFriendsRoundResultPlayer } from '@/types/game'

const random = (seed: number) => {
  const value = Math.sin(seed) * 10_000
  return value - Math.floor(value)
}
const scatteredGuess = (index: number): [number, number] => [
  random((index + 1) * 17) * 340 - 170,
  random((index + 1) * 29) * 140 - 70,
]

const players: Array<WithFriendsRoundResultPlayer> = [
  {
    userId: 'current-user',
    displayName: 'Taylor Swift',
    country: 'JP',
    distanceKm: 18.4,
    guess: [139.6917, 35.6895],
    roundScore: 4210,
    totalScore: 4210,
  },
  {
    userId: 'guest-1',
    displayName: 'Alex Morgan',
    country: 'US',
    distanceKm: 5.8,
    guess: [139.74, 35.68],
    roundScore: 4750,
    totalScore: 4750,
  },
  {
    userId: 'guest-2',
    displayName: 'Sam Lee',
    country: 'KR',
    distanceKm: 42,
    guess: [139.4, 35.6],
    roundScore: 4010,
    totalScore: 4010,
  },
]

const meta = {
  title: 'Components/Pages/Game/WithFriendsRoundResult',
  component: WithFriendsRoundResult,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    currentUserId: 'current-user',
    imageId: '524779645570864',
    players,
    roundNumber: 1,
    target: [139.7671, 35.6812],
  },
} satisfies Meta<typeof WithFriendsRoundResult>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithMissingGuess: Story = {
  args: {
    players: players.map((player, index) =>
      index === 2
        ? { ...player, distanceKm: null, guess: null, roundScore: 0, totalScore: 0 }
        : player,
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
      guess: scatteredGuess(index),
      roundScore: 5000 - index * 40,
      totalScore: 5000 - index * 40,
    })),
  },
}
