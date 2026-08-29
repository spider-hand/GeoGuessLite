<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import Avatar from '@/components/shared/Avatar.vue'

defineOptions({
  name: 'GamePlayerMatchupCard',
})

type Player = {
  name: string
  country?: string
}

const props = defineProps<{
  playerOne: Player
  playerTwo: Player
}>()

const { t } = useI18n()
const countryFlagSrc = (country: string) => `https://flagcdn.com/24x18/${country.toLowerCase()}.png`
const countryFlagAlt = (country: string) => `${country.toUpperCase()} flag`
</script>

<template>
  <section class="player-matchup-card">
    <div class="player-matchup-card__content">
      <article class="player-matchup-card__player" data-testid="player-matchup-card-player">
        <Avatar
          class="player-matchup-card__avatar"
          :name="props.playerOne.name"
          size="md"
          data-testid="player-matchup-card-avatar"
        />

        <p class="player-matchup-card__name">
          <span>{{ props.playerOne.name }}</span>
          <img
            v-if="props.playerOne.country"
            class="player-matchup-card__flag"
            :src="countryFlagSrc(props.playerOne.country)"
            :alt="countryFlagAlt(props.playerOne.country)"
            width="24"
            height="18"
          />
        </p>
      </article>

      <span class="player-matchup-card__vs" aria-label="versus">
        {{ t('components.pages.Game.PlayerMatchupCard.versus') }}
      </span>

      <article class="player-matchup-card__player" data-testid="player-matchup-card-player">
        <Avatar
          class="player-matchup-card__avatar"
          :name="props.playerTwo.name"
          size="md"
          data-testid="player-matchup-card-avatar"
        />

        <p class="player-matchup-card__name">
          <span>{{ props.playerTwo.name }}</span>
          <img
            v-if="props.playerTwo.country"
            class="player-matchup-card__flag"
            :src="countryFlagSrc(props.playerTwo.country)"
            :alt="countryFlagAlt(props.playerTwo.country)"
            width="24"
            height="18"
          />
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.player-matchup-card {
  width: min(100%, 520px);
}

.player-matchup-card__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: var(--spacing-sm);
}

.player-matchup-card__player {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
  padding: var(--spacing-md);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
}

.player-matchup-card__avatar {
  flex-shrink: 0;
}

.player-matchup-card__name {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  min-width: 0;
  margin: 0;
  color: var(--on-dark);
  font-family: var(--font-body);
  font-size: var(--font-size-title-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-sm);
}

.player-matchup-card__name > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-matchup-card__flag {
  flex-shrink: 0;
  width: 24px;
  height: 18px;
}

.player-matchup-card__vs {
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-title-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-sm);
  text-transform: lowercase;
}

@media (max-width: 560px) {
  .player-matchup-card {
    width: 100%;
  }
}
</style>
