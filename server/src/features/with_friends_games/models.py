from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from src.features.single_player_games.models import Coordinates

RoomKey = Annotated[str, StringConstraints(pattern=r"^\d{6}$")]


class WithFriendsGameRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    room_key: RoomKey = Field(alias="roomKey")
    host_user_id: str | None = Field(alias="hostUserId")
    # Archive shape: {players: [{userId, displayName, country?, joinedAt, totalScore}],
    # rounds: [{roundNumber, imageId, target, results:
    # [{userId, guess?, distanceKm?, score}]}]}.
    result: dict[str, object] | None = None
    created_at: datetime = Field(alias="createdAt")
    completed_at: datetime | None = Field(default=None, alias="completedAt")


class JoinWithFriendsGameInput(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    room_key: RoomKey = Field(alias="roomKey")


class CreateWithFriendsGameGuessInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    guess: Coordinates
