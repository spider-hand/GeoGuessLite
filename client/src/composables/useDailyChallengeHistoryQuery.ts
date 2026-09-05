import { useQuery } from '@tanstack/vue-query'

import useApi from '@/composables/useApi'
import { DefaultApi } from '@/services'

const useDailyChallengeHistoryQuery = () => {
  const { apiConfig } = useApi()
  const gamesApi = new DefaultApi(apiConfig)
  const query = useQuery({
    queryKey: ['daily-challenge-games'],
    queryFn: () =>
      gamesApi.getDailyChallengeGames({ limit: 10, sortBy: 'completed_at', orderBy: 'desc' }),
    staleTime: Infinity,
  })

  return { games: query.data, isError: query.isError, isLoading: query.isLoading }
}

export default useDailyChallengeHistoryQuery
