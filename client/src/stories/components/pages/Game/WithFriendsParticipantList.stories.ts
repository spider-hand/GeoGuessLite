import type { Meta, StoryObj } from '@storybook/vue3-vite'

import WithFriendsParticipantList from '@/components/pages/Game/WithFriendsParticipantList.vue'
import type { WithFriendsParticipant } from '@/types/game'

const participants: Array<WithFriendsParticipant> = [
  {
    userId: 'host',
    displayName: 'Taylor Swift',
    country: 'JP',
    isConnected: true,
    isHost: true,
  },
  {
    userId: 'guest-1',
    displayName: 'Alex Morgan',
    country: 'US',
    isConnected: true,
    isHost: false,
  },
  {
    userId: 'guest-2',
    displayName: 'Sam Lee',
    country: 'KR',
    isConnected: true,
    isHost: false,
  },
]

const meta = {
  title: 'Components/Pages/Game/WithFriendsParticipantList',
  component: WithFriendsParticipantList,
  tags: ['autodocs'],
  args: { participants },
} satisfies Meta<typeof WithFriendsParticipantList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithDisconnectedPlayer: Story = {
  args: {
    participants: participants.map((participant, index) =>
      index === 2 ? { ...participant, isConnected: false } : participant,
    ),
  },
}

export const FullRoom: Story = {
  args: {
    participants: Array.from({ length: 100 }, (_, index) => ({
      userId: `player-${index + 1}`,
      displayName: `Player ${index + 1}`,
      country: index % 2 === 0 ? 'JP' : 'US',
      isConnected: true,
      isHost: index === 0,
    })),
  },
}
