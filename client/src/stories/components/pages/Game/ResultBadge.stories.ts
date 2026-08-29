import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ResultBadge from '@/components/pages/Game/ResultBadge.vue'

const meta = {
  title: 'Components/Pages/Game/ResultBadge',
  component: ResultBadge,
  tags: ['autodocs'],
} satisfies Meta<typeof ResultBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Won: Story = {
  args: { result: 'won' },
}

export const Lost: Story = {
  args: { result: 'lost' },
}
