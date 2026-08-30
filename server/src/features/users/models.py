from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, StringConstraints

DisplayName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]
CountryCode = Annotated[
    str,
    BeforeValidator(lambda value: value.strip().upper() if isinstance(value, str) else value),
    StringConstraints(min_length=2, max_length=2, pattern=r"^[A-Z]{2}$"),
]
DistanceUnit = Literal["km", "mile"]
DailyChallengeStatus = Literal["available", "ongoing", "completed", "unavailable"]


class UserRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: str = Field(alias="userId")
    display_name: str = Field(alias="displayName")
    country: CountryCode | None = None
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class CurrentUserRecord(UserRecord):
    games_played: int = Field(alias="gamesPlayed")
    best_score: int = Field(alias="bestScore")
    average_score: float = Field(alias="averageScore")
    distance_unit: DistanceUnit = Field(alias="distanceUnit")
    daily_challenge_status: DailyChallengeStatus = Field(alias="dailyChallengeStatus")


class CreateUserInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    display_name: DisplayName = Field(alias="displayName")
    country: CountryCode | None = None


class UpdateUserInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    display_name: DisplayName | None = Field(default=None, alias="displayName")
    country: CountryCode | None = None
    distance_unit: DistanceUnit | None = Field(default=None, alias="distanceUnit")
