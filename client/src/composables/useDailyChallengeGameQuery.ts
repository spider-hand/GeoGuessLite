import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import useApi from '@/composables/useApi'
import {
  DefaultApi,
  type CreateDailyChallengeGame200Response,
  type CreateDailyChallengeGame200ResponseRoundsInner,
  type CreateSinglePlayerGame201ResponseRoundsInnerResultGuess,
} from '@/services'
import type { DailyChallengeAvailability } from '@/types/game'

const queryKey = ['daily-challenge-game', 'today'] as const
type DailyChallengeState = {
  date: Date
  status: 'available' | 'ongoing' | 'completed'
  game?: CreateDailyChallengeGame200Response
}

const replaceRound = (
  game: CreateDailyChallengeGame200Response,
  round: CreateDailyChallengeGame200ResponseRoundsInner,
) => ({
  ...game,
  currentRound: Math.max(game.currentRound, round.roundNumber),
  rounds: [
    ...game.rounds.filter(({ roundNumber }) => roundNumber !== round.roundNumber),
    round,
  ].sort((left, right) => left.roundNumber - right.roundNumber),
})

const useDailyChallengeGameQuery = (enabled: MaybeRefOrGetter<boolean> = true) => {
  const { apiConfig } = useApi()
  const gamesApi = new DefaultApi(apiConfig)
  const queryClient = useQueryClient()
  const isEnabled = computed(() => toValue(enabled))
  const todayQuery = useQuery<DailyChallengeState>({
    queryKey,
    enabled: isEnabled,
    queryFn: async () => {
      const today = await gamesApi.getTodayDailyChallenge()
      return {
        ...today,
        game: today.game as unknown as CreateDailyChallengeGame200Response | undefined,
      }
    },
    staleTime: Infinity,
  })

  const setGame = (
    update: (game: CreateDailyChallengeGame200Response) => CreateDailyChallengeGame200Response,
  ) => {
    queryClient.setQueryData<DailyChallengeState>(queryKey, (today) => {
      if (!today?.game) return today
      const game = update(today.game)
      return { ...today, status: game.status, game }
    })
  }

  const createGameMutation = useMutation({
    mutationFn: () => gamesApi.createDailyChallengeGame(),
    onSuccess: async (game) => {
      queryClient.setQueryData<DailyChallengeState>(queryKey, (today) => ({
        date: today?.date ?? new Date(),
        status: game.status,
        game,
      }))
      await queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const startRoundMutation = useMutation({
    mutationFn: ({ gameId, roundNumber }: { gameId: string; roundNumber: number }) =>
      gamesApi.startDailyChallengeGameRound({ gameId, roundNumber }),
    onSuccess: (round) => {
      setGame((game) =>
        replaceRound(game, round as unknown as CreateDailyChallengeGame200ResponseRoundsInner),
      )
    },
  })

  const submitGuessMutation = useMutation({
    mutationFn: ({
      gameId,
      roundNumber,
      guess,
    }: {
      gameId: string
      roundNumber: number
      guess: CreateSinglePlayerGame201ResponseRoundsInnerResultGuess | null
    }) =>
      gamesApi.createDailyChallengeGameGuess({
        gameId,
        roundNumber,
        createDailyChallengeGameGuessRequest: { guess },
      }),
    onSuccess: async (round) => {
      setGame((game) => {
        const updatedGame = replaceRound(
          game,
          round as unknown as CreateDailyChallengeGame200ResponseRoundsInner,
        )
        return round.roundNumber === 5
          ? { ...updatedGame, status: 'completed', completedAt: round.result.completedAt }
          : updatedGame
      })

      if (round.roundNumber === 5) {
        await queryClient.invalidateQueries({ queryKey: ['user'] })
      }
    },
  })

  const refetchGame = async () => {
    const result = await todayQuery.refetch()
    return { data: result.data?.game, error: result.error }
  }

  return {
    availability: computed<DailyChallengeAvailability>(() => {
      if (!isEnabled.value) return 'available'
      if (todayQuery.isLoading.value) return 'loading'
      if (todayQuery.error.value) return 'unavailable'
      return todayQuery.data.value?.status ?? 'available'
    }),
    createGameAsync: createGameMutation.mutateAsync,
    game: computed(() => todayQuery.data.value?.game),
    gameError: todayQuery.error,
    isCreatingGame: createGameMutation.isPending,
    isLoadingGame: todayQuery.isLoading,
    isStartingRound: startRoundMutation.isPending,
    isSubmittingGuess: submitGuessMutation.isPending,
    refetchGame,
    startRoundAsync: startRoundMutation.mutateAsync,
    submitGuessAsync: submitGuessMutation.mutateAsync,
  }
}

export default useDailyChallengeGameQuery
