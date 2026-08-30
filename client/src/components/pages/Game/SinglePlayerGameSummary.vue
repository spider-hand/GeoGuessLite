<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import GameMap from '@/components/pages/Game/GameMap.vue'
import GameStreetViewContainer from '@/components/pages/Game/GameStreetViewContainer.vue'
import Button from '@/components/shared/Button.vue'
import type { GameMapMarker, SinglePlayerSummaryRound } from '@/types/game'
import { calculateCenter, calculateZoomLevel, formatDistanceKm, formatNumber } from '@/utils/game'

defineOptions({ name: 'SinglePlayerGameSummary' })

const props = defineProps<{
  isStartingNewGame: boolean
  playerName: string
  rounds: Array<SinglePlayerSummaryRound>
  totalScore: number
}>()

const emit = defineEmits<{
  home: []
  playAgain: []
}>()

const { locale, t } = useI18n()
const selectedRoundNumber = ref(props.rounds[0]?.roundNumber ?? 1)
const selectedRound = computed(
  () =>
    props.rounds.find(({ roundNumber }) => roundNumber === selectedRoundNumber.value) ??
    props.rounds[0],
)
const center = computed<[number, number]>(() => {
  const round = selectedRound.value
  if (!round) return [0, 20]
  return round.selection ? calculateCenter(round.selection, round.target) : round.target
})
const zoom = computed(() => calculateZoomLevel(selectedRound.value?.distanceKm ?? 20_000))
const markers = computed<Array<GameMapMarker>>(() => {
  const round = selectedRound.value
  if (!round) return []

  const roundMarkers: Array<GameMapMarker> = [
    {
      coordinates: round.target,
      label: t('components.pages.Game.SinglePlayerGameSummary.target'),
      markerType: 'target',
    },
  ]
  if (round.selection) {
    roundMarkers.unshift({
      coordinates: round.selection,
      label: props.playerName,
      markerType: 'player',
    })
  }
  return roundMarkers
})
const formatDistance = (distanceKm: number | null) =>
  formatDistanceKm(distanceKm, locale.value) ??
  t('components.pages.Game.SinglePlayerGameSummary.noGuess')
</script>

<template>
  <section class="single-player-game-summary">
    <GameMap
      v-if="selectedRound"
      class="single-player-game-summary__map"
      :center="center"
      :is-selectable="false"
      :markers="markers"
      :zoom="zoom"
    />

    <GameStreetViewContainer v-if="selectedRound" :image-id="selectedRound.imageId" />

    <aside class="single-player-game-summary__panel">
      <header class="single-player-game-summary__header">
        <p>{{ t('components.pages.Game.SinglePlayerGameSummary.title') }}</p>
        <h1>{{ formatNumber(props.totalScore, locale) }}</h1>
        <span>{{ t('components.pages.Game.SinglePlayerGameSummary.totalScore') }}</span>
      </header>

      <ol
        class="single-player-game-summary__rounds"
        :aria-label="t('components.pages.Game.SinglePlayerGameSummary.roundHistory')"
      >
        <li v-for="round in props.rounds" :key="round.roundNumber">
          <button
            class="single-player-game-summary__round"
            :class="{
              'single-player-game-summary__round--selected':
                round.roundNumber === selectedRound?.roundNumber,
            }"
            type="button"
            :aria-pressed="round.roundNumber === selectedRound?.roundNumber"
            @click="selectedRoundNumber = round.roundNumber"
          >
            <span class="single-player-game-summary__round-label">
              {{
                t('components.pages.Game.SinglePlayerGameSummary.round', {
                  round: round.roundNumber,
                })
              }}
            </span>
            <span class="single-player-game-summary__round-result">
              <strong>{{ formatNumber(round.score, locale) }}</strong>
              <span>{{ formatDistance(round.distanceKm) }}</span>
            </span>
          </button>
        </li>
      </ol>

      <div class="single-player-game-summary__actions">
        <Button :loading="props.isStartingNewGame" @click="emit('playAgain')">
          {{ t('components.pages.Game.SinglePlayerGameSummary.playAgain') }}
        </Button>
        <Button variant="secondary" @click="emit('home')">
          {{ t('components.pages.Game.SinglePlayerGameSummary.home') }}
        </Button>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.single-player-game-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
  align-items: start;
  gap: var(--spacing-xl);
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.single-player-game-summary__map {
  height: min(620px, calc(100vh - 220px));
  min-height: 480px;
}

.single-player-game-summary__panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
  color: var(--on-dark);
}

.single-player-game-summary__header p,
.single-player-game-summary__header span {
  margin: 0;
  color: var(--muted-strong);
  font-size: var(--font-size-body-md);
}

.single-player-game-summary__header h1 {
  margin: var(--spacing-sm) 0 0;
  color: var(--primary);
  font-family: var(--font-number);
  font-size: var(--font-size-number-display);
  line-height: var(--line-height-tight);
}

.single-player-game-summary__rounds {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.single-player-game-summary__round {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm);
  border: 0;
  border-bottom: 1px solid var(--hairline);
  background: transparent;
  color: var(--body);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.single-player-game-summary__rounds li:first-child .single-player-game-summary__round {
  border-top: 1px solid var(--hairline);
}

.single-player-game-summary__round:hover,
.single-player-game-summary__round--selected {
  background-color: var(--surface-elevated-dark);
}

.single-player-game-summary__round:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: -2px;
}

.single-player-game-summary__round-label {
  font-weight: var(--font-weight-semibold);
}

.single-player-game-summary__round-result {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: var(--muted-strong);
  text-align: right;
}

.single-player-game-summary__round-result strong {
  color: var(--on-dark);
  font-family: var(--font-number);
}

.single-player-game-summary__actions {
  display: grid;
  gap: var(--spacing-sm);
}

@media (max-width: 960px) {
  .single-player-game-summary {
    grid-template-columns: 1fr;
    padding: var(--spacing-lg);
  }

  .single-player-game-summary__map {
    height: 420px;
    min-height: 0;
  }
}
</style>
