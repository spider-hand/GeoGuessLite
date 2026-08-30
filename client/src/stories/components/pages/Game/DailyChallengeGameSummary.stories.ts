import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DailyChallengeGameSummary from '@/components/pages/Game/DailyChallengeGameSummary.vue'

const meta = {
  title: 'Components/Pages/Game/DailyChallengeGameSummary',
  component: DailyChallengeGameSummary,
  tags: ['autodocs'],
  args: {
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
        distanceKm: null,
        imageId: '594714265713739',
        roundNumber: 2,
        score: 0,
        selection: null,
        target: [-74.006, 40.7128],
      },
    ],
    totalScore: 4210,
  },
} satisfies Meta<typeof DailyChallengeGameSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
