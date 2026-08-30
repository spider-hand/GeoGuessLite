<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'RoundLabel' })

const props = defineProps<{
  currentRound: number
  totalRounds: number
}>()

const { t } = useI18n()
</script>

<template>
  <div class="round-label">
    {{
      t('components.pages.Game.RoundLabel.label', {
        current: props.currentRound,
        total: props.totalRounds,
      })
    }}
  </div>
</template>

<style scoped>
.round-label {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-lg);
  background-color: color-mix(in srgb, var(--surface-card-dark) 92%, transparent);
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.24);
  color: var(--on-dark);
  font-weight: var(--font-weight-semibold);
}
</style>
