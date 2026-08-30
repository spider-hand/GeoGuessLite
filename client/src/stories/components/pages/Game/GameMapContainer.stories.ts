import type { Meta, StoryObj } from '@storybook/vue3-vite'

import GameMapContainer from '@/components/pages/Game/GameMapContainer.vue'

const meta = {
  title: 'Components/Pages/Game/GameMapContainer',
  component: GameMapContainer,
  tags: ['autodocs'],
  args: {
    isSubmitting: false,
    playerName: 'Taylor Swift',
    selection: null,
  },
  render: (args) => ({
    components: { GameMapContainer },
    setup: () => ({ args }),
    template:
      '<div style="min-height: 100vh; background: #181a20"><GameMapContainer v-bind="args" /></div>',
  }),
} satisfies Meta<typeof GameMapContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Selected: Story = {
  args: { selection: [139.6917, 35.6895] },
}

export const Submitting: Story = {
  args: { isSubmitting: true, selection: [139.6917, 35.6895] },
}
