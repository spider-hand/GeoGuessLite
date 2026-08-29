import type { Meta, StoryObj } from '@storybook/vue3-vite'

import GameMapModal from '@/components/pages/Game/GameMapModal.vue'

const meta = {
  title: 'Components/Pages/Game/GameMapModal',
  component: GameMapModal,
  tags: ['autodocs'],
  args: {
    center: [139.6917, 35.6895],
    isOpen: true,
    zoom: 10,
  },
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  render: (args) => ({
    components: { GameMapModal },
    setup: () => ({ args }),
    template:
      '<div style="min-height: 100vh; background: #0d1117"><GameMapModal v-bind="args" /></div>',
  }),
} satisfies Meta<typeof GameMapModal>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {}

export const Closed: Story = {
  args: {
    isOpen: false,
  },
}
