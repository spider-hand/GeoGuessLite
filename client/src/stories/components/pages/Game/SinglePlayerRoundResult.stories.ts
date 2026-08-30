import type { Meta, StoryObj } from '@storybook/vue3-vite'

import SinglePlayerRoundResult from '@/components/pages/Game/SinglePlayerRoundResult.vue'

const meta = {
  title: 'Components/Pages/Game/SinglePlayerRoundResult',
  component: SinglePlayerRoundResult,
  tags: ['autodocs'],
  args: {
    distanceKm: 18.4,
    imageId: '524779645570864',
    isFinalRound: false,
    isStartingNextRound: false,
    playerName: 'Taylor Swift',
    roundNumber: 1,
    score: 4210,
    selection: [139.6917, 35.6895],
    target: [139.7671, 35.6812],
    totalScore: 4210,
  },
} satisfies Meta<typeof SinglePlayerRoundResult>

export default meta
type Story = StoryObj<typeof meta>

export const Guessed: Story = { args: {} }

export const TimedOut: Story = {
  args: {
    distanceKm: null,
    isStartingNextRound: false,
    score: 0,
    selection: null,
    totalScore: 0,
  },
}

export const FinalRound: Story = {
  args: {
    isFinalRound: true,
    isStartingNextRound: false,
    roundNumber: 5,
    totalScore: 21_840,
  },
}
