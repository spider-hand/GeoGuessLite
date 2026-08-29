<script setup lang="ts">
import 'mapillary-js/dist/mapillary.css'
import { Viewer } from 'mapillary-js'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

defineOptions({
  name: 'GameStreetView',
})

const props = defineProps<{
  imageId: string
}>()

const viewerElement = useTemplateRef('viewerElement')
let viewer: Viewer | null = null

onMounted(() => {
  if (viewerElement.value === null) {
    return
  }

  viewer = new Viewer({
    accessToken: import.meta.env.VITE_MAPILLARY_TOKEN,
    container: viewerElement.value,
    imageId: props.imageId,
  })
})

watch(
  () => props.imageId,
  (imageId) => {
    void viewer?.moveTo(imageId)
  },
)

onBeforeUnmount(() => {
  viewer?.remove()
  viewer = null
})
</script>

<template>
  <div ref="viewerElement" class="game-street-view" data-testid="game-street-view" />
</template>

<style scoped>
.game-street-view {
  width: 100%;
  height: 420px;
  border-radius: var(--radius-token-xl);
  overflow: hidden;
}
</style>
