<script setup lang="ts">
import { Wifi } from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '@/components/shared/Button.vue'

defineOptions({
  name: 'HomeRandomMatchCard',
})

const props = defineProps<{
  disabled: boolean
  onlinePlayers: number
}>()

const { locale, t } = useI18n()

const onlinePlayersLabel = computed(() => {
  const formattedCount = new Intl.NumberFormat(locale.value).format(props.onlinePlayers)

  return props.onlinePlayers === 1
    ? t('components.pages.Home.RandomMatchCard.onlinePlayersOne', {
        count: formattedCount,
      })
    : t('components.pages.Home.RandomMatchCard.onlinePlayersOther', {
        count: formattedCount,
      })
})
</script>

<template>
  <section class="random-match-card">
    <div class="random-match-card__header">
      <div class="random-match-card__title">
        <Wifi class="random-match-card__title-icon" :size="20" />
        <h2 class="random-match-card__title-label">
          {{ t('components.pages.Home.RandomMatchCard.title') }}
        </h2>
      </div>

      <span class="random-match-card__badge">
        {{ onlinePlayersLabel }}
      </span>
    </div>

    <Button class="random-match-card__join-button" disabled>
      {{ t('components.pages.Home.RandomMatchCard.comingSoon') }}
    </Button>
  </section>
</template>

<style scoped>
.random-match-card {
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

.random-match-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.random-match-card__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.random-match-card__title-icon {
  flex-shrink: 0;
}

.random-match-card__title-label {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-md);
  color: var(--on-dark);
}

.random-match-card__badge {
  flex-shrink: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-token-lg);
  background-color: var(--surface-elevated-dark);
  color: var(--success);
  font-family: var(--font-body);
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-copy);
  white-space: nowrap;
}

.random-match-card__join-button {
  width: 100%;
}

@media (max-width: 480px) {
  .random-match-card {
    padding: var(--spacing-md);
  }

  .random-match-card__header {
    gap: var(--spacing-sm);
  }

  .random-match-card__badge {
    padding-inline: var(--spacing-xs);
  }
}
</style>
