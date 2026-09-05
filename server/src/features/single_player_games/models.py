from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

Latitude = Annotated[float, Field(ge=-90, le=90)]
Longitude = Annotated[float, Field(ge=-180, le=180)]
GameStatus = Literal["ongoing", "completed"]
GameMode = Literal["single_player", "daily_challenge"]
SinglePlayerGamesSortBy = Literal["created_at", "completed_at"]
OrderBy = Literal["asc", "desc"]


class Coordinates(BaseModel):
    model_config = ConfigDict(extra="forbid")

    latitude: Latitude
    longitude: Longitude


class CreateSinglePlayerGameGuessInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    guess: Coordinates | None


class SinglePlayerGameRoundRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    round_number: int = Field(alias="roundNumber")
    image_id: str = Field(alias="imageId")
    target_latitude: float = Field(alias="targetLatitude")
    target_longitude: float = Field(alias="targetLongitude")
    started_at: datetime | None = Field(default=None, alias="startedAt")
    guess_latitude: float | None = Field(default=None, alias="guessLatitude")
    guess_longitude: float | None = Field(default=None, alias="guessLongitude")
    distance_km: float | None = Field(default=None, alias="distanceKm")
    score: int | None = None
    completed_at: datetime | None = Field(default=None, alias="completedAt")


class SinglePlayerGameRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    user_id: str = Field(alias="userId")
    game_mode: GameMode = Field(default="single_player", alias="gameMode")
    daily_challenge_id: str | None = Field(default=None, alias="dailyChallengeId")
    created_at: datetime = Field(alias="createdAt")
    completed_at: datetime | None = Field(default=None, alias="completedAt")
    rounds: list[SinglePlayerGameRoundRecord]


class SinglePlayerGameRoundResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    guess: Coordinates | None
    target: Coordinates
    distance_km: float | None = Field(alias="distanceKm")
    score: int
    completed_at: datetime = Field(alias="completedAt")


class SinglePlayerGameRound(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    round_number: int = Field(alias="roundNumber")
    image_id: str = Field(alias="imageId")
    started_at: datetime = Field(alias="startedAt")
    result: SinglePlayerGameRoundResult | None = None


class SinglePlayerGame(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    status: GameStatus
    current_round: int = Field(alias="currentRound")
    rounds: list[SinglePlayerGameRound]
    created_at: datetime = Field(alias="createdAt")
    completed_at: datetime | None = Field(default=None, alias="completedAt")


class SinglePlayerGameSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    total_score: int = Field(alias="totalScore")
    total_distance_km: float | None = Field(alias="totalDistanceKm")
    created_at: datetime = Field(alias="createdAt")
    completed_at: datetime = Field(alias="completedAt")
