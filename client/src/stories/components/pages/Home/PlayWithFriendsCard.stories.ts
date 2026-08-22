import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { userEvent, within } from 'storybook/test'

import PlayWithFriendsCard from '@/components/pages/Home/PlayWithFriendsCard.vue'

const meta = {
  title: 'Components/Pages/Home/PlayWithFriendsCard',
  component: PlayWithFriendsCard,
  tags: ['autodocs'],
  args: {
    disabled: false,
    isCreatingRoom: false,
    isEnteringRoom: false,
  },
} satisfies Meta<typeof PlayWithFriendsCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const CreatingRoom: Story = {
  args: {
    isCreatingRoom: true,
  },
}

export const EnteringRoom: Story = {
  args: {
    isEnteringRoom: true,
  },
}

export const InvalidRoomKey: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.type(canvas.getByPlaceholderText('6-Digit Key'), '123')
  },
}
