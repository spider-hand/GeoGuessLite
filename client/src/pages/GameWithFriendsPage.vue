<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import CountdownTimer from '@/components/pages/Game/CountdownTimer.vue'
import GameMapContainer from '@/components/pages/Game/GameMapContainer.vue'
import GameStreetView from '@/components/pages/Game/GameStreetView.vue'
import RoomKeyStrip from '@/components/pages/Game/RoomKeyStrip.vue'
import RoundLabel from '@/components/pages/Game/RoundLabel.vue'
import WithFriendsGameSummary from '@/components/pages/Game/WithFriendsGameSummary.vue'
import WithFriendsParticipantList from '@/components/pages/Game/WithFriendsParticipantList.vue'
import WithFriendsRoundResult from '@/components/pages/Game/WithFriendsRoundResult.vue'
import Button from '@/components/shared/Button.vue'
import NavigationFooter from '@/components/shared/NavigationFooter.vue'
import NavigationHeader from '@/components/shared/NavigationHeader.vue'
import useAuth from '@/composables/useAuth'
import useRealtimeWithFriendsGame from '@/composables/useRealtimeWithFriendsGame'
import useWithFriendsGameApi from '@/composables/useWithFriendsGameApi'
import { ROUNDS } from '@/constants/game'
import type {
  WithFriendsParticipant,
  WithFriendsRoundResultPlayer,
  WithFriendsSummaryPlayer,
  WithFriendsSummaryRound,
} from '@/types/game'

