<script setup lang="ts">
import { ChevronDown, ArrowRight } from '@lucide/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import Avatar from '@/components/shared/Avatar.vue'
import useAuth from '@/composables/useAuth'
import useCountry from '@/composables/useCountry'
import useDailyChallengeHistoryQuery from '@/composables/useDailyChallengeHistoryQuery'
import useDailyChallengeLeaderboardQuery from '@/composables/useDailyChallengeLeaderboardQuery'
import useOnClickOutside from '@/composables/useOnClickOutside'
import { formatUtcDate, recentUtcDates } from '@/utils/date'
import { formatDistanceKm, formatNumber } from '@/utils/game'

defineOptions({ name: 'UserDailyChallengeSection' })

const { locale, t } = useI18n()
const { user } = useAuth()
const { countryFlagAlt, countryFlagSrc } = useCountry()
const dates = recentUtcDates(7)
const selectedDate = ref(dates[0]!)
const isDateMenuOpen = ref(false)
const dateMenuRoot = ref<HTMLElement | null>(null)
const {
  entries,
  isError: isLeaderboardError,
  isLoading: isLeaderboardLoading,
} = useDailyChallengeLeaderboardQuery(selectedDate)
const {
  games,
  isError: isHistoryError,
  isLoading: isHistoryLoading,
} = useDailyChallengeHistoryQuery()
const selectDate = (date: Date) => {
  selectedDate.value = date
  isDateMenuOpen.value = false
}
const formatDistance = (distance: number | null) =>
  formatDistanceKm(distance, locale.value) ?? t('components.pages.User.distanceUnavailable')

useOnClickOutside({ root: dateMenuRoot, close: () => (isDateMenuOpen.value = false) })
</script>

