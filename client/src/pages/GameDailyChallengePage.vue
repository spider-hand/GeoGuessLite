<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import CountdownTimer from '@/components/pages/Game/CountdownTimer.vue'
import DailyChallengeGameSummary from '@/components/pages/Game/DailyChallengeGameSummary.vue'
import GameMapContainer from '@/components/pages/Game/GameMapContainer.vue'
import GameStreetView from '@/components/pages/Game/GameStreetView.vue'
import RoundLabel from '@/components/pages/Game/RoundLabel.vue'
import SinglePlayerRoundResult from '@/components/pages/Game/SinglePlayerRoundResult.vue'
import Button from '@/components/shared/Button.vue'
import NavigationFooter from '@/components/shared/NavigationFooter.vue'
import NavigationHeader from '@/components/shared/NavigationHeader.vue'
import useAuth from '@/composables/useAuth'
import useDailyChallengeGameQuery from '@/composables/useDailyChallengeGameQuery'
import type { SinglePlayerSummaryRound } from '@/types/game'

defineOptions({ name: 'GameDailyChallengePage' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { username } = useAuth()
const selection = ref<[number, number] | null>(null)
const isInitializing = ref(true)
const isSummaryVisible = ref(false)
const isAlreadyPlayed = ref(false)
const didExpire = ref(false)
const operationError = ref<Error | null>(null)
const routeGameId =
  typeof route.params.gameId === 'string' && route.params.gameId ? route.params.gameId : null
const isHistoricalGame = routeGameId !== null
const {
  createGameAsync,
  game,
  gameError,
  isLoadingGame,
  isStartingRound,
  isSubmittingGuess,
  refetchGame,
  startRoundAsync,
  submitGuessAsync,
} = useDailyChallengeGameQuery(routeGameId)

const currentRound = computed(() =>
  game.value?.rounds.find(({ roundNumber }) => roundNumber === game.value?.currentRound),
)
const currentResult = computed(() => currentRound.value?.result)
const totalScore = computed(
  () => game.value?.rounds.reduce((total, round) => total + (round.result?.score ?? 0), 0) ?? 0,
)
const summaryRounds = computed<Array<SinglePlayerSummaryRound>>(() =>
  (game.value?.rounds ?? []).flatMap((round) =>
    round.result
      ? [
          {
            distanceKm: round.result.distanceKm,
            imageId: round.imageId,
            roundNumber: round.roundNumber,
            score: round.result.score,
            selection: round.result.guess
              ? [round.result.guess.longitude, round.result.guess.latitude]
              : null,
            target: [round.result.target.longitude, round.result.target.latitude],
          },
        ]
      : [],
  ),
)
const isBusy = computed(() => isInitializing.value || isLoadingGame.value)
const isFatalError = computed(
  () => !isBusy.value && !game.value && (operationError.value !== null || gameError.value !== null),
)

const startRound = async (gameId: string, roundNumber: number) => {
  operationError.value = null
  try {
    await startRoundAsync({ gameId, roundNumber })
    selection.value = null
    didExpire.value = false
  } catch (error) {
    operationError.value = error instanceof Error ? error : new Error('Unable to start round')
    throw error
  }
}

const loadGame = async () => {
  isInitializing.value = true
  operationError.value = null

  try {
    let loadedGame = game.value
    if (!loadedGame) {
      const queryResult = await refetchGame()
      loadedGame = queryResult.data
      if (!loadedGame && !queryResult.error) loadedGame = await createGameAsync()
      if (!loadedGame) throw queryResult.error ?? new Error('Unable to load daily challenge')
    }

    isAlreadyPlayed.value = !isHistoricalGame && loadedGame.status === 'completed'
    if (isHistoricalGame) {
      isSummaryVisible.value = true
      return
    }
    if (loadedGame.status === 'ongoing' && loadedGame.currentRound === 0) {
      await startRound(loadedGame.id, 1)
    }
  } catch (error) {
    operationError.value =
      error instanceof Error ? error : new Error('Unable to load daily challenge')
  } finally {
    isInitializing.value = false
  }
}

const submitGuess = async (guess: { latitude: number; longitude: number } | null) => {
  if (!game.value || !currentRound.value || currentResult.value || isSubmittingGuess.value) return

  operationError.value = null
  try {
    const completedRound = await submitGuessAsync({
      gameId: game.value.id,
      roundNumber: currentRound.value.roundNumber,
      guess,
    })
    if (completedRound.roundNumber === 5) isSummaryVisible.value = false
  } catch (error) {
    operationError.value = error instanceof Error ? error : new Error('Unable to submit guess')
  }
}

const handleSubmit = async () => {
  if (!selection.value) return
  await submitGuess({ longitude: selection.value[0], latitude: selection.value[1] })
}

const handleSelect = (coordinates: [number, number]) => {
  selection.value = coordinates
}

const handleExpired = async () => {
  didExpire.value = true
  await submitGuess(null)
}

const handleStartRetry = async () => {
  if (game.value) await startRound(game.value.id, game.value.currentRound + 1)
}

const handleContinue = async () => {
  if (!game.value || !currentRound.value || !currentResult.value || isStartingRound.value) return

  if (currentRound.value.roundNumber === 5) {
    isSummaryVisible.value = true
    return
  }

  try {
    await startRound(game.value.id, currentRound.value.roundNumber + 1)
  } catch {
    // The result remains visible so the same action can retry safely.
  }
}

const handleHome = () => router.push('/')

onMounted(loadGame)
</script>

<template>
  <main class="daily-challenge-page">
    <NavigationHeader />

    <section v-if="isBusy" class="daily-challenge-page__centered" aria-live="polite">
      <LoaderCircle class="daily-challenge-page__loader" :size="32" aria-hidden="true" />
      <p>{{ t('components.pages.Game.GameDailyChallengePage.loading') }}</p>
    </section>

    <section v-else-if="isFatalError" class="daily-challenge-page__centered">
      <h1>{{ t('components.pages.Game.GameDailyChallengePage.unavailable') }}</h1>
      <div class="daily-challenge-page__error-actions">
        <Button @click="loadGame">
          {{ t('components.pages.Game.GameDailyChallengePage.retry') }}
        </Button>
        <Button variant="secondary" @click="handleHome">
          {{ t('components.pages.Game.GameDailyChallengePage.home') }}
        </Button>
      </div>
    </section>

    <section v-else-if="isAlreadyPlayed" class="daily-challenge-page__centered">
      <h1>{{ t('components.pages.Game.GameDailyChallengePage.alreadyPlayedToday') }}</h1>
      <p>{{ t('components.pages.Game.GameDailyChallengePage.comeBackTomorrow') }}</p>
      <Button @click="handleHome">
        {{ t('components.pages.Game.GameDailyChallengePage.home') }}
      </Button>
    </section>

    <DailyChallengeGameSummary
      v-else-if="game && isSummaryVisible"
      :player-name="username"
      :rounds="summaryRounds"
      :total-score="totalScore"
      @home="handleHome"
    />

    <section v-else-if="game && !currentRound" class="daily-challenge-page__centered">
      <h1 v-if="operationError">
        {{ t('components.pages.Game.GameDailyChallengePage.actionError') }}
      </h1>
      <p v-else>{{ t('components.pages.Game.GameDailyChallengePage.loading') }}</p>
      <Button v-if="operationError" :loading="isStartingRound" @click="handleStartRetry">
        {{ t('components.pages.Game.GameDailyChallengePage.retry') }}
      </Button>
    </section>

    <template v-else-if="game && currentRound && currentResult">
      <p v-if="operationError" class="daily-challenge-page__inline-error" role="alert">
        {{ t('components.pages.Game.GameDailyChallengePage.actionError') }}
      </p>
      <SinglePlayerRoundResult
        :distance-km="currentResult.distanceKm"
        :image-id="currentRound.imageId"
        :is-final-round="currentRound.roundNumber === 5"
        :is-starting-next-round="isStartingRound"
        :player-name="username"
        :round-number="currentRound.roundNumber"
        :score="currentResult.score"
        :selection="
          currentResult.guess ? [currentResult.guess.longitude, currentResult.guess.latitude] : null
        "
        :target="[currentResult.target.longitude, currentResult.target.latitude]"
        :total-score="totalScore"
        @continue="handleContinue"
      />
    </template>

    <section v-else-if="game && currentRound" class="daily-challenge-page__play-area">
      <GameStreetView class="daily-challenge-page__street-view" :image-id="currentRound.imageId" />

      <RoundLabel
        class="daily-challenge-page__round-label"
        :current-round="currentRound.roundNumber"
        :total-rounds="5"
      />
      <CountdownTimer
        class="daily-challenge-page__timer"
        :started-at-ms="currentRound.startedAt.getTime()"
        @expired="handleExpired"
      />
      <div v-if="operationError" class="daily-challenge-page__play-error" role="alert">
        <span>{{ t('components.pages.Game.GameDailyChallengePage.actionError') }}</span>
        <Button v-if="didExpire" size="compact" @click="handleExpired">
          {{ t('components.pages.Game.GameDailyChallengePage.retry') }}
        </Button>
      </div>
      <GameMapContainer
        :is-submitted="false"
        :is-submitting="isSubmittingGuess"
        :player-name="username"
        :selection="selection"
        @select="handleSelect"
        @submit="handleSubmit"
      />
    </section>

    <NavigationFooter />
  </main>
</template>

<style scoped>
.daily-challenge-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--on-primary);
}

