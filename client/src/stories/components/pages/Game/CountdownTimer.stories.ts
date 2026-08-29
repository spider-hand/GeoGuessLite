import type { Meta, StoryObj } from '@storybook/vue3-vite'

import CountdownTimer from '@/components/pages/Game/CountdownTimer.vue'

const meta = {
  title: 'Components/Pages/Game/CountdownTimer',
  component: CountdownTimer,
  tags: ['autodocs'],
  args: {
    startedAtMs: Date.now(),
  },
} satisfies Meta<typeof CountdownTimer>

export default meta

type Story = StoryObj<typeof meta>

export const Running: Story = {}

export const Danger: Story = {
  args: {
    startedAtMs: Date.now() - 51_000,
  },
}

export const Finished: Story = {
  args: {
    startedAtMs: Date.now() - 60_000,
  },
}
