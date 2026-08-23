from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from http import HTTPStatus
from uuid import uuid4

from pydantic import ValidationError

from src.core.game import calculate_distance, calculate_score, get_image_coordinates
from src.core.http import ApiError
from src.features.single_player_games.models import (
    CreateSinglePlayerGameGuessInput,
    OrderBy,
    SinglePlayerGame,
    SinglePlayerGameRecord,
    SinglePlayerGameRound,
    SinglePlayerGameRoundRecord,
    SinglePlayerGameRoundResult,
    SinglePlayerGamesSortBy,
    SinglePlayerGameSummary,
)
from src.features.single_player_games.repository import SinglePlayerGamesRepository


class SinglePlayerGamesService:
    ROUND_COUNT = 5
    IMAGE_CANDIDATE_COUNT = ROUND_COUNT * 2
    ROUND_TIMEOUT = timedelta(seconds=60)

    def __init__(self, repository: SinglePlayerGamesRepository | None = None, clock=None):
        self.repository = repository or SinglePlayerGamesRepository()
        self.clock = clock or (lambda: datetime.now(UTC))

    def _not_found(self) -> ApiError:
        return ApiError(HTTPStatus.NOT_FOUND, "single_player_game_not_found", "Single-player game was not found.")

    def _invalid_state(self) -> ApiError:
        return ApiError(HTTPStatus.CONFLICT, "invalid_game_state", "The game is not ready for this action.")

    def _require_game(self, user_id: str, game_id: str) -> SinglePlayerGameRecord:
        game = self.repository.get_by_id(game_id, user_id)
        if game is None:
            raise self._not_found()
        return game

    def _public_round(self, round_record: SinglePlayerGameRoundRecord) -> SinglePlayerGameRound:
        if round_record.started_at is None:
            raise ValueError("Cannot expose an unstarted round.")
        result = None
        if round_record.completed_at is not None:
            guess = None
            if round_record.guess_latitude is not None and round_record.guess_longitude is not None:
                guess = {"latitude": round_record.guess_latitude, "longitude": round_record.guess_longitude}
            result = SinglePlayerGameRoundResult.model_validate(
                {
                    "guess": guess,
                    "target": {
                        "latitude": round_record.target_latitude,
                        "longitude": round_record.target_longitude,
                    },
                    "distanceKm": round_record.distance_km,
                    "score": round_record.score,
                    "completedAt": round_record.completed_at,
                }
            )
        return SinglePlayerGameRound.model_validate(
            {
                "roundNumber": round_record.round_number,
                "imageId": round_record.image_id,
                "startedAt": round_record.started_at,
                "result": result,
            }
        )

    def _public_game(self, game: SinglePlayerGameRecord) -> SinglePlayerGame:
        started_rounds = [round_record for round_record in game.rounds if round_record.started_at is not None]
        return SinglePlayerGame.model_validate(
            {
                "id": game.id,
                "status": "completed" if game.completed_at is not None else "ongoing",
                "currentRound": max((round_record.round_number for round_record in started_rounds), default=0),
                "rounds": [self._public_round(round_record) for round_record in started_rounds],
                "createdAt": game.created_at,
                "completedAt": game.completed_at,
            }
        )

    def create_game(self, user_id: str) -> SinglePlayerGame:
        prepared_rounds: list[tuple[str, float, float]] = []
        image_ids = self.repository.get_random_panorama_ids(self.IMAGE_CANDIDATE_COUNT)
        with ThreadPoolExecutor(max_workers=self.ROUND_COUNT) as executor:
            coordinates_by_image = executor.map(get_image_coordinates, image_ids)
        for image_id, coordinates in zip(image_ids, coordinates_by_image, strict=True):
            if coordinates is not None:
                prepared_rounds.append((image_id, *coordinates))
            if len(prepared_rounds) == self.ROUND_COUNT:
                break
        if len(prepared_rounds) < self.ROUND_COUNT:
            raise ApiError(
                HTTPStatus.SERVICE_UNAVAILABLE,
                "game_images_unavailable",
                "Five playable images could not be prepared.",
            )
        return self._public_game(self.repository.create(str(uuid4()), user_id, prepared_rounds))

    def get_game(self, user_id: str, game_id: str) -> SinglePlayerGame:
        return self._public_game(self._require_game(user_id, game_id))

    def list_games(
        self,
        user_id: str,
        limit: int,
        sort_by: SinglePlayerGamesSortBy,
        order_by: OrderBy,
    ) -> list[SinglePlayerGameSummary]:
        return self.repository.list_completed(user_id, limit, sort_by, order_by)

    def start_round(self, user_id: str, game_id: str, round_number: int) -> SinglePlayerGameRound:
        game = self._require_game(user_id, game_id)
        if game.completed_at is not None or not 1 <= round_number <= self.ROUND_COUNT:
            raise self._invalid_state()
        target_round = game.rounds[round_number - 1]
        started_rounds = [round_record for round_record in game.rounds if round_record.started_at is not None]
        current_round = max((round_record.round_number for round_record in started_rounds), default=0)
        if target_round.started_at is not None:
            if target_round.completed_at is None and round_number == current_round:
                return self._public_round(target_round)
            raise self._invalid_state()
        if round_number != current_round + 1 or (
            current_round and game.rounds[current_round - 1].completed_at is None
        ):
            raise self._invalid_state()
        updated_game = self.repository.start_round(game_id, user_id, round_number, self.clock())
        if updated_game is None:
            raise self._not_found()
        updated_round = updated_game.rounds[round_number - 1]
        if updated_round.started_at is None:
            raise self._invalid_state()
        return self._public_round(updated_round)

    def create_guess(
        self,
        user_id: str,
        game_id: str,
        round_number: int,
        payload: dict[str, object],
    ) -> SinglePlayerGameRound:
        try:
            guess_input = CreateSinglePlayerGameGuessInput.model_validate(payload)
        except ValidationError as error:
            raise ApiError(
                HTTPStatus.BAD_REQUEST,
                "invalid_request_body",
                "guess must be null or contain valid latitude and longitude values.",
            ) from error
        game = self._require_game(user_id, game_id)
        if not 1 <= round_number <= self.ROUND_COUNT:
            raise self._invalid_state()
        round_record = game.rounds[round_number - 1]
        if round_record.completed_at is not None:
            return self._public_round(round_record)
        if game.completed_at is not None or round_record.started_at is None:
            raise self._invalid_state()

        completed_at = self.clock()
        expired = completed_at >= round_record.started_at + self.ROUND_TIMEOUT
        if guess_input.guess is None and not expired:
            raise ApiError(HTTPStatus.CONFLICT, "round_not_expired", "The active round has not expired.")

        guess_latitude = guess_input.guess.latitude if guess_input.guess is not None and not expired else None
        guess_longitude = guess_input.guess.longitude if guess_input.guess is not None and not expired else None
        distance_km = None
        score = 0
        if guess_latitude is not None and guess_longitude is not None:
            distance_km = calculate_distance(
                (round_record.target_latitude, round_record.target_longitude),
                (guess_latitude, guess_longitude),
            )
            score = calculate_score(distance_km)

        updated_game = self.repository.complete_round(
            game_id,
            user_id,
            round_number,
            completed_at=completed_at,
            guess_latitude=guess_latitude,
            guess_longitude=guess_longitude,
            distance_km=distance_km,
            score=score,
        )
        if updated_game is None:
            raise self._not_found()
        updated_round = updated_game.rounds[round_number - 1]
        if updated_round.completed_at is None:
            raise self._invalid_state()
        return self._public_round(updated_round)

    def delete_expired_games(self) -> int:
        return self.repository.delete_expired()