.daily-challenge-page__centered {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  text-align: center;
}

.daily-challenge-page__centered h1,
.daily-challenge-page__centered p {
  margin: 0;
}

.daily-challenge-page__loader {
  color: var(--muted);
  animation: daily-challenge-page-spin 1s linear infinite;
}

.daily-challenge-page__error-actions {
  display: flex;
  gap: var(--spacing-md);
}

.daily-challenge-page__play-area {
  position: relative;
  flex: 1;
  min-height: 560px;
  overflow: hidden;
}

.daily-challenge-page__street-view {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  min-height: 560px;
  border-radius: 0;
}

.daily-challenge-page__round-label,
.daily-challenge-page__timer,
.daily-challenge-page__play-error {
  position: absolute;
  z-index: 5;
  top: var(--spacing-lg);
}

.daily-challenge-page__timer,
.daily-challenge-page__play-error {
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
  background-color: color-mix(in srgb, var(--surface-card-dark) 92%, transparent);
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.24);
}

.daily-challenge-page__round-label {
  left: var(--spacing-lg);
}

.daily-challenge-page__timer {
  right: var(--spacing-lg);
}

.daily-challenge-page__play-error {
  right: 50%;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--danger);
  transform: translateX(50%);
}

.daily-challenge-page__inline-error {
  width: min(100% - 48px, 1280px);
  margin: var(--spacing-md) auto 0;
  color: var(--danger);
  text-align: center;
}

@keyframes daily-challenge-page-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 720px) {
  .daily-challenge-page__play-area,
  .daily-challenge-page__street-view {
    min-height: 500px;
  }

  .daily-challenge-page__round-label,
  .daily-challenge-page__timer {
    top: var(--spacing-sm);
  }

  .daily-challenge-page__round-label {
    left: var(--spacing-sm);
  }

  .daily-challenge-page__timer {
    right: var(--spacing-sm);
  }

  .daily-challenge-page__play-error {
    top: 72px;
    width: calc(100% - 24px);
    text-align: center;
  }
}
</style>
