<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import useOnClickOutside from '@/composables/useOnClickOutside'
import Button from '@/components/shared/Button.vue'

defineOptions({
  name: 'SharedHowToPlayButton',
})

const { t } = useI18n()
const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const closeDialog = () => {
  isOpen.value = false
}

const toggleDialog = () => {
  isOpen.value = !isOpen.value
}

useOnClickOutside({
  root,
  close: closeDialog,
})
</script>

<template>
  <div ref="root" class="how-to-play-button">
    <Button variant="tertiary" :aria-expanded="isOpen" aria-haspopup="dialog" @click="toggleDialog">
      {{ t('components.shared.HowToPlayButton.triggerLabel') }}
    </Button>

    <div
      v-if="isOpen"
      class="how-to-play-button__dialog"
      role="dialog"
      :aria-label="t('components.shared.HowToPlayButton.triggerLabel')"
    >
      <p class="how-to-play-button__line">
        {{ t('components.shared.HowToPlayButton.descriptionLine1') }}
      </p>
      <p class="how-to-play-button__line">
        {{ t('components.shared.HowToPlayButton.descriptionLine2') }}
      </p>
      <p class="how-to-play-button__line">
        {{ t('components.shared.HowToPlayButton.descriptionLine3') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.how-to-play-button {
  position: relative;
}

.how-to-play-button__dialog {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 240px;
  padding: var(--spacing-md);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-sm);
  background-color: var(--surface-card-dark);
  box-shadow: 0 12px 28px color-mix(in srgb, black 32%, transparent);
}

.how-to-play-button__line {
  margin: 0;
  color: var(--muted);
  font-size: var(--font-size-body-sm);
  line-height: var(--line-height-body);
}
</style>
