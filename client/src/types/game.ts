export type GameModeType = 'single-player' | 'multiplayer' | 'daily-challenge'

export type DailyChallengeStatus = 'available' | 'ongoing' | 'completed' | 'unavailable'
export type DailyChallengeAvailability = DailyChallengeStatus | 'loading'

export type GameMapMarker = {
  coordinates: [number, number]
  label: string
  markerType: 'player' | 'target'
}

export type SinglePlayerSummaryRound = {
  distanceKm: number | null
  imageId: string
  roundNumber: number
  score: number
  selection: [number, number] | null
  target: [number, number]
}
