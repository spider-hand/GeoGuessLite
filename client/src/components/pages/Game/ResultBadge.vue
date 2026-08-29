<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'GameResultBadge',
})

const props = defineProps<{
  result: 'won' | 'lost'
}>()

const { t } = useI18n()
const resultLabel = computed(() =>
  t(
    props.result === 'won'
      ? 'components.pages.Game.ResultBadge.youWin'
      : 'components.pages.Game.ResultBadge.youLose',
  ),
)
</script>

<template>
  <div class="result-badge" :class="`result-badge--${props.result}`">
    {{ resultLabel }}
  </div>
</template>

<style scoped>
.result-badge {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 var(--spacing-md);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-md);
  color: var(--on-primary);
  font-family: var(--font-body);
  font-size: var(--font-size-button);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-button);
  white-space: nowrap;
}

.result-badge--won {
  background-color: var(--success);
}

.result-badge--lost {
  background-color: var(--danger);
}

@media (max-width: 480px) {
  .result-badge {
    padding: 0 var(--spacing-sm);
  }
}
</style>
