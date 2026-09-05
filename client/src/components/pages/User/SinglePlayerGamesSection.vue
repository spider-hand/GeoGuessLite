<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import useAuth from '@/composables/useAuth'
import useSinglePlayerGamesQuery from '@/composables/useSinglePlayerGamesQuery'
import { formatMediumDate } from '@/utils/date'
import { formatDistanceKm, formatNumber } from '@/utils/game'

defineOptions({ name: 'UserSinglePlayerGamesSection' })

const { locale, t } = useI18n()
const { isLoadingUser, user } = useAuth()
const { games, isError, isLoading } = useSinglePlayerGamesQuery()
const formatDistance = (distance: number | null) =>
  formatDistanceKm(distance, locale.value) ?? t('components.pages.User.distanceUnavailable')
</script>

<template>
  <section class="single-player-games-section">
    <p v-if="isLoading || isLoadingUser">{{ t('components.pages.User.loading') }}</p>
    <p v-else-if="isError || !user">{{ t('components.pages.User.loadError') }}</p>
    <template v-else>
      <div class="single-player-games-section__stats">
        <article>
          <span>{{ t('components.pages.User.SinglePlayerGamesSection.gamesPlayed') }}</span>
          <strong>{{ formatNumber(user.gamesPlayed, locale) }}</strong>
        </article>
        <article>
          <span>{{ t('components.pages.User.SinglePlayerGamesSection.bestScore') }}</span>
          <strong>{{ formatNumber(user.bestScore, locale) }}</strong>
        </article>
        <article>
          <span>{{ t('components.pages.User.SinglePlayerGamesSection.averageScore') }}</span>
          <strong>{{ formatNumber(user.averageScore, locale) }}</strong>
        </article>
      </div>
      <article class="single-player-games-section__history data-table-card">
        <h2>{{ t('components.pages.User.recentGames') }}</h2>
        <p v-if="!games?.length">{{ t('components.pages.User.noRecentGames') }}</p>
        <ul v-else>
          <li v-for="game in games" :key="game.id">
            <time :datetime="game.completedAt.toISOString()">
              {{ formatMediumDate(game.completedAt, locale) }}
            </time>
            <span class="single-player-games-section__result">
              <strong>{{ formatNumber(game.totalScore, locale) }}</strong>
              <span>{{ formatDistance(game.totalDistanceKm) }}</span>
            </span>
            <RouterLink :to="{ name: 'single-player-game', params: { gameId: game.id } }">
              {{ t('components.pages.User.viewGame') }}
              <ArrowRight :size="16" aria-hidden="true" />
            </RouterLink>
          </li>
        </ul>
      </article>
    </template>
  </section>
</template>

<style scoped>
.single-player-games-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: min(100%, 760px);
  margin-top: var(--spacing-xl);
}
.single-player-games-section > p {
  margin: 0;
  color: var(--muted);
}
.single-player-games-section__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-md);
}
.single-player-games-section__stats article {
  display: flex;
  min-height: 140px;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
  background: var(--surface-card-dark);
}
.single-player-games-section__stats span {
  color: var(--muted);
  font-size: var(--font-size-body-sm);
}
.single-player-games-section__stats strong {
  color: var(--primary);
  font-family: var(--font-number);
  font-size: var(--font-size-display-sm);
}
.single-player-games-section__history {
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
}
.single-player-games-section__history h2,
.single-player-games-section__history p {
  margin: 0;
}
.single-player-games-section__history p {
  margin-top: var(--spacing-md);
  color: var(--muted);
}
.single-player-games-section__history ul {
  margin: var(--spacing-md) 0 0;
  padding: 0;
  list-style: none;
}
.single-player-games-section__history li {
  display: grid;
  grid-template-columns: minmax(130px, 1fr) 130px auto;
  align-items: center;
  gap: var(--spacing-md);
  min-height: 72px;
  padding: var(--spacing-sm) 0;
  border-top: 1px solid var(--hairline);
  color: var(--muted-strong);
}
.single-player-games-section__result {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xxs);
  font-family: var(--font-number);
  text-align: right;
}
.single-player-games-section__result strong {
  color: var(--on-dark);
  font-size: var(--font-size-title-sm);
}
.single-player-games-section__result span {
  color: var(--muted);
  font-size: var(--font-size-body-sm);
}
.single-player-games-section__history a {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  justify-self: end;
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}
@media (max-width: 640px) {
  .single-player-games-section__stats {
    grid-template-columns: 1fr;
  }
  .single-player-games-section__history li {
    grid-template-columns: 1fr auto;
  }
  .single-player-games-section__result {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
