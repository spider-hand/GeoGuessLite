<script setup lang="ts">
import { Map, X } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

import GameMap from '@/components/pages/Game/GameMap.vue'
import IconButton from '@/components/shared/IconButton.vue'
import type { GameMapMarker } from '@/types/game'

defineOptions({ name: 'GameMapModal' })

const props = defineProps<{
  center: [number, number]
  isOpen: boolean
  isSelectable: boolean
  markers: Array<GameMapMarker>
  zoom: number
}>()

const emit = defineEmits<{
  close: []
  open: []
  select: [coordinates: [number, number]]
}>()

const { t } = useI18n()
</script>

<template>
  <IconButton
    v-if="!props.isOpen"
    class="game-map-modal__trigger"
    :ariaLabel="t('components.pages.Game.GameMapModal.showMap')"
    @click="emit('open')"
  >
    <Map :size="20" aria-hidden="true" />
  </IconButton>

  <div v-if="props.isOpen" class="game-map-modal" role="presentation">
    <div
      class="game-map-modal__panel"
      role="dialog"
      :aria-label="t('components.pages.Game.GameMapModal.showMap')"
    >
      <IconButton
        class="game-map-modal__close-button"
        :ariaLabel="t('components.pages.Game.GameMapModal.close')"
        @click="emit('close')"
      >
        <X :size="20" aria-hidden="true" />
      </IconButton>

      <GameMap
        class="game-map-modal__map"
        :center="props.center"
        :is-selectable="props.isSelectable"
        :markers="props.markers"
        :zoom="props.zoom"
        @select="emit('select', $event)"
      />
      <div class="game-map-modal__actions"><slot /></div>
    </div>
  </div>
</template>

<style scoped>
.game-map-modal__trigger {
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

.game-map-modal__trigger.icon-button:hover:not(.icon-button--disabled) {
  background-color: var(--primary-active);
  color: var(--on-primary);
}

@media (max-width: 960px) {
  .game-map-modal__trigger {
    display: inline-flex;
  }
}

.game-map-modal {
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

.game-map-modal__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.game-map-modal__close-button {
  position: absolute;
  z-index: 2;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  width: 40px;
  height: 40px;
  border: 1px solid var(--hairline);
  background-color: var(--surface-card-dark);
  box-shadow: 0 8px 20px rgb(0 0 0 / 0.24);
}

.game-map-modal__map {
  width: 100%;
  height: 240px;
}

.game-map-modal__actions :deep(.button) {
  width: 100%;
}

@media (max-width: 960px) {
  .game-map-modal {
    inset: 0;
    width: auto;
    padding: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .game-map-modal__panel {
    display: block;
    width: 100%;
    height: 100%;
  }

  .game-map-modal__close-button {
    top: var(--spacing-sm);
    right: var(--spacing-sm);
  }

  .game-map-modal__map {
    height: 100%;
    border-radius: 0;
  }

  .game-map-modal__actions {
    position: absolute;
    right: var(--spacing-lg);
    bottom: var(--spacing-lg);
    left: var(--spacing-lg);
    z-index: 1;
  }
}
</style>
