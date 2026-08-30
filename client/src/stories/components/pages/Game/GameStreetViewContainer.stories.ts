import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { userEvent, within } from 'storybook/test'

import GameStreetViewContainer from '@/components/pages/Game/GameStreetViewContainer.vue'

const meta = {
  title: 'Components/Pages/Game/GameStreetViewContainer',
  component: GameStreetViewContainer,
  tags: ['autodocs'],
  args: {
    imageId: '524779645570864',
  },
  render: (args) => ({
    components: { GameStreetViewContainer },
    setup: () => ({ args }),
    template:
      '<div style="min-height: 100vh; background: #0d1117"><GameStreetViewContainer v-bind="args" /></div>',
  }),
} satisfies Meta<typeof GameStreetViewContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Collapsed: Story = {}

export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Show Street View' }))
  },
}

export const MobileOpen: Story = {
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: Open.play,
}
