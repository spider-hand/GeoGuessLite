import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { mocked } from 'storybook/test'

import SinglePlayerGamesSection from '@/components/pages/User/SinglePlayerGamesSection.vue'
import useAuth from '@/composables/useAuth'
import useSinglePlayerGamesQuery from '@/composables/useSinglePlayerGamesQuery'

const showGames = (
  games: ReturnType<typeof useSinglePlayerGamesQuery>['games']['value'],
  options: { isError?: boolean; isLoading?: boolean } = {},
) => {
  mocked(useAuth).mockReturnValue({
    isLoadingUser: ref(false),
    user: ref({ gamesPlayed: 18, bestScore: 24_680, averageScore: 17_342 }),
  } as unknown as ReturnType<typeof useAuth>)
  mocked(useSinglePlayerGamesQuery).mockReturnValue({
    games: ref(games),
    isError: ref(options.isError ?? false),
    isLoading: ref(options.isLoading ?? false),
  } as ReturnType<typeof useSinglePlayerGamesQuery>)
}

const games = [
  {
    id: 'single-1',
    totalScore: 23_750,
    totalDistanceKm: 18.4,
    createdAt: new Date('2026-09-04T09:10:00Z'),
    completedAt: new Date('2026-09-04T09:22:00Z'),
  },
  {
    id: 'single-2',
    totalScore: 18_420,
    totalDistanceKm: 143.8,
    createdAt: new Date('2026-09-01T18:30:00Z'),
    completedAt: new Date('2026-09-01T18:43:00Z'),
  },
  {
    id: 'single-3',
    totalScore: 12_960,
    totalDistanceKm: null,
    createdAt: new Date('2026-08-29T12:00:00Z'),
    completedAt: new Date('2026-08-29T12:14:00Z'),
  },
]

const meta = {
  title: 'Components/Pages/User/SinglePlayerGamesSection',
  component: SinglePlayerGamesSection,
  tags: ['autodocs'],
} satisfies Meta<typeof SinglePlayerGamesSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { beforeEach: () => showGames(games) }
export const Empty: Story = { beforeEach: () => showGames([]) }
export const Loading: Story = { beforeEach: () => showGames(undefined, { isLoading: true }) }
export const Failed: Story = { beforeEach: () => showGames(undefined, { isError: true }) }
