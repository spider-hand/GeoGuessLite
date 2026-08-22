<script setup lang="ts">
import { CalendarDays } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import Button from '@/components/shared/Button.vue'

defineOptions({
  name: 'HomeDailyChallengeCard',
})

const props = defineProps<{
  disabled: boolean
  hasPlayedToday: boolean
}>()

const emit = defineEmits<{
  startDailyChallenge: []
}>()

const { t } = useI18n()
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
      :disabled="props.disabled || props.hasPlayedToday"
      @click="emit('startDailyChallenge')"
    >
      {{
        t(
          props.hasPlayedToday
            ? 'components.pages.Home.DailyChallengeCard.alreadyPlayedToday'
            : 'components.pages.Home.DailyChallengeCard.startGame',
        )
      }}
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
