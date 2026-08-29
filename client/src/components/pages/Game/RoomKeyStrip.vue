<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'GameRoomKeyStrip',
})

const props = defineProps<{
  roomKey: string
}>()

const { t } = useI18n()
const label = computed(() => t('components.pages.Game.RoomKeyStrip.label'))
const ariaLabel = computed(() => `${label.value}, ${props.roomKey}`)
</script>

<template>
  <section class="room-key-strip" :aria-label="ariaLabel">
    <div class="room-key-strip__label">
      {{ label }}
    </div>
    <div class="room-key-strip__value">
      {{ props.roomKey }}
    </div>
  </section>
</template>

<style scoped>
.room-key-strip {
  display: inline-flex;
  align-items: stretch;
  min-width: 0;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-token-md);
  background-color: var(--surface-card-dark);
  overflow: hidden;
  white-space: nowrap;
}

.room-key-strip__label,
.room-key-strip__value {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 var(--spacing-md);
  font-family: var(--font-body);
  font-size: var(--font-size-button);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-button);
}

.room-key-strip__label {
  background-color: var(--primary);
  color: var(--on-primary);
}

.room-key-strip__value {
  justify-content: center;
  background-color: var(--surface-elevated-dark);
  color: var(--on-dark);
}

@media (max-width: 480px) {
  .room-key-strip__label,
  .room-key-strip__value {
    padding: 0 var(--spacing-sm);
  }
}
</style>
