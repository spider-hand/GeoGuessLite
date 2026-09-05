import { useQuery } from '@tanstack/vue-query'

import useApi from '@/composables/useApi'
import { DefaultApi } from '@/services'

const useWithFriendsGamesQuery = () => {
  const { apiConfig } = useApi()
  const gamesApi = new DefaultApi(apiConfig)
  const query = useQuery({
    queryKey: ['with-friends-games'],
    queryFn: () =>
      gamesApi.getWithFriendsGames({ limit: 10, sortBy: 'completed_at', orderBy: 'desc' }),
    staleTime: Infinity,
  })

  return { games: query.data, isError: query.isError, isLoading: query.isLoading }
}

export default useWithFriendsGamesQuery
