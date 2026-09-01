<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import Avatar from '@/components/shared/Avatar.vue'
import type { WithFriendsLeaderboardPlayer } from '@/types/game'
import { countryFlagSrc, formatDistanceKm, formatNumber } from '@/utils/game'

defineOptions({ name: 'WithFriendsLeaderboard' })

const props = defineProps<{
  currentUserId: string
  players: Array<WithFriendsLeaderboardPlayer>
  selectedUserId: string
}>()

const emit = defineEmits<{
  select: [userId: string]
}>()

const { locale, t } = useI18n()
const formatDistance = (distanceKm: number | null) =>
  formatDistanceKm(distanceKm, locale.value) ??
  t('components.pages.Game.WithFriendsLeaderboard.noGuess')
</script>

<template>
  <div class="with-friends-leaderboard">
    <div class="with-friends-leaderboard__labels" aria-hidden="true">
      <span>{{ t('components.pages.Game.WithFriendsLeaderboard.distance') }}</span>
      <span>{{ t('components.pages.Game.WithFriendsLeaderboard.roundScore') }}</span>
      <span>{{ t('components.pages.Game.WithFriendsLeaderboard.totalScore') }}</span>
    </div>

    <ol
      class="with-friends-leaderboard__players"
      :aria-label="t('components.pages.Game.WithFriendsLeaderboard.leaderboard')"
    >
      <li v-for="(player, index) in props.players" :key="player.userId">
        <button
          class="with-friends-leaderboard__player"
          :class="{
            'with-friends-leaderboard__player--current': player.userId === props.currentUserId,
            'with-friends-leaderboard__player--selected': player.userId === props.selectedUserId,
          }"
          type="button"
          :aria-pressed="player.userId === props.selectedUserId"
          @click="emit('select', player.userId)"
        >
          <span class="with-friends-leaderboard__rank">{{ index + 1 }}</span>
          <span class="with-friends-leaderboard__identity">
            <Avatar :name="player.displayName" size="sm" />
            <span class="with-friends-leaderboard__name">
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
          <span class="with-friends-leaderboard__distance">
            {{ formatDistance(player.distanceKm) }}
          </span>
          <strong>{{ formatNumber(player.roundScore, locale) }}</strong>
          <strong>{{ formatNumber(player.totalScore, locale) }}</strong>
        </button>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.with-friends-leaderboard {
  max-height: 400px;
  overflow: auto;
}

.with-friends-leaderboard__labels,
.with-friends-leaderboard__player {
  display: grid;
  grid-template-columns: 28px minmax(120px, 1fr) 86px 72px 72px;
  align-items: center;
  gap: var(--spacing-xs);
}

.with-friends-leaderboard__labels {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0 var(--spacing-sm) var(--spacing-xs);
  background-color: var(--surface-card-dark);
  color: var(--muted-strong);
  font-size: var(--font-size-caption);
}

.with-friends-leaderboard__labels span:first-child {
  grid-column: 3;
}

.with-friends-leaderboard__labels span {
  text-align: right;
}

.with-friends-leaderboard__players {
  margin: 0;
  padding: 0;
  list-style: none;
}

.with-friends-leaderboard__players li + li {
  margin-top: var(--spacing-xxs);
}

.with-friends-leaderboard__player {
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

.with-friends-leaderboard__player:hover,
.with-friends-leaderboard__player--selected {
  background-color: var(--surface-elevated-dark);
}

.with-friends-leaderboard__player--current {
  border-color: var(--primary);
}

.with-friends-leaderboard__player:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
}

.with-friends-leaderboard__rank,
.with-friends-leaderboard__player strong {
  font-family: var(--font-number);
}

.with-friends-leaderboard__rank {
  color: var(--muted-strong);
  text-align: center;
}

.with-friends-leaderboard__identity {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}

.with-friends-leaderboard__name {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}

.with-friends-leaderboard__name > span {
  overflow: hidden;
  color: var(--on-dark);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.with-friends-leaderboard__name img {
  flex: 0 0 auto;
}

.with-friends-leaderboard__distance {
  color: var(--muted-strong);
  font-size: var(--font-size-caption);
  text-align: right;
  white-space: nowrap;
}

.with-friends-leaderboard__player strong {
  color: var(--on-dark);
  text-align: right;
}

@media (max-width: 560px) {
  .with-friends-leaderboard__labels,
  .with-friends-leaderboard__player {
    grid-template-columns: 28px 240px 86px 72px 72px;
    min-width: 556px;
  }

  .with-friends-leaderboard__name > span {
    overflow: visible;
    overflow-wrap: anywhere;
    text-overflow: clip;
    white-space: normal;
  }
}
</style>
