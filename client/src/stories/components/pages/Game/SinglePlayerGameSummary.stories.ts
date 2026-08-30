import type { Meta, StoryObj } from '@storybook/vue3-vite'

import SinglePlayerGameSummary from '@/components/pages/Game/SinglePlayerGameSummary.vue'

const meta = {
  title: 'Components/Pages/Game/SinglePlayerGameSummary',
  component: SinglePlayerGameSummary,
  tags: ['autodocs'],
  args: {
    isStartingNewGame: false,
    playerName: 'Taylor Swift',
    rounds: [
      {
        distanceKm: 18.4,
        imageId: '524779645570864',
        roundNumber: 1,
        score: 4210,
        selection: [139.6917, 35.6895],
        target: [139.7671, 35.6812],
      },
      {
        distanceKm: 110.2,
        imageId: '1933525276801345',
        roundNumber: 2,
        score: 3670,
        selection: [-0.1276, 51.5072],
        target: [2.3522, 48.8566],
      },
      {
        distanceKm: null,
        imageId: '594714265713739',
        roundNumber: 3,
        score: 0,
        selection: null,
        target: [-74.006, 40.7128],
      },
      {
        distanceKm: 5.8,
        imageId: '979906206373973',
        roundNumber: 4,
        score: 4750,
        selection: [151.2093, -33.8688],
        target: [151.2153, -33.8568],
      },
      {
        distanceKm: 42,
        imageId: '1483158248729669',
        roundNumber: 5,
        score: 4010,
        selection: [13.405, 52.52],
        target: [13.7373, 51.0504],
      },
    ],
    totalScore: 16_640,
  },
} satisfies Meta<typeof SinglePlayerGameSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: {} }

export const StartingNewGame: Story = {
  args: { isStartingNewGame: true },
}

export const NoGuess: Story = {
  args: {
    rounds: [
      {
        distanceKm: null,
        imageId: '594714265713739',
        roundNumber: 1,
        score: 0,
        selection: null,
        target: [-74.006, 40.7128],
      },
    ],
    totalScore: 0,
  },
}
