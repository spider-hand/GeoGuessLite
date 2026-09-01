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

export type WithFriendsPlayer = {
  userId: string
  displayName: string
  country?: string
}

export type WithFriendsParticipant = WithFriendsPlayer & {
  isConnected: boolean
  isHost: boolean
}

export type WithFriendsLeaderboardPlayer = WithFriendsPlayer & {
  distanceKm: number | null
  roundScore: number
  totalScore: number
}

export type WithFriendsRoundResultPlayer = WithFriendsLeaderboardPlayer & {
  guess: [number, number] | null
}

export type WithFriendsSummaryPlayer = WithFriendsPlayer & {
  totalScore: number
}

export type WithFriendsSummaryRoundResult = {
  userId: string
  distanceKm: number | null
  guess: [number, number] | null
  score: number
}

export type WithFriendsSummaryRound = {
  imageId: string
  results: Array<WithFriendsSummaryRoundResult>
  roundNumber: number
  target: [number, number]
}
