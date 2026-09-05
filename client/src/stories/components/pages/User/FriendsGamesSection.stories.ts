import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { mocked } from 'storybook/test'

import FriendsGamesSection from '@/components/pages/User/FriendsGamesSection.vue'
import useWithFriendsGamesQuery from '@/composables/useWithFriendsGamesQuery'

const showGames = (
  games: ReturnType<typeof useWithFriendsGamesQuery>['games']['value'],
  options: { isError?: boolean; isLoading?: boolean } = {},
) => {
  mocked(useWithFriendsGamesQuery).mockReturnValue({
    games: ref(games),
    isError: ref(options.isError ?? false),
    isLoading: ref(options.isLoading ?? false),
  } as ReturnType<typeof useWithFriendsGamesQuery>)
}

const games = [
  {
    id: 'friends-1',
    hostUserId: 'host-1',
    hostDisplayName: 'Maya Explorer',
    hostCountry: 'JP',
    rank: 1,
    playerCount: 5,
    totalScore: 22_810,
    totalDistanceKm: 34.6,
    completedAt: new Date('2026-09-04T14:20:00Z'),
  },
  {
    id: 'friends-2',
    hostUserId: 'host-2',
    hostDisplayName: 'Atlas Wanderer',
    hostCountry: 'FR',
    rank: 2,
    playerCount: 4,
    totalScore: 19_540,
    totalDistanceKm: 88.2,
    completedAt: new Date('2026-09-02T20:05:00Z'),
  },
  {
    id: 'friends-3',
    hostUserId: 'host-3',
    hostDisplayName: 'Map Detective',
    hostCountry: 'BR',
    rank: 3,
    playerCount: 6,
    totalScore: 16_320,
    totalDistanceKm: null,
    completedAt: new Date('2026-08-30T08:45:00Z'),
  },
]

const meta = {
  title: 'Components/Pages/User/FriendsGamesSection',
  component: FriendsGamesSection,
  tags: ['autodocs'],
} satisfies Meta<typeof FriendsGamesSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { beforeEach: () => showGames(games) }
export const Empty: Story = { beforeEach: () => showGames([]) }
export const Loading: Story = { beforeEach: () => showGames(undefined, { isLoading: true }) }
export const Failed: Story = { beforeEach: () => showGames(undefined, { isError: true }) }
