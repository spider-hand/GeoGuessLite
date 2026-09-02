<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import GameMap from '@/components/pages/Game/GameMap.vue'
import GameStreetViewContainer from '@/components/pages/Game/GameStreetViewContainer.vue'
import WithFriendsLeaderboard from '@/components/pages/Game/WithFriendsLeaderboard.vue'
import Button from '@/components/shared/Button.vue'
import { ROUNDS } from '@/constants/game'
import type { GameMapMarker, WithFriendsRoundResultPlayer } from '@/types/game'
import { calculateCenter, calculateZoomLevel } from '@/utils/game'

defineOptions({ name: 'WithFriendsRoundResult' })

const props = defineProps<{
  currentUserId: string
  imageId: string
  players: Array<WithFriendsRoundResultPlayer>
  roundNumber: number
  target: [number, number]
}>()

const emit = defineEmits<{
  viewSummary: []
}>()

const { t } = useI18n()
const rankedPlayers = computed(() =>
  props.players
    .map((player, index) => ({ player, index }))
    .sort(
      (left, right) =>
        right.player.totalScore - left.player.totalScore ||
        right.player.roundScore - left.player.roundScore ||
        left.index - right.index,
    )
    .map(({ player }) => player),
)
const selectedUserId = ref(props.currentUserId)
const selectedPlayer = computed(
  () =>
    rankedPlayers.value.find(({ userId }) => userId === selectedUserId.value) ??
    rankedPlayers.value[0],
)
const center = computed<[number, number]>(() =>
  selectedPlayer.value?.guess
    ? calculateCenter(selectedPlayer.value.guess, props.target)
    : props.target,
)
const zoom = computed(() => calculateZoomLevel(selectedPlayer.value?.distanceKm ?? 20_000))
const markers = computed<Array<GameMapMarker>>(() => {
  const orderedPlayers = selectedPlayer.value
    ? [
        selectedPlayer.value,
        ...rankedPlayers.value.filter(({ userId }) => userId !== selectedPlayer.value?.userId),
      ]
    : rankedPlayers.value
  const playerMarkers: Array<GameMapMarker> = orderedPlayers.flatMap((player) =>
    player.guess
      ? [
          {
            coordinates: player.guess,
            label: player.displayName,
            markerType: 'player',
          },
        ]
      : [],
  )
  return [
    ...playerMarkers,
    {
      coordinates: props.target,
      label: t('components.pages.Game.WithFriendsRoundResult.target'),
      markerType: 'target',
    },
  ]
})
watch(
  [() => props.currentUserId, rankedPlayers],
  ([currentUserId, players]) => {
    if (!players.some(({ userId }) => userId === selectedUserId.value)) {
      selectedUserId.value =
        players.find(({ userId }) => userId === currentUserId)?.userId ?? players[0]?.userId ?? ''
    }
  },
  { immediate: true },
)
</script>

<template>
  <section class="with-friends-round-result">
    <div class="with-friends-round-result__visual">
      <GameMap
        class="with-friends-round-result__map"
        :center="center"
        :is-selectable="false"
        :markers="markers"
        :zoom="zoom"
      />
      <GameStreetViewContainer :image-id="props.imageId" />
    </div>

    <aside class="with-friends-round-result__panel">
      <header class="with-friends-round-result__header">
        <h1>
          {{
            t('components.pages.Game.WithFriendsRoundResult.title', {
              round: props.roundNumber,
            })
          }}
        </h1>
        <p v-if="props.roundNumber !== ROUNDS">
          {{ t('components.pages.Game.WithFriendsRoundResult.nextRoundStarting') }}
        </p>
      </header>

      <WithFriendsLeaderboard
        :current-user-id="props.currentUserId"
        :players="rankedPlayers"
        :selected-user-id="selectedPlayer?.userId ?? ''"
        @select="selectedUserId = $event"
      />
      <Button
        v-if="props.roundNumber === ROUNDS"
        class="with-friends-round-result__summary-button"
        @click="emit('viewSummary')"
      >
        {{ t('components.pages.Game.WithFriendsRoundResult.viewSummary') }}
      </Button>
    </aside>
  </section>
</template>

<style scoped>
.with-friends-round-result {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(400px, 500px);
  align-items: start;
  gap: var(--spacing-xl);
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.with-friends-round-result__map {
  height: min(680px, calc(100vh - 180px));
  min-height: 480px;
}

.with-friends-round-result__visual,
.with-friends-round-result__panel {
  min-width: 0;
}

.with-friends-round-result__panel {
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
}

.with-friends-round-result__header {
  margin-bottom: var(--spacing-lg);
}

.with-friends-round-result__header h1 {
  margin: 0;
  color: var(--on-dark);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
}

.with-friends-round-result__header p {
  margin: var(--spacing-xs) 0 0;
  color: var(--muted-strong);
  font-size: var(--font-size-body-sm);
}

.with-friends-round-result__summary-button {
  width: 100%;
  margin-top: var(--spacing-lg);
}

@media (max-width: 960px) {
  .with-friends-round-result {
    grid-template-columns: 1fr;
    padding: var(--spacing-lg);
  }

  .with-friends-round-result__map {
    height: 420px;
    min-height: 0;
  }
}

@media (max-width: 560px) {
  .with-friends-round-result {
    padding: var(--spacing-md);
  }

  .with-friends-round-result__panel {
    padding: var(--spacing-md);
  }
}
</style>
