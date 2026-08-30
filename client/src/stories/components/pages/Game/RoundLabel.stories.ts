import type { Meta, StoryObj } from '@storybook/vue3-vite'

import RoundLabel from '@/components/pages/Game/RoundLabel.vue'

const meta = {
  title: 'Components/Pages/Game/RoundLabel',
  component: RoundLabel,
  tags: ['autodocs'],
  args: {
    currentRound: 1,
    totalRounds: 5,
  },
} satisfies Meta<typeof RoundLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
