<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import GameMap from '@/components/pages/Game/GameMap.vue'
import GameStreetViewContainer from '@/components/pages/Game/GameStreetViewContainer.vue'
import Avatar from '@/components/shared/Avatar.vue'
import Button from '@/components/shared/Button.vue'
import useOnClickOutside from '@/composables/useOnClickOutside'
import type { GameMapMarker, WithFriendsSummaryPlayer, WithFriendsSummaryRound } from '@/types/game'
import {
  calculateCenter,
  calculateZoomLevel,
  countryFlagSrc,
  formatDistanceKm,
  formatNumber,
} from '@/utils/game'

defineOptions({ name: 'WithFriendsGameSummary' })

const props = defineProps<{
  canCreateRoom: boolean
  currentUserId: string
  isCreatingRoom: boolean
  players: Array<WithFriendsSummaryPlayer>
  rounds: Array<WithFriendsSummaryRound>
}>()

const emit = defineEmits<{
  createRoom: []
  exit: []
}>()

const { locale, t } = useI18n()
const roundSelectorRoot = ref<HTMLElement | null>(null)
const isRoundMenuOpen = ref(false)
const rankedPlayers = computed(() =>
  props.players
    .map((player, index) => ({ player, index }))
    .sort(
      (left, right) => right.player.totalScore - left.player.totalScore || left.index - right.index,
    )
    .map(({ player }) => player),
)
const selectedRoundNumber = ref(props.rounds[0]?.roundNumber ?? 1)
const selectedUserId = ref(props.currentUserId)
const selectedRound = computed(
  () =>
    props.rounds.find(({ roundNumber }) => roundNumber === selectedRoundNumber.value) ??
    props.rounds[0],
)
const selectedPlayer = computed(
  () =>
    rankedPlayers.value.find(({ userId }) => userId === selectedUserId.value) ??
    rankedPlayers.value[0],
)
const selectedResult = computed(() =>
  selectedRound.value?.results.find(({ userId }) => userId === selectedPlayer.value?.userId),
)
const center = computed<[number, number]>(() => {
  if (!selectedRound.value) return [0, 20]
  return selectedResult.value?.guess
    ? calculateCenter(selectedResult.value.guess, selectedRound.value.target)
    : selectedRound.value.target
})
const zoom = computed(() => calculateZoomLevel(selectedResult.value?.distanceKm ?? 20_000))
const markers = computed<Array<GameMapMarker>>(() => {
  if (!selectedRound.value) return []
  const orderedPlayers = selectedPlayer.value
    ? [
        selectedPlayer.value,
        ...rankedPlayers.value.filter(({ userId }) => userId !== selectedPlayer.value?.userId),
      ]
    : rankedPlayers.value
  const playerMarkers: Array<GameMapMarker> = orderedPlayers.flatMap((player) => {
    const result = selectedRound.value?.results.find(({ userId }) => userId === player.userId)
    return result?.guess
      ? [
          {
            coordinates: result.guess,
            label: player.displayName,
            markerType: 'player',
          },
        ]
      : []
  })
  return [
    ...playerMarkers,
    {
      coordinates: selectedRound.value.target,
      label: t('components.pages.Game.WithFriendsGameSummary.target'),
      markerType: 'target',
    },
  ]
})
const formatDistance = (distanceKm: number | null | undefined) =>
  formatDistanceKm(distanceKm ?? null, locale.value) ??
  t('components.pages.Game.WithFriendsGameSummary.noGuess')
const selectRound = (roundNumber: number) => {
  selectedRoundNumber.value = roundNumber
  isRoundMenuOpen.value = false
}

