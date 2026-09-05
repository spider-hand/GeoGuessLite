<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import Avatar from '@/components/shared/Avatar.vue'
import useCountry from '@/composables/useCountry'
import useWithFriendsGamesQuery from '@/composables/useWithFriendsGamesQuery'
import { formatMediumDate } from '@/utils/date'
import { formatDistanceKm, formatNumber } from '@/utils/game'

defineOptions({ name: 'UserFriendsGamesSection' })

const { locale, t } = useI18n()
const { countryFlagAlt, countryFlagSrc } = useCountry()
const { games, isError, isLoading } = useWithFriendsGamesQuery()
const ordinalRules = computed(() => new Intl.PluralRules(locale.value, { type: 'ordinal' }))
const formatRank = (rank: number) =>
  t(`components.pages.User.rankOrdinal.${ordinalRules.value.select(rank)}`, { rank })
const formatDistance = (distance: number | null) =>
  formatDistanceKm(distance, locale.value) ?? t('components.pages.User.distanceUnavailable')
</script>

<template>
  <section class="friends-games-section">
    <p v-if="isLoading">{{ t('components.pages.User.loading') }}</p>
    <p v-else-if="isError">{{ t('components.pages.User.loadError') }}</p>
    <article v-else class="friends-games-section__history data-table-card">
      <h2>{{ t('components.pages.User.recentGames') }}</h2>
      <p v-if="!games?.length">{{ t('components.pages.User.noRecentGames') }}</p>
      <ul v-else>
        <li v-for="game in games" :key="game.id">
          <div class="friends-games-section__host">
            <Avatar :name="game.hostDisplayName" size="sm" />
            <span>{{ game.hostDisplayName }}</span>
            <img
              v-if="game.hostCountry"
              :src="countryFlagSrc(game.hostCountry)"
              :alt="countryFlagAlt(game.hostCountry)"
            />
          </div>
          <time :datetime="game.completedAt.toISOString()">
            {{ formatMediumDate(game.completedAt, locale) }}
          </time>
          <span class="friends-games-section__placement">
            <strong>{{ formatRank(game.rank) }}</strong>
            <span>{{ t('components.pages.User.rankOf', { count: game.playerCount }) }}</span>
          </span>
          <span class="friends-games-section__result">
            <strong>{{ formatNumber(game.totalScore, locale) }}</strong>
            <span>{{ formatDistance(game.totalDistanceKm) }}</span>
          </span>
          <RouterLink :to="`/game/with-friends/${game.id}`">
            {{ t('components.pages.User.viewGame') }}
            <ArrowRight :size="16" aria-hidden="true" />
          </RouterLink>
        </li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.friends-games-section {
  width: min(100%, 980px);
  margin-top: var(--spacing-xl);
}
.friends-games-section > p {
  margin: 0;
  color: var(--muted);
}
.friends-games-section__history {
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
}
.friends-games-section__history h2,
.friends-games-section__history p {
  margin: 0;
}
.friends-games-section__history p {
  margin-top: var(--spacing-md);
  color: var(--muted);
}
.friends-games-section__history ul {
  margin: var(--spacing-md) 0 0;
  padding: 0;
  list-style: none;
}
.friends-games-section__history li {
  display: grid;
  grid-template-columns: minmax(150px, 1fr) 120px 80px 120px auto;
  align-items: center;
  gap: var(--spacing-md);
  min-height: 72px;
  padding: var(--spacing-sm) 0;
  border-top: 1px solid var(--hairline);
  color: var(--muted-strong);
}
.friends-games-section__host {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
  color: var(--on-dark);
  font-weight: var(--font-weight-semibold);
}
.friends-games-section__host span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.friends-games-section__host img {
  width: 24px;
  height: 18px;
}
.friends-games-section__placement,
.friends-games-section__result {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xxs);
  font-family: var(--font-number);
  text-align: right;
}
.friends-games-section__placement strong,
.friends-games-section__result strong {
  color: var(--on-dark);
  font-size: var(--font-size-title-sm);
}
.friends-games-section__placement span,
.friends-games-section__result span {
  color: var(--muted);
  font-size: var(--font-size-body-sm);
}
.friends-games-section__history a {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  justify-self: end;
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}
@media (max-width: 760px) {
  .friends-games-section__history li {
    grid-template-columns: 1fr 1fr;
  }
  .friends-games-section__host {
    grid-column: 1 / -1;
  }
  .friends-games-section__placement,
  .friends-games-section__result {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
