import type { Meta, StoryObj } from '@storybook/vue3-vite'

import GameMap from '@/components/pages/Game/GameMap.vue'

const meta = {
  title: 'Components/Pages/Game/GameMap',
  component: GameMap,
  tags: ['autodocs'],
  args: {
    center: [139.6917, 35.6895],
    isSelectable: true,
    markers: [],
    zoom: 10,
  },
  render: (args) => ({
    components: { GameMap },
    setup: () => ({ args }),
    template: '<div style="width: min(100%, 720px)"><GameMap v-bind="args" /></div>',
  }),
} satisfies Meta<typeof GameMap>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = { args: {} }

export const Selected: Story = {
  args: {
    markers: [{ coordinates: [139.6917, 35.6895], label: 'Taylor Swift', markerType: 'player' }],
  },
}

export const Result: Story = {
  args: {
    isSelectable: false,
    markers: [
      { coordinates: [139.6917, 35.6895], label: 'Taylor Swift', markerType: 'player' },
      {
        coordinates: [139.7671, 35.6812],
        label: 'Correct location',
        markerType: 'target',
      },
    ],
  },
}