useOnClickOutside({
  root: roundSelectorRoot,
  close: () => {
    isRoundMenuOpen.value = false
  },
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

watch(
  () => props.rounds,
  (rounds) => {
    if (!rounds.some(({ roundNumber }) => roundNumber === selectedRoundNumber.value)) {
      selectedRoundNumber.value = rounds[0]?.roundNumber ?? 1
    }
  },
  { deep: true },
)
</script>

<template>
  <section class="with-friends-game-summary">
    <div class="with-friends-game-summary__visual">
      <GameMap
        v-if="selectedRound"
        class="with-friends-game-summary__map"
        :center="center"
        :is-selectable="false"
        :markers="markers"
        :zoom="zoom"
      />
      <GameStreetViewContainer v-if="selectedRound" :image-id="selectedRound.imageId" />
    </div>

    <aside class="with-friends-game-summary__panel">
      <header class="with-friends-game-summary__header">
        <h1>{{ t('components.pages.Game.WithFriendsGameSummary.title') }}</h1>
        <div ref="roundSelectorRoot" class="with-friends-game-summary__round-selector">
          <button
            class="with-friends-game-summary__round-trigger"
            type="button"
            aria-haspopup="menu"
            :aria-expanded="isRoundMenuOpen"
            :aria-label="t('components.pages.Game.WithFriendsGameSummary.roundHistory')"
            @click="isRoundMenuOpen = !isRoundMenuOpen"
          >
            {{
              t('components.pages.Game.WithFriendsGameSummary.round', {
                round: selectedRoundNumber,
              })
            }}
            <ChevronDown aria-hidden="true" :size="16" />
          </button>
          <div
            v-if="isRoundMenuOpen"
            class="with-friends-game-summary__round-menu"
            role="menu"
            :aria-label="t('components.pages.Game.WithFriendsGameSummary.roundHistory')"
          >
            <button
              v-for="round in props.rounds"
              :key="round.roundNumber"
              class="with-friends-game-summary__round-item"
              :class="{
                'with-friends-game-summary__round-item--selected':
                  round.roundNumber === selectedRoundNumber,
              }"
              type="button"
              role="menuitemradio"
              :aria-checked="round.roundNumber === selectedRoundNumber"
              @click="selectRound(round.roundNumber)"
            >
              {{
                t('components.pages.Game.WithFriendsGameSummary.round', {
                  round: round.roundNumber,
                })
              }}
            </button>
          </div>
        </div>
      </header>

      <div class="with-friends-game-summary__table">
        <div class="with-friends-game-summary__labels" aria-hidden="true">
          <span>{{ t('components.pages.Game.WithFriendsGameSummary.distance') }}</span>
          <span>{{ t('components.pages.Game.WithFriendsGameSummary.roundScore') }}</span>
          <span>{{ t('components.pages.Game.WithFriendsGameSummary.totalScore') }}</span>
        </div>

        <ol
          class="with-friends-game-summary__leaderboard"
          :aria-label="t('components.pages.Game.WithFriendsGameSummary.title')"
        >
          <li v-for="(player, index) in rankedPlayers" :key="player.userId">
            <button
              class="with-friends-game-summary__player"
              :class="{
                'with-friends-game-summary__player--current': player.userId === props.currentUserId,
                'with-friends-game-summary__player--selected':
                  player.userId === selectedPlayer?.userId,
              }"
              type="button"
              :aria-pressed="player.userId === selectedPlayer?.userId"
              @click="selectedUserId = player.userId"
            >
              <span class="with-friends-game-summary__rank">{{ index + 1 }}</span>
              <span class="with-friends-game-summary__identity">
                <Avatar :name="player.displayName" size="sm" />
                <span class="with-friends-game-summary__name">
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
              <span class="with-friends-game-summary__distance">
                {{
                  formatDistance(
                    selectedRound?.results.find(({ userId }) => userId === player.userId)
                      ?.distanceKm,
                  )
                }}
              </span>
              <strong>
                {{
                  formatNumber(
                    selectedRound?.results.find(({ userId }) => userId === player.userId)?.score ??
                      0,
                    locale,
                  )
                }}
              </strong>
              <strong>{{ formatNumber(player.totalScore, locale) }}</strong>
            </button>
          </li>
        </ol>
      </div>

      <div class="with-friends-game-summary__actions">
        <Button
          v-if="props.canCreateRoom"
          :loading="props.isCreatingRoom"
          @click="emit('createRoom')"
        >
          {{ t('components.pages.Game.WithFriendsGameSummary.createRoom') }}
        </Button>
        <Button variant="secondary" @click="emit('exit')">
          {{ t('components.pages.Game.WithFriendsGameSummary.exit') }}
        </Button>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.with-friends-game-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(400px, 500px);
  align-items: start;
  gap: var(--spacing-xl);
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.with-friends-game-summary__map {
  height: min(680px, calc(100vh - 180px));
  min-height: 480px;
}

