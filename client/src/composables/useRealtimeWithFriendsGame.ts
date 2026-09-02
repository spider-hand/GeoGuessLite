import { onValue, ref as databaseRef } from 'firebase/database'
import { onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import { getFirebaseDatabase } from '@/lib/firebase'

export type RealtimeWithFriendsGamePlayer = {
  userId: string
  displayName: string
  country?: string
  isConnected: boolean
  isHost: boolean
  guessStatus: 'waiting' | 'guessing' | 'guessed' | 'revealed'
  totalScore: number
  joinedAt: number
}

export type RealtimeWithFriendsGameRoundResult = {
  guess?: { latitude: number; longitude: number }
  distanceKm?: number
  score: number
}

export type RealtimeWithFriendsGameRound = {
  roundNumber: number
  imageId: string
  startedAt: number
  target?: { latitude: number; longitude: number }
  results?: Record<string, RealtimeWithFriendsGameRoundResult>
  revealedAt?: number
}

type RealtimeWithFriendsGameSnapshot = {
  id: string
  roomKey: string
  hostUserId: string
  status: 'waiting' | 'starting' | 'guessing' | 'results' | 'completed'
  currentRound: number
  players?: Record<string, RealtimeWithFriendsGamePlayer>
  rounds?: Record<string, RealtimeWithFriendsGameRound>
  guessingEndsAt?: number
  proceedToNextRoundAt?: number
  createdAt: number
  updatedAt: number
  completedAt?: number
}

export type RealtimeWithFriendsGame = Omit<
  RealtimeWithFriendsGameSnapshot,
  'players' | 'rounds'
> & {
  players: Record<string, RealtimeWithFriendsGamePlayer>
  rounds: Record<string, RealtimeWithFriendsGameRound>
}

const normalizeGame = (game: RealtimeWithFriendsGameSnapshot): RealtimeWithFriendsGame => ({
  ...game,
  players: game.players ?? {},
  rounds: game.rounds ?? {},
})

const useRealtimeWithFriendsGame = (gameId: MaybeRefOrGetter<string | null>) => {
  const game = ref<RealtimeWithFriendsGame | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(true)
  let unsubscribe: (() => void) | null = null

  watch(
    () => toValue(gameId),
    (nextGameId) => {
      unsubscribe?.()
      unsubscribe = null
      game.value = null
      error.value = null

      if (!nextGameId) {
        isLoading.value = false
        return
      }

      isLoading.value = true
      unsubscribe = onValue(
        databaseRef(getFirebaseDatabase(), `withFriendsGames/${nextGameId}/public`),
        (snapshot) => {
          if (!snapshot.exists()) {
            game.value = null
            error.value = new Error('Realtime with-friends game was not found.')
          } else {
            game.value = normalizeGame(snapshot.val() as RealtimeWithFriendsGameSnapshot)
            error.value = null
          }
          isLoading.value = false
        },
        (loadError) => {
          game.value = null
          error.value = loadError
          isLoading.value = false
        },
      )
    },
    { immediate: true },
  )

  onScopeDispose(() => unsubscribe?.())

  return { error, game, isLoading }
}

export default useRealtimeWithFriendsGame
