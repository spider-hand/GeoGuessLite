<script setup lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl, { type GeoJSONSource, type MapMouseEvent } from 'mapbox-gl'
import { computed, h, onBeforeUnmount, onMounted, render, useTemplateRef, watch } from 'vue'

import Avatar from '@/components/shared/Avatar.vue'
import type { GameMapMarker } from '@/types/game'

defineOptions({ name: 'GameMap' })

const props = defineProps<{
  center: [number, number]
  isSelectable: boolean
  markers: Array<GameMapMarker>
  zoom: number
}>()

const emit = defineEmits<{
  select: [coordinates: [number, number]]
}>()

const mapElement = useTemplateRef('mapElement')
let map: mapboxgl.Map | null = null
const mapMarkers: Array<{ cleanup: () => void; marker: mapboxgl.Marker }> = []
const resultLineSourceId = 'game-map-result-line'
const resultLineLayerId = 'game-map-result-line-layer'
type ResultLineData = Exclude<Parameters<GeoJSONSource['setData']>[0], string>

const removeMarkers = () => {
  for (const mapMarker of mapMarkers.splice(0)) {
    mapMarker.cleanup()
    mapMarker.marker.remove()
  }
}

const createMarkerElement = (marker: GameMapMarker) => {
  const element = document.createElement('div')
  element.className = `game-map-marker game-map-marker--${marker.markerType}`
  element.title = marker.label

  if (marker.markerType === 'target') {
    element.setAttribute('aria-label', marker.label)
    element.innerHTML = '<span class="game-map-marker__target-dot" aria-hidden="true"></span>'
    return { element, cleanup: () => undefined }
  }

  const mountNode = document.createElement('span')
  mountNode.className = 'game-map-marker__avatar'
  element.append(mountNode)
  render(h(Avatar, { name: marker.label, size: 'sm' }), mountNode)

  return { element, cleanup: () => render(null, mountNode) }
}

const syncMarkers = () => {
  removeMarkers()
  if (!map) return

  for (const marker of props.markers) {
    const { cleanup, element } = createMarkerElement(marker)
    const mapMarker = new mapboxgl.Marker({ anchor: 'bottom', element })
      .setLngLat(marker.coordinates)
      .addTo(map)
    mapMarkers.push({ cleanup, marker: mapMarker })
  }
}

const resultLineData = computed<ResultLineData>(() => {
  const player = props.markers.find(({ markerType }) => markerType === 'player')
  const target = props.markers.find(({ markerType }) => markerType === 'target')
  return {
    type: 'FeatureCollection',
    features:
      player && target
        ? [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [player.coordinates, target.coordinates],
              },
            },
          ]
        : [],
  }
})

const syncResultLine = () => {
  if (!map || !map.isStyleLoaded()) return

  const existingSource = map.getSource(resultLineSourceId) as GeoJSONSource | undefined
  if (existingSource) {
    existingSource.setData(resultLineData.value)
    return
  }

  map.addSource(resultLineSourceId, { type: 'geojson', data: resultLineData.value })
  map.addLayer({
    id: resultLineLayerId,
    type: 'line',
    source: resultLineSourceId,
    slot: 'top',
    paint: { 'line-color': '#fcd535', 'line-opacity': 0.9, 'line-width': 3 },
  })
}

const handleMapClick = (event: MapMouseEvent) => {
  if (props.isSelectable) emit('select', [event.lngLat.lng, event.lngLat.lat])
}

onMounted(() => {
  if (!mapElement.value) return

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
  map = new mapboxgl.Map({
    container: mapElement.value,
    style: 'mapbox://styles/mapbox/standard',
    center: props.center,
    zoom: props.zoom,
  })
  map.on('click', handleMapClick)
  map.on('load', syncResultLine)
  map.on('style.load', syncResultLine)
  syncMarkers()
})

watch([() => props.center, () => props.zoom], ([center, zoom]) => map?.jumpTo({ center, zoom }), {
  deep: true,
})

watch(
  () => props.markers,
  () => {
    syncMarkers()
    syncResultLine()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  removeMarkers()
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

:global(.game-map-marker) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid var(--on-dark);
  border-radius: var(--radius-token-full);
  box-shadow: 0 10px 24px rgb(0 0 0 / 0.28);
}

:global(.game-map-marker--player) {
  overflow: hidden;
  background-color: var(--surface-card-dark);
}

:global(.game-map-marker__avatar),
:global(.game-map-marker__avatar .avatar) {
  width: 36px;
  height: 36px;
}

:global(.game-map-marker--target) {
  width: 32px;
  height: 32px;
  border: 0;
  background-color: transparent;
  box-shadow: none;
}

:global(.game-map-marker__target-dot) {
  position: relative;
  width: 28px;
  height: 28px;
  border: 2px solid var(--on-dark);
  border-radius: var(--radius-token-full) var(--radius-token-full) var(--radius-token-full) 0;
  background-color: var(--primary);
  box-shadow: 0 10px 24px rgb(0 0 0 / 0.28);
  transform: rotate(-45deg);
}

:global(.game-map-marker__target-dot::after) {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-token-full);
  background-color: var(--on-primary);
  content: '';
  transform: translate(-50%, -50%);
}
</style>
