<script setup lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl from 'mapbox-gl'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

defineOptions({
  name: 'GameMap',
})

const props = defineProps<{
  center: [number, number]
  zoom: number
}>()

const mapElement = useTemplateRef('mapElement')
let map: mapboxgl.Map | null = null

onMounted(() => {
  if (mapElement.value === null) {
    return
  }

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
  map = new mapboxgl.Map({
    container: mapElement.value,
    style: 'mapbox://styles/mapbox/standard',
    center: props.center,
    zoom: props.zoom,
  })
})

watch(
  [() => props.center, () => props.zoom],
  ([center, zoom]) => {
    map?.jumpTo({ center, zoom })
  },
  { deep: true },
)

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="mapElement" class="game-map" data-testid="game-map" />
</template>

<style scoped>
.game-map {
  width: 100%;
  height: 420px;
  border-radius: var(--radius-token-xl);
  overflow: hidden;
}
</style>
