<script setup lang="ts">
import { Gamepad2 } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import Button from '@/components/shared/Button.vue'

defineOptions({
  name: 'HomeSinglePlayerCard',
})

defineProps<{
  disabled: boolean
  isStartingGame: boolean
}>()

const emit = defineEmits<{
  startSinglePlayer: []
}>()

const { t } = useI18n()
</script>

<template>
  <section class="single-player-card">
    <div class="single-player-card__title">
      <Gamepad2 class="single-player-card__title-icon" :size="20" />
      <h2 class="single-player-card__title-label">
        {{ t('components.pages.Home.SinglePlayerCard.title') }}
      </h2>
    </div>

    <Button
      class="single-player-card__start-button"
      :disabled
      :loading="isStartingGame"
      @click="emit('startSinglePlayer')"
    >
      {{ t('components.pages.Home.SinglePlayerCard.startGame') }}
    </Button>
  </section>
</template>

<style scoped>
.single-player-card {
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

.single-player-card__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.single-player-card__title-icon {
  flex-shrink: 0;
}

.single-player-card__title-label {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-md);
  color: var(--on-dark);
}

.single-player-card__start-button {
  width: 100%;
}

@media (max-width: 480px) {
  .single-player-card {
    padding: var(--spacing-md);
  }
}
</style>
