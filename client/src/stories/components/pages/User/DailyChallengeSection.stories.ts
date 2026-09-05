import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { mocked } from 'storybook/test'

import DailyChallengeSection from '@/components/pages/User/DailyChallengeSection.vue'
import useAuth from '@/composables/useAuth'
import useDailyChallengeHistoryQuery from '@/composables/useDailyChallengeHistoryQuery'
import useDailyChallengeLeaderboardQuery from '@/composables/useDailyChallengeLeaderboardQuery'

const leaderboard = [
  { rank: 1, userId: 'user-2', displayName: 'Sofia Maps', country: 'ES', totalScore: 24_820 },
  { rank: 2, userId: 'user-1', displayName: 'Aki Explorer', country: 'JP', totalScore: 23_460 },
  { rank: 3, userId: 'user-3', displayName: 'Theo Atlas', country: 'FR', totalScore: 22_190 },
  { rank: 4, userId: 'user-4', displayName: 'Lena North', country: 'DE', totalScore: 20_870 },
  { rank: 5, userId: 'user-5', displayName: 'Rio Rover', country: 'BR', totalScore: 19_540 },
]
const games = [
  {
    id: 'daily-1',
    date: new Date('2026-09-04T00:00:00Z'),
    totalScore: 23_460,
    totalDistanceKm: 24.7,
    completedAt: new Date('2026-09-04T10:15:00Z'),
  },
  {
    id: 'daily-2',
    date: new Date('2026-09-02T00:00:00Z'),
    totalScore: 17_920,
    totalDistanceKm: 168.3,
    completedAt: new Date('2026-09-02T19:42:00Z'),
  },
]

const showData = ({
  entries = leaderboard,
  history = games,
  isError = false,
  isLoading = false,
}: {
  entries?: ReturnType<typeof useDailyChallengeLeaderboardQuery>['entries']['value']
  history?: ReturnType<typeof useDailyChallengeHistoryQuery>['games']['value']
  isError?: boolean
  isLoading?: boolean
} = {}) => {
  mocked(useAuth).mockReturnValue({
    user: ref({ userId: 'user-1' }),
  } as unknown as ReturnType<typeof useAuth>)
  mocked(useDailyChallengeLeaderboardQuery).mockReturnValue({
    entries: ref(entries),
    isError: ref(isError),
    isLoading: ref(isLoading),
  } as ReturnType<typeof useDailyChallengeLeaderboardQuery>)
  mocked(useDailyChallengeHistoryQuery).mockReturnValue({
    games: ref(history),
    isError: ref(isError),
    isLoading: ref(isLoading),
  } as ReturnType<typeof useDailyChallengeHistoryQuery>)
}

const meta = {
  title: 'Components/Pages/User/DailyChallengeSection',
  component: DailyChallengeSection,
  tags: ['autodocs'],
} satisfies Meta<typeof DailyChallengeSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { beforeEach: () => showData() }
export const Empty: Story = { beforeEach: () => showData({ entries: [], history: [] }) }
export const Loading: Story = { beforeEach: () => showData({ isLoading: true }) }
export const Failed: Story = { beforeEach: () => showData({ isError: true }) }