defineOptions({ name: 'GameWithFriendsPage' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { currentUser, isCurrentUserLoaded, username } = useAuth()
const { createGame, startGame, submitGuess } = useWithFriendsGameApi()
const gameId = computed(() =>
  typeof route.params.gameId === 'string' && route.params.gameId ? route.params.gameId : null,
)
const { error: realtimeError, game, isLoading } = useRealtimeWithFriendsGame(gameId)
const selection = ref<[number, number] | null>(null)
const isStartingGame = ref(false)
const isSubmittingGuess = ref(false)
const isCreatingRoom = ref(false)
const isSummaryVisible = ref(false)
const operationError = ref<Error | null>(null)
const submittedRoundNumber = ref<number | null>(null)

const currentUserId = computed(() => currentUser.value?.uid ?? null)
const resolvedCurrentUserId = computed(() => currentUserId.value ?? '')
const participants = computed<Array<WithFriendsParticipant>>(() =>
  Object.values(game.value?.players ?? {})
    .sort((left, right) => left.joinedAt - right.joinedAt)
    .map(({ userId, displayName, country, isConnected, isHost }) => ({
      userId,
      displayName,
      country,
      isConnected,
      isHost,
    })),
)
const currentPlayer = computed(() => {
  const userId = currentUserId.value
  return userId ? (game.value?.players[userId] ?? null) : null
})
const isHost = computed(
  () => currentUserId.value !== null && game.value?.hostUserId === currentUserId.value,
)
const canStartGame = computed(
  () => participants.value.filter(({ isConnected }) => isConnected).length >= 2,
)
const currentRound = computed(() => {
  const realtimeGame = game.value
  return realtimeGame?.rounds[`round-${realtimeGame.currentRound}`] ?? null
})
const hasSubmittedGuess = computed(
  () =>
    currentPlayer.value?.guessStatus === 'guessed' ||
    currentPlayer.value?.guessStatus === 'revealed' ||
    submittedRoundNumber.value === game.value?.currentRound,
)
const currentRoundResultPlayers = computed<Array<WithFriendsRoundResultPlayer>>(() => {
  const results = currentRound.value?.results ?? {}
  return Object.values(game.value?.players ?? {}).map((player) => {
    const result = results[player.userId]
    return {
      userId: player.userId,
      displayName: player.displayName,
      country: player.country,
      distanceKm: result?.distanceKm ?? null,
      guess: result?.guess ? [result.guess.longitude, result.guess.latitude] : null,
      roundScore: result?.score ?? 0,
      totalScore: player.totalScore,
    }
  })
})
const summaryPlayers = computed<Array<WithFriendsSummaryPlayer>>(() =>
  Object.values(game.value?.players ?? {}).map(({ userId, displayName, country, totalScore }) => ({
    userId,
    displayName,
    country,
    totalScore,
  })),
)
const summaryRounds = computed<Array<WithFriendsSummaryRound>>(() =>
  Object.values(game.value?.rounds ?? {})
    .sort((left, right) => left.roundNumber - right.roundNumber)
    .flatMap((round) =>
      round.target
        ? [
            {
              imageId: round.imageId,
              roundNumber: round.roundNumber,
              target: [round.target.longitude, round.target.latitude] as [number, number],
              results: Object.entries(round.results ?? {}).map(([userId, result]) => ({
                userId,
                distanceKm: result.distanceKm ?? null,
                guess: result.guess
                  ? ([result.guess.longitude, result.guess.latitude] as [number, number])
                  : null,
                score: result.score,
              })),
            },
          ]
        : [],
    ),
)

watch(
  [gameId, isCurrentUserLoaded, currentUserId, isLoading, game, realtimeError],
  async ([currentGameId, isUserLoaded, currentUid, loading, realtimeGame, loadError]) => {
    if (!isUserLoaded || loading) return
    if (!currentGameId || loadError || !realtimeGame || !currentUid) {
      await router.replace('/')
      return
    }
    if (!realtimeGame.players[currentUid]) await router.replace('/')
  },
  { immediate: true },
)

watch([gameId, () => game.value?.currentRound], () => {
  selection.value = null
  submittedRoundNumber.value = null
  isSummaryVisible.value = false
  operationError.value = null
})

const handleStart = async () => {
  if (
    !gameId.value ||
    game.value?.status !== 'waiting' ||
    !isHost.value ||
    !canStartGame.value ||
    isStartingGame.value
  )
    return
  isStartingGame.value = true
  operationError.value = null
  try {
    await startGame(gameId.value)
  } catch (error) {
    operationError.value = error instanceof Error ? error : new Error('Unable to start game')
  } finally {
    isStartingGame.value = false
  }
}

const handleSelect = (coordinates: [number, number]) => {
  if (!hasSubmittedGuess.value) selection.value = coordinates
}

const handleSubmit = async () => {
  if (
    !gameId.value ||
    !game.value ||
    !selection.value ||
    hasSubmittedGuess.value ||
    isSubmittingGuess.value
  )
    return

  isSubmittingGuess.value = true
  operationError.value = null
  try {
    await submitGuess(gameId.value, game.value.currentRound, {
      longitude: selection.value[0],
      latitude: selection.value[1],
    })
    submittedRoundNumber.value = game.value.currentRound
  } catch (error) {
    operationError.value = error instanceof Error ? error : new Error('Unable to submit guess')
  } finally {
    isSubmittingGuess.value = false
  }
}

const handleCreateRoom = async () => {
  if (!isHost.value || isCreatingRoom.value) return
  isCreatingRoom.value = true
  operationError.value = null
  try {
    const createdGame = await createGame()
    await router.push(`/game/with-friends/${createdGame.id}`)
  } catch (error) {
    operationError.value = error instanceof Error ? error : new Error('Unable to create room')
  } finally {
    isCreatingRoom.value = false
  }
}

const handleExit = () => router.push('/')
const handleViewSummary = () => {
  isSummaryVisible.value = true
}
</script>

<template>
  <main class="with-friends-page">
    <NavigationHeader />

    <section v-if="isLoading || !game || !currentPlayer" class="with-friends-page__centered">
      <LoaderCircle class="with-friends-page__loader" :size="32" aria-hidden="true" />
    </section>

    <section
      v-else-if="game.status === 'waiting' || game.status === 'starting'"
      class="with-friends-page__lobby"
    >
      <div class="with-friends-page__lobby-header">
        <div>
          <h1>{{ t('components.pages.Game.GameWithFriendsPage.waitingForOpponent') }}</h1>
          <p v-if="game.status === 'starting'">
            {{ t('components.pages.Game.GameWithFriendsPage.starting') }}
          </p>
          <p v-else-if="!isHost">
            {{ t('components.pages.Game.GameWithFriendsPage.waitingForHost') }}
          </p>
        </div>
        <RoomKeyStrip class="with-friends-page__room-key" :room-key="game.roomKey" />
      </div>
      <WithFriendsParticipantList :participants="participants" />
      <p v-if="operationError" class="with-friends-page__error" role="alert">
        {{ t('components.pages.Game.GameWithFriendsPage.actionError') }}
      </p>
      <div class="with-friends-page__actions">
        <Button
          v-if="isHost"
          :disabled="!canStartGame || game.status === 'starting'"
          :loading="isStartingGame"
          @click="handleStart"
        >
          {{ t('components.pages.Game.GameWithFriendsPage.startGame') }}
        </Button>
        <Button variant="secondary" @click="handleExit">
          {{ t('components.pages.Game.GameWithFriendsPage.exit') }}
        </Button>
      </div>
    </section>

    <section
      v-else-if="game.status === 'guessing' && currentRound"
      class="with-friends-page__play-area"
    >
      <GameStreetView class="with-friends-page__street-view" :image-id="currentRound.imageId" />
      <RoundLabel
        class="with-friends-page__round-label"
        :current-round="game.currentRound"
        :total-rounds="ROUNDS"
      />
      <CountdownTimer class="with-friends-page__timer" :started-at-ms="currentRound.startedAt" />
      <p v-if="operationError" class="with-friends-page__status with-friends-page__error">
        {{ t('components.pages.Game.GameWithFriendsPage.actionError') }}
      </p>
      <GameMapContainer
        :is-submitted="hasSubmittedGuess"
        :is-submitting="isSubmittingGuess"
        :player-name="username"
        :selection="selection"
        @select="handleSelect"
        @submit="handleSubmit"
      />
    </section>

    <WithFriendsRoundResult
      v-else-if="
        (game.status === 'results' || game.status === 'completed') &&
        !isSummaryVisible &&
        currentRound?.target
      "
      :current-user-id="resolvedCurrentUserId"
      :image-id="currentRound.imageId"
      :players="currentRoundResultPlayers"
      :round-number="game.currentRound"
      :target="[currentRound.target.longitude, currentRound.target.latitude]"
      @view-summary="handleViewSummary"
    />

    <WithFriendsGameSummary
      v-else-if="game.status === 'completed' && isSummaryVisible"
      :can-create-room="isHost"
      :current-user-id="resolvedCurrentUserId"
      :is-creating-room="isCreatingRoom"
      :players="summaryPlayers"
      :rounds="summaryRounds"
      @create-room="handleCreateRoom"
      @exit="handleExit"
    />

    <section v-else class="with-friends-page__centered">
      <LoaderCircle class="with-friends-page__loader" :size="32" aria-hidden="true" />
    </section>

    <NavigationFooter />
  </main>
</template>

<style scoped>
.with-friends-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--on-primary);
}

