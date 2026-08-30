import type { Meta, StoryObj } from '@storybook/vue3-vite'

import SinglePlayerCard from '@/components/pages/Home/SinglePlayerCard.vue'

const meta = {
  title: 'Components/Pages/Home/SinglePlayerCard',
  component: SinglePlayerCard,
  tags: ['autodocs'],
  args: {
    disabled: false,
    isStartingGame: false,
  },
} satisfies Meta<typeof SinglePlayerCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  args: {
    isStartingGame: true,
  },
}
