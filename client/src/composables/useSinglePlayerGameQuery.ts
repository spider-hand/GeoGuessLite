import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import useApi from '@/composables/useApi'
import {
  DefaultApi,
  type CreateSinglePlayerGame201Response,
  type CreateSinglePlayerGame201ResponseRoundsInner,
  type CreateSinglePlayerGame201ResponseRoundsInnerResultGuess,
} from '@/services'

const replaceRound = (
  game: CreateSinglePlayerGame201Response,
  round: CreateSinglePlayerGame201ResponseRoundsInner,
) => ({
  ...game,
  currentRound: Math.max(game.currentRound, round.roundNumber),
  rounds: [
    ...game.rounds.filter(({ roundNumber }) => roundNumber !== round.roundNumber),
    round,
  ].sort((left, right) => left.roundNumber - right.roundNumber),
})

const useSinglePlayerGameQuery = (gameId: MaybeRefOrGetter<string | null>) => {
  const { apiConfig } = useApi()
  const gamesApi = new DefaultApi(apiConfig)
  const queryClient = useQueryClient()
  const normalizedGameId = computed(() => toValue(gameId))
  const gameQuery = useQuery({
    queryKey: computed(() => ['single-player-game', normalizedGameId.value ?? 'pending']),
    enabled: computed(() => normalizedGameId.value !== null),
    queryFn: () => gamesApi.getSinglePlayerGame({ gameId: normalizedGameId.value! }),
    staleTime: Infinity,
  })

  const createGameMutation = useMutation({
    mutationFn: () => gamesApi.createSinglePlayerGame(),
    onSuccess: (game) => {
      queryClient.setQueryData(['single-player-game', game.id], game)
    },
  })

  const startRoundMutation = useMutation({
    mutationFn: ({ gameId: id, roundNumber }: { gameId: string; roundNumber: number }) =>
      gamesApi.startSinglePlayerGameRound({ gameId: id, roundNumber }),
    onSuccess: (round, { gameId: id }) => {
      queryClient.setQueryData<CreateSinglePlayerGame201Response>(
        ['single-player-game', id],
        (game) => (game ? replaceRound(game, round) : game),
      )
    },
  })

  const submitGuessMutation = useMutation({
    mutationFn: ({
      gameId: id,
      roundNumber,
      guess,
    }: {
      gameId: string
      roundNumber: number
      guess: CreateSinglePlayerGame201ResponseRoundsInnerResultGuess | null
    }) =>
      gamesApi.createSinglePlayerGameGuess({
        gameId: id,
        roundNumber,
        createSinglePlayerGameGuessRequest: { guess },
      }),
    onSuccess: async (round, { gameId: id }) => {
      queryClient.setQueryData<CreateSinglePlayerGame201Response>(
        ['single-player-game', id],
        (game) => {
          if (!game) return game

          const updatedGame = replaceRound(
            game,
            round as unknown as CreateSinglePlayerGame201ResponseRoundsInner,
          )
          return round.roundNumber === 5
            ? { ...updatedGame, status: 'completed', completedAt: round.result.completedAt }
            : updatedGame
        },
      )

      if (round.roundNumber === 5) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['single-player-games'] }),
          queryClient.invalidateQueries({ queryKey: ['user'] }),
        ])
      }
    },
  })

  return {
    createGameAsync: createGameMutation.mutateAsync,
    game: gameQuery.data,
    gameError: gameQuery.error,
    isCreatingGame: createGameMutation.isPending,
    isLoadingGame: gameQuery.isLoading,
    isStartingRound: startRoundMutation.isPending,
    isSubmittingGuess: submitGuessMutation.isPending,
    refetchGame: gameQuery.refetch,
    startRoundAsync: startRoundMutation.mutateAsync,
    submitGuessAsync: submitGuessMutation.mutateAsync,
  }
}

export default useSinglePlayerGameQuery