.with-friends-page__centered,
.with-friends-page__lobby {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
}

.with-friends-page__loader {
  color: var(--muted);
  animation: with-friends-page-spin 1s linear infinite;
}

.with-friends-page__lobby-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  width: min(100%, 760px);
}

.with-friends-page__lobby-header h1,
.with-friends-page__lobby-header p,
.with-friends-page__status,
.with-friends-page__error {
  margin: 0;
}

.with-friends-page__lobby-header p {
  margin-top: var(--spacing-xs);
  color: var(--muted-strong);
}

.with-friends-page__actions {
  display: flex;
  gap: var(--spacing-md);
}

.with-friends-page__play-area {
  position: relative;
  flex: 1;
  min-height: 560px;
  overflow: hidden;
}

.with-friends-page__street-view {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: 560px;
  border-radius: 0;
}

.with-friends-page__round-label,
.with-friends-page__timer,
.with-friends-page__status {
  position: absolute;
  z-index: 5;
  top: var(--spacing-lg);
}

.with-friends-page__round-label {
  left: var(--spacing-lg);
}

.with-friends-page__timer {
  right: var(--spacing-lg);
  background-color: color-mix(in srgb, var(--surface-card-dark) 92%, transparent);
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.24);
}

.with-friends-page__status {
  right: 50%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
  background-color: color-mix(in srgb, var(--surface-card-dark) 92%, transparent);
  color: var(--on-dark);
  transform: translateX(50%);
}

.with-friends-page__error {
  color: var(--danger);
}

@keyframes with-friends-page-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 680px) {
  .with-friends-page__lobby,
  .with-friends-page__lobby-header {
    align-items: stretch;
  }

  .with-friends-page__lobby-header {
    flex-direction: column;
  }

  .with-friends-page__room-key {
    align-self: flex-start;
  }

  .with-friends-page__play-area,
  .with-friends-page__street-view {
    min-height: 500px;
  }

  .with-friends-page__round-label,
  .with-friends-page__timer {
    top: var(--spacing-sm);
  }

  .with-friends-page__round-label {
    left: var(--spacing-sm);
  }

  .with-friends-page__timer {
    right: var(--spacing-sm);
  }

  .with-friends-page__status {
    top: 72px;
    width: calc(100% - 24px);
    text-align: center;
  }
}
</style>
