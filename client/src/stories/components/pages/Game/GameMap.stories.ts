import type { Meta, StoryObj } from '@storybook/vue3-vite'

import GameMap from '@/components/pages/Game/GameMap.vue'

const meta = {
  title: 'Components/Pages/Game/GameMap',
  component: GameMap,
  tags: ['autodocs'],
  args: {
    center: [139.6917, 35.6895],
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

export const Default: Story = {}
