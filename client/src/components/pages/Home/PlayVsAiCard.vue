<script setup lang="ts">
import { Bot, SignalMedium, SignalHigh, Signal } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '@/components/shared/Button.vue'
import type { Difficulty } from '@/types/game'

defineOptions({
  name: 'HomePlayVsAiCard',
})

const { t } = useI18n()

const props = defineProps<{
  disabled: boolean
  isStartingGame: boolean
}>()

const selectedDifficulty = ref<Difficulty>('medium')

const emit = defineEmits<{
  startAiMatch: [difficulty: Difficulty]
}>()

const difficultyOptions = computed(() => [
  {
    icon: SignalMedium,
    label: t('components.pages.Home.PlayVsAiCard.easy'),
    value: 'easy' as const,
  },
  {
    icon: SignalHigh,
    label: t('components.pages.Home.PlayVsAiCard.medium'),
    value: 'medium' as const,
  },
  {
    icon: Signal,
    label: t('components.pages.Home.PlayVsAiCard.hard'),
    value: 'hard' as const,
  },
])

const selectDifficulty = (difficulty: Difficulty) => {
  selectedDifficulty.value = difficulty
}

const emitStartAiMatch = () => {
  emit('startAiMatch', selectedDifficulty.value)
}
</script>

<template>
  <section class="play-vs-ai-card">
    <div class="play-vs-ai-card__title">
      <Bot class="play-vs-ai-card__title-icon" :size="20" />
      <h2 class="play-vs-ai-card__title-label">
        {{ t('components.pages.Home.PlayVsAiCard.title') }}
      </h2>
    </div>

    <div class="play-vs-ai-card__difficulty" role="group">
      <button
        v-for="option in difficultyOptions"
        :key="option.value"
        class="play-vs-ai-card__difficulty-button"
        :class="{
          'play-vs-ai-card__difficulty-button--selected': selectedDifficulty === option.value,
        }"
        type="button"
        :disabled="props.disabled"
        :aria-pressed="selectedDifficulty === option.value"
        @click="selectDifficulty(option.value)"
      >
        <component :is="option.icon" :size="16" />
        <span>{{ option.label }}</span>
      </button>
    </div>

    <Button
      class="play-vs-ai-card__start-button"
      :disabled="props.disabled"
      :loading="props.isStartingGame"
      @click="emitStartAiMatch"
    >
      {{ t('components.pages.Home.PlayVsAiCard.startGame') }}
    </Button>
  </section>
</template>

<style scoped>
.play-vs-ai-card {
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

.play-vs-ai-card__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.play-vs-ai-card__title-icon {
  flex-shrink: 0;
}

.play-vs-ai-card__title-label {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-title-md);
  color: var(--on-dark);
}

.play-vs-ai-card__difficulty {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-sm);
}

.play-vs-ai-card__difficulty-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  width: 100%;
  min-height: 40px;
  padding: 0 var(--spacing-sm) var(--spacing-xs);
  border: 0;
  background: transparent;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: var(--font-size-button);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-button);
  cursor: pointer;
  transition: color 160ms ease;
}

.play-vs-ai-card__difficulty-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 25%;
  height: 3px;
  background-color: transparent;
  transform: translateX(-50%);
}

.play-vs-ai-card__difficulty-button:hover,
.play-vs-ai-card__difficulty-button:focus-visible {
  color: var(--on-dark);
}

.play-vs-ai-card__difficulty-button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.play-vs-ai-card__difficulty-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--info-ring) 50%, transparent);
  outline-offset: 2px;
}

.play-vs-ai-card__difficulty-button--selected {
  color: var(--on-dark);
}

.play-vs-ai-card__difficulty-button--selected::after {
  background-color: var(--primary);
}

.play-vs-ai-card__start-button {
  width: 100%;
}

@media (max-width: 480px) {
  .play-vs-ai-card {
    padding: var(--spacing-md);
  }

  .play-vs-ai-card__difficulty {
    gap: var(--spacing-xs);
  }

  .play-vs-ai-card__difficulty-button {
    padding-inline: var(--spacing-xs);
  }
}
</style>
