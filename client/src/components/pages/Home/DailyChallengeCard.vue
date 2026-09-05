<script setup lang="ts">
import { CalendarDays } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import Button from '@/components/shared/Button.vue'
import type { DailyChallengeStatus } from '@/types/game'

defineOptions({
  name: 'HomeDailyChallengeCard',
})

const props = defineProps<{
  disabled: boolean
  isLoadingUser: boolean
  isStartingChallenge: boolean
  status: DailyChallengeStatus
}>()

const emit = defineEmits<{
  startDailyChallenge: []
}>()

const { t } = useI18n()
const buttonLabel = () => {
  if (props.status === 'ongoing') {
    return t('components.pages.Home.DailyChallengeCard.continueGame')
  }
  if (props.status === 'completed') {
    return t('components.pages.Home.DailyChallengeCard.alreadyPlayedToday')
  }
  if (props.status === 'unavailable') {
    return t('components.pages.Home.DailyChallengeCard.unavailableToday')
  }
  return t('components.pages.Home.DailyChallengeCard.startGame')
}
</script>

<template>
  <section class="daily-challenge-card">
    <div class="daily-challenge-card__title">
      <CalendarDays class="daily-challenge-card__title-icon" :size="20" />
      <h2 class="daily-challenge-card__title-label">
        {{ t('components.pages.Home.DailyChallengeCard.title') }}
      </h2>
    </div>

    <Button
      class="daily-challenge-card__start-button"
      :disabled="props.disabled || props.status === 'completed' || props.status === 'unavailable'"
      :loading="props.isLoadingUser || props.isStartingChallenge"
      @click="emit('startDailyChallenge')"
    >
      {{ buttonLabel() }}
    </Button>
  </section>
</template>

<style scoped>
.daily-challenge-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: min(100%, 440px);
  padding: var(--spacing-lg);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
  color: var(--on-dark);
}

.daily-challenge-card__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.daily-challenge-card__title-icon {
  flex-shrink: 0;
}

.daily-challenge-card__title-label {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-md);
  color: var(--on-dark);
}

.daily-challenge-card__start-button {
  width: 100%;
}

@media (max-width: 480px) {
  .daily-challenge-card {
    padding: var(--spacing-md);
  }
}
</style>
