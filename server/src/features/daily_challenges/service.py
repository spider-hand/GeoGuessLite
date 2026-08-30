from datetime import UTC, datetime, timedelta
from http import HTTPStatus
from uuid import uuid4

from src.core.game import GAME_IMAGE_CANDIDATE_COUNT, GAME_ROUND_COUNT
from src.core.http import ApiError
from src.features.daily_challenges.models import TodayDailyChallenge
from src.features.daily_challenges.repository import DailyChallengesRepository
from src.features.single_player_games.models import SinglePlayerGame, SinglePlayerGameRound
from src.features.single_player_games.repository import SinglePlayerGamesRepository
from src.features.single_player_games.service import SinglePlayerGamesService, prepare_rounds


class DailyChallengesService:
    def __init__(
        self,
        challenge_repository: DailyChallengesRepository | None = None,
        game_repository: SinglePlayerGamesRepository | None = None,
        clock=None,
    ):
        self.challenge_repository = challenge_repository or DailyChallengesRepository()
        self.game_repository = game_repository or SinglePlayerGamesRepository()
        self.clock = clock or (lambda: datetime.now(UTC))
        self.game_service = SinglePlayerGamesService(
            self.game_repository,
            clock=self.clock,
            game_mode="daily_challenge",
        )

    def _today_challenge(self):
        challenge = self.challenge_repository.get_by_date(self.clock().date())
        if challenge is None:
            raise ApiError(
                HTTPStatus.NOT_FOUND,
                "daily_challenge_unavailable",
                "Today's daily challenge is unavailable.",
            )
        return challenge

    def get_today(self, user_id: str) -> TodayDailyChallenge:
        challenge = self._today_challenge()
        record = self.game_repository.get_by_daily_challenge(challenge.id, user_id)
        if record is None:
            return TodayDailyChallenge(date=challenge.date, status="available")
        game = self.game_service.get_game(user_id, record.id)
        return TodayDailyChallenge(date=challenge.date, status=game.status, game=game)

    def create_or_resume_today(self, user_id: str) -> tuple[SinglePlayerGame, bool]:
        challenge = self._today_challenge()
        existing = self.game_repository.get_by_daily_challenge(challenge.id, user_id)
        if existing is not None:
            game = self.game_service.get_game(user_id, existing.id)
            if game.status == "completed":
                raise ApiError(
                    HTTPStatus.CONFLICT,
                    "daily_challenge_already_completed",
                    "Today's daily challenge has already been completed.",
                )
            return game, False

        rounds = [
            (round_record.image_id, round_record.target_latitude, round_record.target_longitude)
            for round_record in challenge.rounds
        ]
        record, created = self.game_repository.create_daily(str(uuid4()), user_id, challenge.id, rounds)
        game = self.game_service.get_game(user_id, record.id)
        if game.status == "completed":
            raise ApiError(
                HTTPStatus.CONFLICT,
                "daily_challenge_already_completed",
                "Today's daily challenge has already been completed.",
            )
        return game, created

    def start_round(self, user_id: str, game_id: str, round_number: int) -> SinglePlayerGameRound:
        return self.game_service.start_round(user_id, game_id, round_number)

    def create_guess(
        self,
        user_id: str,
        game_id: str,
        round_number: int,
        payload: dict[str, object],
    ) -> SinglePlayerGameRound:
        return self.game_service.create_guess(user_id, game_id, round_number, payload)

    def create_tomorrow(self):
        challenge_date = self.clock().date() + timedelta(days=1)
        existing = self.challenge_repository.get_by_date(challenge_date)
        if existing is not None:
            return existing
        image_ids = self.game_repository.get_random_panorama_ids(GAME_IMAGE_CANDIDATE_COUNT)
        rounds = prepare_rounds(image_ids, GAME_ROUND_COUNT)
        if len(rounds) < GAME_ROUND_COUNT:
            raise ApiError(
                HTTPStatus.SERVICE_UNAVAILABLE,
                "game_images_unavailable",
                "Five playable images could not be prepared.",
            )
        return self.challenge_repository.create(challenge_date, rounds)

    def delete_expired(self) -> int:
        cutoff = self.clock().date() - timedelta(days=29)
        return self.challenge_repository.delete_before(cutoff)
