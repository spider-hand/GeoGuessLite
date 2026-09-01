<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import GameMap from '@/components/pages/Game/GameMap.vue'
import GameStreetViewContainer from '@/components/pages/Game/GameStreetViewContainer.vue'
import Avatar from '@/components/shared/Avatar.vue'
import { ROUNDS } from '@/constants/game'
import type { GameMapMarker, WithFriendsRoundResultPlayer } from '@/types/game'
import {
  calculateCenter,
  calculateZoomLevel,
  countryFlagSrc,
  formatDistanceKm,
  formatNumber,
} from '@/utils/game'

defineOptions({ name: 'WithFriendsRoundResult' })

const props = defineProps<{
  currentUserId: string
  imageId: string
  players: Array<WithFriendsRoundResultPlayer>
  roundNumber: number
  target: [number, number]
}>()

const { locale, t } = useI18n()
const description = computed(() =>
  props.roundNumber === ROUNDS
    ? t('components.pages.Game.WithFriendsRoundResult.summaryStarting')
    : t('components.pages.Game.WithFriendsRoundResult.nextRoundStarting'),
)
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
const formatDistance = (distanceKm: number | null) =>
  formatDistanceKm(distanceKm, locale.value) ??
  t('components.pages.Game.WithFriendsRoundResult.noGuess')

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
        <p>{{ description }}</p>
      </header>

      <div class="with-friends-round-result__table">
        <div class="with-friends-round-result__labels" aria-hidden="true">
          <span>{{ t('components.pages.Game.WithFriendsRoundResult.distance') }}</span>
          <span>{{ t('components.pages.Game.WithFriendsRoundResult.roundScore') }}</span>
          <span>{{ t('components.pages.Game.WithFriendsRoundResult.totalScore') }}</span>
        </div>

        <ol
          class="with-friends-round-result__leaderboard"
          :aria-label="t('components.pages.Game.WithFriendsRoundResult.leaderboard')"
        >
          <li v-for="(player, index) in rankedPlayers" :key="player.userId">
            <button
              class="with-friends-round-result__player"
              :class="{
                'with-friends-round-result__player--current': player.userId === props.currentUserId,
                'with-friends-round-result__player--selected':
                  player.userId === selectedPlayer?.userId,
              }"
              type="button"
              :aria-pressed="player.userId === selectedPlayer?.userId"
              @click="selectedUserId = player.userId"
            >
              <span class="with-friends-round-result__rank">{{ index + 1 }}</span>
              <span class="with-friends-round-result__identity">
                <Avatar :name="player.displayName" size="sm" />
                <span class="with-friends-round-result__name">
                  <span>{{ player.displayName }}</span>
                  <img
                    v-if="player.country"
                    :src="countryFlagSrc(player.country)"
                    :alt="player.country.toUpperCase()"
                    width="24"
                    height="18"
                  />
                </span>
              </span>
              <span class="with-friends-round-result__distance">
                {{ formatDistance(player.distanceKm) }}
              </span>
              <strong>{{ formatNumber(player.roundScore, locale) }}</strong>
              <strong>{{ formatNumber(player.totalScore, locale) }}</strong>
            </button>
          </li>
        </ol>
      </div>
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

.with-friends-round-result__labels,
.with-friends-round-result__player {
  display: grid;
  grid-template-columns: 28px minmax(120px, 1fr) 86px 72px 72px;
  align-items: center;
  gap: var(--spacing-xs);
}

.with-friends-round-result__labels {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0 var(--spacing-sm) var(--spacing-xs);
  background-color: var(--surface-card-dark);
  color: var(--muted-strong);
  font-size: var(--font-size-caption);
}

.with-friends-round-result__labels span:first-child {
  grid-column: 3;
}

.with-friends-round-result__labels span {
  text-align: right;
}

.with-friends-round-result__table {
  max-height: 520px;
  overflow: auto;
}

.with-friends-round-result__leaderboard {
  margin: 0;
  padding: 0;
  list-style: none;
}

.with-friends-round-result__leaderboard li + li {
  margin-top: var(--spacing-xxs);
}

.with-friends-round-result__player {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid transparent;
  border-radius: var(--radius-token-lg);
  background: transparent;
  color: var(--body);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.with-friends-round-result__player:hover,
.with-friends-round-result__player--selected {
  background-color: var(--surface-elevated-dark);
}

.with-friends-round-result__player--current {
  border-color: var(--primary);
}

.with-friends-round-result__player:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
}

.with-friends-round-result__rank,
.with-friends-round-result__player strong {
  font-family: var(--font-number);
}

.with-friends-round-result__rank {
  color: var(--muted-strong);
  text-align: center;
}

.with-friends-round-result__identity {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}

.with-friends-round-result__name {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}

.with-friends-round-result__name > span {
  overflow: hidden;
  color: var(--on-dark);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.with-friends-round-result__name img {
  flex: 0 0 auto;
}

.with-friends-round-result__distance {
  color: var(--muted-strong);
  font-size: var(--font-size-caption);
  text-align: right;
  white-space: nowrap;
}

.with-friends-round-result__player strong {
  color: var(--on-dark);
  text-align: right;
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

  .with-friends-round-result__labels,
  .with-friends-round-result__player {
    grid-template-columns: 28px 240px 86px 72px 72px;
    min-width: 556px;
  }

  .with-friends-round-result__name > span {
    overflow: visible;
    overflow-wrap: anywhere;
    text-overflow: clip;
    white-space: normal;
  }

  .with-friends-round-result__panel {
    padding: var(--spacing-md);
  }
}
</style>