.with-friends-game-summary__visual,
.with-friends-game-summary__panel {
  min-width: 0;
}

.with-friends-game-summary__panel {
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
}

.with-friends-game-summary__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.with-friends-game-summary__header h1 {
  min-width: 0;
  margin: 0;
  color: var(--on-dark);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
}

.with-friends-game-summary__round-selector {
  position: relative;
  flex: 0 0 auto;
}

.with-friends-game-summary__round-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-height: 36px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-md);
  background: transparent;
  color: var(--body);
  font: inherit;
  cursor: pointer;
}

.with-friends-game-summary__round-trigger:focus-visible,
.with-friends-game-summary__round-item:focus-visible,
.with-friends-game-summary__player:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.with-friends-game-summary__round-menu {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
  min-width: 144px;
  padding: var(--spacing-xs);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-sm);
  background-color: var(--surface-card-dark);
  box-shadow: 0 12px 28px color-mix(in srgb, black 32%, transparent);
}

.with-friends-game-summary__round-item {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 0;
  border-radius: var(--radius-token-md);
  background: transparent;
  color: var(--body);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.with-friends-game-summary__round-item:hover {
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

.with-friends-game-summary__round-item--selected {
  color: var(--primary);
}

.with-friends-game-summary__labels,
.with-friends-game-summary__player {
  display: grid;
  grid-template-columns: 28px minmax(120px, 1fr) 86px 72px 72px;
  align-items: center;
  gap: var(--spacing-xs);
}

.with-friends-game-summary__labels {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0 var(--spacing-sm) var(--spacing-xs);
  background-color: var(--surface-card-dark);
  color: var(--muted-strong);
  font-size: var(--font-size-caption);
}

.with-friends-game-summary__labels span:first-child {
  grid-column: 3;
}

.with-friends-game-summary__labels span {
  text-align: right;
}

.with-friends-game-summary__table {
  max-height: 400px;
  overflow: auto;
}

.with-friends-game-summary__leaderboard {
  margin: 0;
  padding: 0;
  list-style: none;
}

.with-friends-game-summary__leaderboard li + li {
  margin-top: var(--spacing-xxs);
}

.with-friends-game-summary__player {
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

.with-friends-game-summary__player:hover,
.with-friends-game-summary__player--selected {
  background-color: var(--surface-elevated-dark);
}

.with-friends-game-summary__player--current {
  border-color: var(--primary);
}

.with-friends-game-summary__rank,
.with-friends-game-summary__player strong {
  font-family: var(--font-number);
}

.with-friends-game-summary__rank {
  color: var(--muted-strong);
  text-align: center;
}

.with-friends-game-summary__identity {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}

.with-friends-game-summary__name {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}

.with-friends-game-summary__name > span {
  overflow: hidden;
  color: var(--on-dark);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.with-friends-game-summary__name img {
  flex: 0 0 auto;
}

.with-friends-game-summary__distance {
  color: var(--muted-strong);
  font-size: var(--font-size-caption);
  text-align: right;
  white-space: nowrap;
}

.with-friends-game-summary__player strong {
  color: var(--on-dark);
  text-align: right;
}

.with-friends-game-summary__actions {
  display: grid;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

@media (max-width: 960px) {
  .with-friends-game-summary {
    grid-template-columns: 1fr;
    padding: var(--spacing-lg);
  }

  .with-friends-game-summary__map {
    height: 420px;
    min-height: 0;
  }
}

@media (max-width: 560px) {
  .with-friends-game-summary {
    padding: var(--spacing-md);
  }

  .with-friends-game-summary__labels,
  .with-friends-game-summary__player {
    grid-template-columns: 28px 240px 86px 72px 72px;
    min-width: 556px;
  }

  .with-friends-game-summary__name > span {
    overflow: visible;
    overflow-wrap: anywhere;
    text-overflow: clip;
    white-space: normal;
  }

  .with-friends-game-summary__panel {
    padding: var(--spacing-md);
  }

  .with-friends-game-summary__header {
    gap: var(--spacing-xs);
  }
}
</style>
