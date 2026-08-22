import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DailyChallengeCard from '@/components/pages/Home/DailyChallengeCard.vue'

const meta = {
  title: 'Components/Pages/Home/DailyChallengeCard',
  component: DailyChallengeCard,
  tags: ['autodocs'],
  args: {
    disabled: false,
    hasPlayedToday: false,
  },
} satisfies Meta<typeof DailyChallengeCard>

export default meta

type Story = StoryObj<typeof meta>

export const Available: Story = {}

export const AlreadyPlayed: Story = {
  args: {
    hasPlayedToday: true,
  },
}
