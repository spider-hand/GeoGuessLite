import type { Meta, StoryObj } from '@storybook/vue3-vite'

import GameMapModal from '@/components/pages/Game/GameMapModal.vue'
import Button from '@/components/shared/Button.vue'

const meta = {
  title: 'Components/Pages/Game/GameMapModal',
  component: GameMapModal,
  tags: ['autodocs'],
  args: {
    center: [139.6917, 35.6895],
    isOpen: true,
    isSelectable: true,
    markers: [],
    zoom: 10,
  },
  render: (args) => ({
    components: { Button, GameMapModal },
    setup: () => ({ args }),
    template:
      '<div style="min-height: 100vh; background: #0d1117"><GameMapModal v-bind="args"><Button>Make Guess</Button></GameMapModal></div>',
  }),
} satisfies Meta<typeof GameMapModal>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = { args: {} }

export const Closed: Story = {
  args: {
    isOpen: false,
    isSelectable: true,
    markers: [],
  },
}

export const MobileOpen: Story = {
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
}
