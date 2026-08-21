import {
  AVATAR_CLASS_MAP,
  DEFAULT_WORLD_SCALE,
  EARTH_RADIUS_KM,
  MAX_SCORE,
  PERFECT_SCORE_THRESHOLD_KM,
} from '@/consts'
import type { LatLng } from '@/types'

export const getAvatarClass = (avatarBg?: string) => {
  return avatarBg ? (AVATAR_CLASS_MAP[avatarBg] ?? '') : ''
}

export const calculateDistance = (pos1: LatLng, pos2: LatLng): number => {
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180
  const dLon = ((pos2.lng - pos1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = EARTH_RADIUS_KM * c
  return Math.round(d * 100) / 100
}

// The "Map Scale" is essentially the distance (in km) at which the score would drop significantly.
// For the global "World" map, this is approximately 14,917 km (half the earth's circumferenceish/diagonal).
// For smaller country maps (e.g., UK, USA), this number is smaller, punishing distance more harshly.
export const calculateScore = (distanceKm: number, scale: number = DEFAULT_WORLD_SCALE): number => {
  if (distanceKm <= PERFECT_SCORE_THRESHOLD_KM) {
    return MAX_SCORE
  }
  // The simplified formula derived from community reverse engineering:
  // Score = 5000 * e^(-10 * distance / scale)
  const score = MAX_SCORE * Math.exp(-(10 * distanceKm) / scale)

  return Math.round(score)
}

export const calculateCenter = (
  pos1: [number, number],
  pos2: [number, number],
): [number, number] => {
  const centerLng = (pos1[0] + pos2[0]) / 2
  const centerLat = (pos1[1] + pos2[1]) / 2
  return [centerLng, centerLat]
}

export const calculateZoomLevel = (distance: number): number => {
  let zoom = 10
  if (distance < 1) {
    zoom = 15
  } else if (distance < 10) {
    zoom = 12
  } else if (distance < 50) {
    zoom = 9
  } else if (distance < 200) {
    zoom = 7
  } else if (distance < 1000) {
    zoom = 5
  } else if (distance < 5000) {
    zoom = 2
  } else {
    zoom = 1
  }
  return zoom
}
