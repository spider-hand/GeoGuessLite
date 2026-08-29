import type { Meta, StoryObj } from '@storybook/vue3-vite'

import RoomKeyStrip from '@/components/pages/Game/RoomKeyStrip.vue'

const meta = {
  title: 'Components/Pages/Game/RoomKeyStrip',
  component: RoomKeyStrip,
  tags: ['autodocs'],
  args: {
    roomKey: '654321',
  },
} satisfies Meta<typeof RoomKeyStrip>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
