import type { Meta, StoryObj } from '@storybook/vue3-vite'

import RandomMatchCard from '@/components/pages/Home/RandomMatchCard.vue'

const meta = {
  title: 'Components/Pages/Home/RandomMatchCard',
  component: RandomMatchCard,
  tags: ['autodocs'],
  args: {
    disabled: false,
    onlinePlayers: 40,
  },
} satisfies Meta<typeof RandomMatchCard>

export default meta

type Story = StoryObj<typeof meta>

export const MultiplePlayers: Story = {}

export const OnePlayer: Story = {
  args: {
    onlinePlayers: 1,
  },
}
