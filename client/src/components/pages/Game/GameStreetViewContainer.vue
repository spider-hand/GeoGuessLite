<script setup lang="ts">
import { ScanEye, X } from '@lucide/vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import GameStreetView from '@/components/pages/Game/GameStreetView.vue'
import IconButton from '@/components/shared/IconButton.vue'

defineOptions({ name: 'GameStreetViewContainer' })

const props = defineProps<{
  imageId: string
}>()

const { t } = useI18n()
const isOpen = ref(false)
</script>

<template>
  <IconButton
    v-if="!isOpen"
    class="game-street-view-container__trigger"
    :ariaLabel="t('components.pages.Game.GameStreetViewContainer.showStreetView')"
    @click="isOpen = true"
  >
    <ScanEye :size="20" aria-hidden="true" />
  </IconButton>

  <div v-if="isOpen" class="game-street-view-container" role="presentation">
    <div
      class="game-street-view-container__panel"
      role="dialog"
      :aria-label="t('components.pages.Game.GameStreetViewContainer.showStreetView')"
    >
      <IconButton
        class="game-street-view-container__close-button"
        :ariaLabel="t('components.pages.Game.GameStreetViewContainer.closeStreetView')"
        @click="isOpen = false"
      >
        <X :size="20" aria-hidden="true" />
      </IconButton>

      <GameStreetView class="game-street-view-container__street-view" :image-id="props.imageId" />
    </div>
  </div>
</template>

<style scoped>
.game-street-view-container__trigger {
  position: fixed;
  right: var(--spacing-lg);
  bottom: var(--spacing-lg);
  z-index: 10;
  width: 48px;
  height: 48px;
  border: 1px solid var(--primary);
  background-color: var(--primary);
  color: var(--on-primary);
  box-shadow: 0 12px 24px rgb(0 0 0 / 0.28);
}

.game-street-view-container__trigger.icon-button:hover:not(.icon-button--disabled) {
  background-color: var(--primary-active);
  color: var(--on-primary);
}

.game-street-view-container {
  position: fixed;
  right: var(--spacing-lg);
  bottom: var(--spacing-lg);
  z-index: 30;
  width: min(360px, calc(100% - 48px));
  padding: var(--spacing-sm);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-xl);
  background-color: var(--surface-card-dark);
  box-shadow: 0 16px 36px rgb(0 0 0 / 0.32);
}

.game-street-view-container__panel {
  position: relative;
}

.game-street-view-container__close-button {
  position: absolute;
  z-index: 20;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  width: 40px;
  height: 40px;
  border: 1px solid var(--hairline);
  background-color: var(--surface-card-dark);
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.24);
}

.game-street-view-container__street-view {
  height: 240px;
}

@media (max-width: 960px) {
  .game-street-view-container {
    inset: 0;
    width: auto;
    padding: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .game-street-view-container__panel,
  .game-street-view-container__street-view {
    width: 100%;
    height: 100%;
  }

  .game-street-view-container__close-button {
    top: var(--spacing-sm);
    right: var(--spacing-sm);
  }

  .game-street-view-container__street-view {
    border-radius: 0;
  }
}
</style>
