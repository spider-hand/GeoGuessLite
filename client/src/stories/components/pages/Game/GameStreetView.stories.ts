import type { Meta, StoryObj } from '@storybook/vue3-vite'

import GameStreetView from '@/components/pages/Game/GameStreetView.vue'

const meta = {
  title: 'Components/Pages/Game/GameStreetView',
  component: GameStreetView,
  tags: ['autodocs'],
  args: {
    imageId: '524779645570864',
  },
  render: (args) => ({
    components: { GameStreetView },
    setup: () => ({ args }),
    template: '<div style="width: min(100%, 720px)"><GameStreetView v-bind="args" /></div>',
  }),
} satisfies Meta<typeof GameStreetView>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
