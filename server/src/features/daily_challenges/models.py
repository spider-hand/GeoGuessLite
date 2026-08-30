from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from src.features.single_player_games.models import SinglePlayerGame


class DailyChallengeRoundRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    round_number: int = Field(alias="roundNumber")
    image_id: str = Field(alias="imageId")
    target_latitude: float = Field(alias="targetLatitude")
    target_longitude: float = Field(alias="targetLongitude")


class DailyChallengeRecord(BaseModel):
    id: str
    date: date
    rounds: list[DailyChallengeRoundRecord]


class TodayDailyChallenge(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    date: date
    status: Literal["available", "ongoing", "completed"]
    game: SinglePlayerGame | None = None
