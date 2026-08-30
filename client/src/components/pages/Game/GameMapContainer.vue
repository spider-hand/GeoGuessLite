<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import GameMapModal from '@/components/pages/Game/GameMapModal.vue'
import Button from '@/components/shared/Button.vue'
import type { GameMapMarker } from '@/types/game'

defineOptions({ name: 'GameMapContainer' })

const props = defineProps<{
  isSubmitting: boolean
  playerName: string
  selection: [number, number] | null
}>()

const emit = defineEmits<{
  select: [coordinates: [number, number]]
  submit: []
}>()

const { t } = useI18n()
const isMapModalOpen = ref(false)
const center: [number, number] = [0, 20]
const markers = computed<Array<GameMapMarker>>(() =>
  props.selection
    ? [{ coordinates: props.selection, label: props.playerName, markerType: 'player' }]
    : [],
)

const submit = () => {
  if (props.selection && !props.isSubmitting) emit('submit')
}
</script>

<template>
  <GameMapModal
    :center="center"
    :is-open="isMapModalOpen"
    :is-selectable="true"
    :markers="markers"
    :zoom="1"
    @close="isMapModalOpen = false"
    @open="isMapModalOpen = true"
    @select="emit('select', $event)"
  >
    <Button :disabled="props.selection === null" :loading="props.isSubmitting" @click="submit">
      {{
        props.isSubmitting
          ? t('components.pages.Game.GameMapContainer.submitting')
          : t('components.pages.Game.GameMapContainer.makeGuess')
      }}
    </Button>
  </GameMapModal>
</template>