<template>
  <section class="daily-challenge-section">
    <article class="daily-challenge-section__leaderboard data-table-card">
      <header>
        <h2>{{ t('components.pages.User.DailyChallengeSection.leaderboard') }}</h2>
        <div ref="dateMenuRoot" class="daily-challenge-section__date-selector">
          <button
            class="daily-challenge-section__date-trigger"
            type="button"
            aria-haspopup="menu"
            :aria-expanded="isDateMenuOpen"
            @click="isDateMenuOpen = !isDateMenuOpen"
          >
            {{ formatUtcDate(selectedDate, locale) }}
            <ChevronDown :size="16" aria-hidden="true" />
          </button>
          <div v-if="isDateMenuOpen" class="daily-challenge-section__date-menu" role="menu">
            <button
              v-for="date in dates"
              :key="date.toISOString()"
              type="button"
              role="menuitemradio"
              :aria-checked="date.getTime() === selectedDate.getTime()"
              @click="selectDate(date)"
            >
              {{ formatUtcDate(date, locale) }}
            </button>
          </div>
        </div>
      </header>
      <p v-if="isLeaderboardLoading">{{ t('components.pages.User.loading') }}</p>
      <p v-else-if="isLeaderboardError">{{ t('components.pages.User.loadError') }}</p>
      <p v-else-if="!entries?.length">
        {{ t('components.pages.User.DailyChallengeSection.noLeaderboardEntries') }}
      </p>
      <ol v-else class="daily-challenge-section__players">
        <li
          v-for="entry in entries"
          :key="entry.userId"
          :class="{ 'daily-challenge-section__player--current': entry.userId === user?.userId }"
        >
          <span class="daily-challenge-section__rank">{{ entry.rank }}</span>
          <span class="daily-challenge-section__identity">
            <Avatar :name="entry.displayName" size="sm" />
            <strong>{{ entry.displayName }}</strong>
            <img
              v-if="entry.country"
              :src="countryFlagSrc(entry.country)"
              :alt="countryFlagAlt(entry.country)"
            />
          </span>
          <strong>{{ formatNumber(entry.totalScore, locale) }}</strong>
        </li>
      </ol>
    </article>

    <article class="daily-challenge-section__history data-table-card">
      <h2>{{ t('components.pages.User.recentGames') }}</h2>
      <p v-if="isHistoryLoading">{{ t('components.pages.User.loading') }}</p>
      <p v-else-if="isHistoryError">{{ t('components.pages.User.loadError') }}</p>
      <p v-else-if="!games?.length">{{ t('components.pages.User.noRecentGames') }}</p>
      <ul v-else>
        <li v-for="game in games" :key="game.id">
          <time :datetime="game.date.toISOString()">{{ formatUtcDate(game.date, locale) }}</time>
          <span class="daily-challenge-section__result">
            <strong>{{ formatNumber(game.totalScore, locale) }}</strong>
            <span>{{ formatDistance(game.totalDistanceKm) }}</span>
          </span>
          <RouterLink :to="{ name: 'daily-challenge-history', params: { gameId: game.id } }">
            {{ t('components.pages.User.viewGame') }}
            <ArrowRight :size="16" aria-hidden="true" />
          </RouterLink>
        </li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.daily-challenge-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: min(100%, 760px);
  margin-top: var(--spacing-xl);
}
.daily-challenge-section__leaderboard,
.daily-challenge-section__history {
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
}
.daily-challenge-section__leaderboard header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}
.daily-challenge-section h2,
.daily-challenge-section p {
  margin: 0;
}
.daily-challenge-section p {
  margin-top: var(--spacing-md);
  color: var(--muted);
}
.daily-challenge-section__date-selector {
  position: relative;
}
.daily-challenge-section__date-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-height: 36px;
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-md);
  background: var(--surface-elevated-dark);
  color: var(--on-dark);
  font: inherit;
  cursor: pointer;
}
.daily-challenge-section__date-menu {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
  min-width: 180px;
  padding: var(--spacing-xs);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-sm);
  background: var(--surface-card-dark);
  box-shadow: 0 12px 28px color-mix(in srgb, black 32%, transparent);
}
.daily-challenge-section__date-menu button {
  display: flex;
  align-items: center;
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
.daily-challenge-section__date-menu button:hover {
  background: var(--surface-elevated-dark);
  color: var(--on-dark);
}
.daily-challenge-section__date-menu button[aria-checked='true'] {
  background: var(--surface-elevated-dark);
  color: var(--primary);
}
.daily-challenge-section__date-trigger:focus-visible,
.daily-challenge-section__date-menu button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}
.daily-challenge-section__players {
  margin: var(--spacing-md) 0 0;
  padding: 0;
  list-style: none;
}
.daily-challenge-section__players li {
  display: grid;
  grid-template-columns: 32px minmax(140px, 1fr) 100px;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid transparent;
  border-radius: var(--radius-token-lg);
}
.daily-challenge-section__player--current {
  border-color: var(--primary) !important;
}
.daily-challenge-section__rank {
  color: var(--muted-strong);
  font-family: var(--font-number);
  text-align: center;
}
.daily-challenge-section__identity {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
}
.daily-challenge-section__identity strong {
  overflow: hidden;
  color: var(--on-dark);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.daily-challenge-section__identity img {
  width: 24px;
  height: 18px;
}
.daily-challenge-section__players li > strong {
  color: var(--on-dark);
  font-family: var(--font-number);
  text-align: right;
}
.daily-challenge-section__history > ul {
  margin: var(--spacing-md) 0 0;
  padding: 0;
  list-style: none;
}
.daily-challenge-section__history li {
  display: grid;
  grid-template-columns: minmax(130px, 1fr) 130px auto;
  align-items: center;
  gap: var(--spacing-md);
  min-height: 72px;
  padding: var(--spacing-sm) 0;
  border-top: 1px solid var(--hairline);
  color: var(--muted-strong);
}
.daily-challenge-section__result {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xxs);
  font-family: var(--font-number);
  text-align: right;
}
.daily-challenge-section__result strong {
  color: var(--on-dark);
  font-size: var(--font-size-title-sm);
}
.daily-challenge-section__result span {
  color: var(--muted);
  font-size: var(--font-size-body-sm);
}
.daily-challenge-section__history a {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  justify-self: end;
  color: var(--primary);
  font-weight: var(--font-weight-semibold);
}
@media (max-width: 640px) {
  .daily-challenge-section__leaderboard header {
    align-items: flex-start;
    flex-direction: column;
  }
  .daily-challenge-section__date-menu {
    right: auto;
    left: 0;
  }
  .daily-challenge-section__history li {
    grid-template-columns: 1fr auto;
  }
  .daily-challenge-section__result {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
