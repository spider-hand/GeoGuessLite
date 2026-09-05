import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import useApi from '@/composables/useApi'
import { DefaultApi } from '@/services'

const useDailyChallengeLeaderboardQuery = (date: MaybeRefOrGetter<Date>) => {
  const { apiConfig } = useApi()
  const gamesApi = new DefaultApi(apiConfig)
  const normalizedDate = computed(() => toValue(date))
  const query = useQuery({
    queryKey: computed(() => [
      'daily-challenge-leaderboard',
      normalizedDate.value.toISOString().slice(0, 10),
    ]),
    queryFn: () => gamesApi.getDailyChallengeLeaderboard({ date: normalizedDate.value }),
    staleTime: Infinity,
  })

  return { entries: query.data, isError: query.isError, isLoading: query.isLoading }
}

export default useDailyChallengeLeaderboardQuery
