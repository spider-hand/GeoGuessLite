export type Difficulty = 'easy' | 'medium' | 'hard'

export type GameTurnStatus<T extends string> = 'player' | T

export type GamePathStepOwner<T extends string> = 'player' | T | 'neutral'

export type GamePathStep<T extends string> = {
  countryCode: string
  owner: GamePathStepOwner<T>
  turn: number
}

export type GameMapMarkerOwner<T extends string> = GamePathStepOwner<T>

export type GameMapMarker<T extends string> = {
  countryCode: string
  owner: GameMapMarkerOwner<T>
  label: string
}

export type AiTurnStatus = GameTurnStatus<'ai'>

export type AiPathStepOwner = GamePathStepOwner<'ai'>

export type AiPathStep = GamePathStep<'ai'>

export type AiGameMapMarkerOwner = GameMapMarkerOwner<'ai'>

export type AiGameMapMarker = GameMapMarker<'ai'>

export type MultiplayerTurnStatus = GameTurnStatus<'opponent'>

export type MultiplayerPathStepOwner = GamePathStepOwner<'opponent'>

export type MultiplayerPathStep = GamePathStep<'opponent'>

export type MultiplayerGameMapMarkerOwner = GameMapMarkerOwner<'opponent'>

export type MultiplayerGameMapMarker = GameMapMarker<'opponent'>

export type GameStatus = 'waiting' | 'starting' | 'active' | 'finished'
