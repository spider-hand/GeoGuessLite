<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import GameMap from '@/components/pages/Game/GameMap.vue'
import GameStreetViewContainer from '@/components/pages/Game/GameStreetViewContainer.vue'
import Button from '@/components/shared/Button.vue'
import type { GameMapMarker } from '@/types/game'
import { calculateCenter, calculateZoomLevel, formatDistanceKm, formatNumber } from '@/utils/game'

defineOptions({ name: 'SinglePlayerRoundResult' })

const props = defineProps<{
  distanceKm: number | null
  imageId: string
  isFinalRound: boolean
  isStartingNextRound: boolean
  playerName: string
  roundNumber: number
  score: number
  selection: [number, number] | null
  target: [number, number]
  totalScore: number
}>()

const emit = defineEmits<{
  continue: []
}>()

const { locale, t } = useI18n()
const center = computed(() =>
  props.selection ? calculateCenter(props.selection, props.target) : props.target,
)
const zoom = computed(() => calculateZoomLevel(props.distanceKm ?? 20_000))
const markers = computed<Array<GameMapMarker>>(() => {
  const mapMarkers: Array<GameMapMarker> = [
    {
      coordinates: props.target,
      label: t('components.pages.Game.SinglePlayerRoundResult.target'),
      markerType: 'target',
    },
  ]
  if (props.selection) {
    mapMarkers.unshift({
      coordinates: props.selection,
      label: props.playerName,
      markerType: 'player',
    })
  }
  return mapMarkers
})
const distance = computed(
  () =>
    formatDistanceKm(props.distanceKm, locale.value) ??
    t('components.pages.Game.SinglePlayerRoundResult.noGuess'),
)
</script>

<template>
  <section class="single-player-round-result">
    <GameMap
      class="single-player-round-result__map"
      :center="center"
      :is-selectable="false"
      :markers="markers"
      :zoom="zoom"
    />

    <GameStreetViewContainer :image-id="props.imageId" />

    <aside class="single-player-round-result__card">
      <p class="single-player-round-result__eyebrow">
        {{ t('components.pages.Game.SinglePlayerRoundResult.round', { round: props.roundNumber }) }}
      </p>
      <h1 class="single-player-round-result__score">
        {{ formatNumber(props.score, locale) }}
      </h1>
      <p class="single-player-round-result__score-label">
        {{ t('components.pages.Game.SinglePlayerRoundResult.points') }}
      </p>

      <dl class="single-player-round-result__stats">
        <div>
          <dt>{{ t('components.pages.Game.SinglePlayerRoundResult.distance') }}</dt>
          <dd>{{ distance }}</dd>
        </div>
        <div>
          <dt>{{ t('components.pages.Game.SinglePlayerRoundResult.totalScore') }}</dt>
          <dd>{{ formatNumber(props.totalScore, locale) }}</dd>
        </div>
      </dl>

      <Button :loading="props.isStartingNextRound" @click="emit('continue')">
        {{
          props.isFinalRound
            ? t('components.pages.Game.SinglePlayerRoundResult.viewSummary')
            : t('components.pages.Game.SinglePlayerRoundResult.nextRound')
        }}
      </Button>
    </aside>
  </section>
</template>

<style scoped>
.single-player-round-result {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  align-items: start;
  gap: var(--spacing-xl);
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.single-player-round-result__map {
  height: min(620px, calc(100vh - 220px));
  min-height: 420px;
}

.single-player-round-result__card {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
  color: var(--on-dark);
}

.single-player-round-result__eyebrow,
.single-player-round-result__score-label {
  margin: 0;
  color: var(--muted-strong);
  font-size: var(--font-size-body-md);
}

.single-player-round-result__score {
  margin: var(--spacing-sm) 0 0;
  color: var(--primary);
  font-family: var(--font-number);
  font-size: var(--font-size-number-display);
  line-height: var(--line-height-tight);
}

.single-player-round-result__stats {
  display: grid;
  gap: var(--spacing-md);
  margin: var(--spacing-xl) 0;
}

.single-player-round-result__stats div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--hairline);
}

.single-player-round-result__stats dt {
  color: var(--muted-strong);
}

.single-player-round-result__stats dd {
  margin: 0;
  font-family: var(--font-number);
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 960px) {
  .single-player-round-result {
    grid-template-columns: 1fr;
    padding: var(--spacing-lg);
  }

  .single-player-round-result__map {
    height: 420px;
    min-height: 0;
  }
}
</style>
