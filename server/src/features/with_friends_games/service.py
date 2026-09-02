import copy
import random
from datetime import UTC, datetime
from http import HTTPStatus
from uuid import uuid4

from firebase_admin import db as firebase_db
from pydantic import ValidationError

from src.core.firebase import get_firebase_app
from src.core.game import (
    GAME_IMAGE_CANDIDATE_COUNT,
    GAME_ROUND_COUNT,
    calculate_distance,
    calculate_score,
)
from src.core.http import ApiError
from src.features.single_player_games.repository import SinglePlayerGamesRepository
from src.features.single_player_games.service import prepare_rounds
from src.features.users.models import UserRecord
from src.features.users.repository import UsersRepository
from src.features.with_friends_games.models import (
    CreateWithFriendsGameGuessInput,
    JoinWithFriendsGameInput,
    WithFriendsGameRecord,
)
from src.features.with_friends_games.queue import (
    enqueue_game_start,
    enqueue_round_advance,
    enqueue_round_timeout,
)
from src.features.with_friends_games.repository import WithFriendsGamesRepository


def _round_key(round_number: int) -> str:
    return f"round-{round_number}"


class WithFriendsGamesService:
    MAX_PLAYERS = 100
    ROUND_TIMEOUT_MS = 60_000
    RESULT_INTERVAL_MS = 15_000

    def __init__(
        self,
        repository: WithFriendsGamesRepository | None = None,
        users_repository: UsersRepository | None = None,
        images_repository: SinglePlayerGamesRepository | None = None,
        clock=None,
    ):
        self.repository = repository or WithFriendsGamesRepository()
        self.users_repository = users_repository or UsersRepository()
        self.images_repository = images_repository or SinglePlayerGamesRepository()
        self.clock = clock or (lambda: datetime.now(UTC))

    def _games_ref(self):
        return firebase_db.reference("withFriendsGames", app=get_firebase_app())

    def _game_ref(self, game_id: str):
        return self._games_ref().child(game_id)

    def _root_ref(self):
        return firebase_db.reference("/", app=get_firebase_app())

    def _now_ms(self) -> int:
        return int(self.clock().timestamp() * 1000)

    def _require_user(self, user_id: str) -> UserRecord:
        user = self.users_repository.get_by_id(user_id)
        if user is None:
            raise ApiError(HTTPStatus.NOT_FOUND, "user_not_found", "User was not found.")
        return user

    def _require_game(self, game_id: str) -> WithFriendsGameRecord:
        game = self.repository.get_by_id(game_id)
        if game is None:
            raise ApiError(
                HTTPStatus.NOT_FOUND,
                "with_friends_game_not_found",
                "With-friends game was not found.",
            )
        return game

    def _player_payload(self, user: UserRecord, *, is_host: bool) -> dict[str, object]:
        payload: dict[str, object] = {
            "userId": user.user_id,
            "displayName": user.display_name,
            "isConnected": True,
            "isHost": is_host,
            "guessStatus": "waiting",
            "totalScore": 0,
            "joinedAt": self._now_ms(),
        }
        if user.country is not None:
            payload["country"] = user.country
        return payload

    def _prepare_rounds(self) -> list[tuple[str, float, float]]:
        image_ids = self.images_repository.get_random_panorama_ids(GAME_IMAGE_CANDIDATE_COUNT)
        rounds = prepare_rounds(image_ids, GAME_ROUND_COUNT)
        if len(rounds) < GAME_ROUND_COUNT:
            raise ApiError(
                HTTPStatus.SERVICE_UNAVAILABLE,
                "game_images_unavailable",
                "Five playable images could not be prepared.",
            )
        return rounds

    def create_game(self, user_id: str) -> WithFriendsGameRecord:
        host = self._require_user(user_id)
        rounds = self._prepare_rounds()
        game_id = str(uuid4())
        game = None
        for _ in range(10):
            room_key = f"{random.randint(0, 999999):06d}"
            game = self.repository.create(game_id, room_key, user_id)
            if game is not None:
                break
        if game is None:
            raise RuntimeError("Failed to generate a unique room key.")

        now_ms = self._now_ms()
        payload = {
            "public": {
                "id": game.id,
                "roomKey": game.room_key,
                "hostUserId": user_id,
                "status": "waiting",
                "currentRound": 0,
                "players": {user_id: self._player_payload(host, is_host=True)},
                "rounds": {},
                "createdAt": now_ms,
                "updatedAt": now_ms,
            },
            "private": {
                "rounds": {
                    _round_key(round_number): {
                        "imageId": image_id,
                        "target": {"latitude": latitude, "longitude": longitude},
                        "guesses": {},
                    }
                    for round_number, (image_id, latitude, longitude) in enumerate(rounds, start=1)
                }
            },
        }
        try:
            self._game_ref(game.id).set(payload)
        except Exception:
            self.repository.delete([game.id])
            raise
        return game

    def join_game(self, user_id: str, payload: dict[str, object]) -> str:
        user = self._require_user(user_id)
        try:
            join_input = JoinWithFriendsGameInput.model_validate(payload)
        except ValidationError as error:
            raise ApiError(
                HTTPStatus.BAD_REQUEST,
                "invalid_request_body",
                "roomKey must be a six-digit string.",
            ) from error

        game = self.repository.get_by_room_key(join_input.room_key)
        if game is None:
            raise ApiError(
                HTTPStatus.NOT_FOUND,
                "with_friends_game_not_found",
                "With-friends game was not found.",
            )

        def apply_join(current: dict[str, object] | None):
            if current is None:
                raise ApiError(
                    HTTPStatus.NOT_FOUND,
                    "with_friends_game_not_found",
                    "With-friends game was not found.",
                )
            state = copy.deepcopy(current)
            public = state["public"]
            players = public.get("players", {})
            if user_id in players:
                players[user_id]["isConnected"] = True
                public["updatedAt"] = self._now_ms()
                return state
            if public["status"] != "waiting":
                raise ApiError(
                    HTTPStatus.CONFLICT,
                    "room_already_started",
                    "This room has already started.",
                )
            if len(players) >= self.MAX_PLAYERS:
                raise ApiError(HTTPStatus.CONFLICT, "with_friends_game_full", "This room is full.")
            players[user_id] = self._player_payload(user, is_host=False)
            public["players"] = players
            public["updatedAt"] = self._now_ms()
            return state

        self._game_ref(game.id).transaction(apply_join)
        return game.id

    def start_game(self, user_id: str, game_id: str) -> None:
        game = self._require_game(game_id)
        if game.host_user_id != user_id:
            raise ApiError(HTTPStatus.FORBIDDEN, "host_required", "Only the host can start this game.")
        now_ms = self._now_ms()
        should_enqueue_start = False

        def apply_start(current: dict[str, object] | None):
            nonlocal should_enqueue_start
            if current is None:
                raise ApiError(
                    HTTPStatus.NOT_FOUND,
                    "with_friends_game_not_found",
                    "With-friends game was not found.",
                )
            state = copy.deepcopy(current)
            public = state["public"]
            if public["status"] == "starting":
                should_enqueue_start = True
                return state
            if public["status"] == "guessing" and public["currentRound"] == 1:
                return state
            if public["status"] != "waiting":
                raise ApiError(HTTPStatus.CONFLICT, "invalid_game_state", "The game has already started.")
            # Only connected lobby members become participants; disconnected members are excluded.
            connected_players = {
                player_id: player
                for player_id, player in public.get("players", {}).items()
                if player.get("isConnected", False)
            }
            if user_id not in connected_players or len(connected_players) < 2:
                raise ApiError(
                    HTTPStatus.CONFLICT,
                    "opponent_required",
                    "At least one connected opponent is required.",
                )
            public.update(
                {
                    "status": "starting",
                    "players": connected_players,
                    "updatedAt": now_ms,
                }
            )
            should_enqueue_start = True
            return state

        self._game_ref(game_id).transaction(apply_start)
        if should_enqueue_start:
            enqueue_game_start(game_id)

    def process_game_start(self, game_id: str) -> None:
        game = self.repository.get_by_id(game_id)
        if game is None or game.result is not None:
            return
        now_ms = self._now_ms()
        should_enqueue_timeout = False

        def apply_start(current: dict[str, object] | None):
            nonlocal should_enqueue_timeout
            if current is None:
                return current
            state = copy.deepcopy(current)
            public = state["public"]
            if public["status"] != "starting":
                return state

            for player in public["players"].values():
                player["guessStatus"] = "guessing"
            private_round = state["private"]["rounds"][_round_key(1)]
            public.update(
                {
                    "status": "guessing",
                    "currentRound": 1,
                    "guessingEndsAt": now_ms + self.ROUND_TIMEOUT_MS,
                    "rounds": {
                        _round_key(1): {
                            "roundNumber": 1,
                            "imageId": private_round["imageId"],
                            "startedAt": now_ms,
                        }
                    },
                    "updatedAt": now_ms,
                }
            )
            should_enqueue_timeout = True
            return state

        self._game_ref(game_id).transaction(apply_start)
        if should_enqueue_timeout:
            enqueue_round_timeout(game_id, 1)

    def _reveal_round(self, state: dict[str, object], round_number: int, now_ms: int) -> None:
        public = state["public"]
        private_round = state["private"]["rounds"][_round_key(round_number)]
        target = private_round["target"]
        guesses = private_round.get("guesses", {})
        results: dict[str, dict[str, object]] = {}
        for player_id, player in public["players"].items():
            submitted = guesses.get(player_id)
            result: dict[str, object] = {"score": 0}
            if submitted is not None:
                guess = submitted["guess"]
                distance_km = calculate_distance(
                    (target["latitude"], target["longitude"]),
                    (guess["latitude"], guess["longitude"]),
                )
                score = calculate_score(distance_km)
                result.update({"guess": guess, "distanceKm": distance_km, "score": score})
            player["totalScore"] += result["score"]
            player["guessStatus"] = "revealed"
            results[player_id] = result

        public_round = public["rounds"][_round_key(round_number)]
        public_round.update(
            {
                "target": target,
                "results": results,
                "revealedAt": now_ms,
            }
        )
        if round_number == GAME_ROUND_COUNT:
            public.update(
                {
                    "status": "completed",
                    "completedAt": now_ms,
                    "updatedAt": now_ms,
                }
            )
        else:
            public.update(
                {
                    "status": "results",
                    "proceedToNextRoundAt": now_ms + self.RESULT_INTERVAL_MS,
                    "updatedAt": now_ms,
                }
            )
        public.pop("guessingEndsAt", None)

    def create_guess(
        self,
        user_id: str,
        game_id: str,
        round_number: int,
        payload: dict[str, object],
    ) -> None:
        self._require_game(game_id)
        try:
            guess_input = CreateWithFriendsGameGuessInput.model_validate(payload)
        except ValidationError as error:
            raise ApiError(
                HTTPStatus.BAD_REQUEST,
                "invalid_request_body",
                "guess must contain valid latitude and longitude values.",
            ) from error
        now_ms = self._now_ms()

        def apply_guess(current: dict[str, object] | None):
            if current is None:
                raise ApiError(
                    HTTPStatus.NOT_FOUND,
                    "with_friends_game_not_found",
                    "With-friends game was not found.",
                )
            state = copy.deepcopy(current)
            public = state["public"]
            players = public.get("players", {})
            if user_id not in players:
                raise ApiError(HTTPStatus.FORBIDDEN, "participant_required", "You are not a participant.")
            if not 1 <= round_number <= GAME_ROUND_COUNT:
                raise ApiError(HTTPStatus.CONFLICT, "invalid_game_state", "The round is invalid.")
            private_round = state["private"]["rounds"][_round_key(round_number)]
            guesses = private_round.get("guesses", {})
            if user_id in guesses:
                return state
            if public["status"] != "guessing" or public["currentRound"] != round_number:
                raise ApiError(HTTPStatus.CONFLICT, "invalid_game_state", "The round is not accepting guesses.")
            if now_ms >= public["guessingEndsAt"]:
                raise ApiError(HTTPStatus.CONFLICT, "round_expired", "The round has expired.")
            guesses[user_id] = {
                "guess": guess_input.guess.model_dump(mode="json"),
                "submittedAt": now_ms,
            }
            private_round["guesses"] = guesses
            players[user_id]["guessStatus"] = "guessed"
            public["updatedAt"] = now_ms
            if len(guesses) == len(players):
                self._reveal_round(state, round_number, now_ms)
            return state

        state = self._game_ref(game_id).transaction(apply_guess)
        public = state["public"]
        if public["status"] == "completed":
            self._archive_completed_game(game_id, state)
        elif public["status"] == "results" and public["currentRound"] == round_number:
            # Schedule the next round while players view the results.
            enqueue_round_advance(game_id, round_number)

    def process_round_timeout(self, game_id: str, round_number: int) -> None:
        game = self.repository.get_by_id(game_id)
        if game is None or game.result is not None:
            return
        now_ms = self._now_ms()

        def apply_timeout(current: dict[str, object] | None):
            if current is None:
                return current
            state = copy.deepcopy(current)
            public = state["public"]
            if (
                public["status"] == "guessing"
                and public["currentRound"] == round_number
                and now_ms >= public["guessingEndsAt"]
            ):
                self._reveal_round(state, round_number, now_ms)
            return state

        state = self._game_ref(game_id).transaction(apply_timeout)
        if state is None:
            return
        public = state["public"]
        if public["status"] == "completed":
            self._archive_completed_game(game_id, state)
        elif public["status"] == "results" and public["currentRound"] == round_number:
            # Schedule the next round while players view the results.
            enqueue_round_advance(game_id, round_number)

    def _build_archive(self, state: dict[str, object]) -> dict[str, object]:
        public = state["public"]
        players = sorted(public["players"].values(), key=lambda player: player["joinedAt"])
        rounds = []
        for round_number in range(1, GAME_ROUND_COUNT + 1):
            public_round = public["rounds"][_round_key(round_number)]
            rounds.append(
                {
                    "roundNumber": round_number,
                    "imageId": public_round["imageId"],
                    "target": public_round["target"],
                    "results": [
                        {"userId": player_id, **result}
                        for player_id, result in public_round["results"].items()
                    ],
                }
            )
        return {
            "players": [
                {
                    key: value
                    for key, value in player.items()
                    if key in {"userId", "displayName", "country", "joinedAt", "totalScore"}
                }
                for player in players
            ],
            "rounds": rounds,
        }

    def _archive_completed_game(self, game_id: str, state: dict[str, object]) -> None:
        completed_at = datetime.fromtimestamp(state["public"]["completedAt"] / 1000, UTC)
        self.repository.finish(game_id, self._build_archive(state), completed_at)

    def process_round_advance(self, game_id: str, round_number: int) -> None:
        game = self.repository.get_by_id(game_id)
        if game is None:
            return
        now_ms = self._now_ms()

        def apply_advance(current: dict[str, object] | None):
            if current is None:
                return current
            state = copy.deepcopy(current)
            public = state["public"]
            if public["status"] == "completed":
                return state
            if (
                public["status"] != "results"
                or public["currentRound"] != round_number
                or now_ms < public["proceedToNextRoundAt"]
            ):
                return state
            if round_number == GAME_ROUND_COUNT:
                public.update(
                    {
                        "status": "completed",
                        "completedAt": now_ms,
                        "updatedAt": now_ms,
                    }
                )
                public.pop("proceedToNextRoundAt", None)
                return state

            next_round_number = round_number + 1
            private_round = state["private"]["rounds"][_round_key(next_round_number)]
            for player in public["players"].values():
                player["guessStatus"] = "guessing"
            public["rounds"][_round_key(next_round_number)] = {
                "roundNumber": next_round_number,
                "imageId": private_round["imageId"],
                "startedAt": now_ms,
            }
            public.update(
                {
                    "status": "guessing",
                    "currentRound": next_round_number,
                    "guessingEndsAt": now_ms + self.ROUND_TIMEOUT_MS,
                    "updatedAt": now_ms,
                }
            )
            public.pop("proceedToNextRoundAt", None)
            return state

        state = self._game_ref(game_id).transaction(apply_advance)
        if state is None:
            return
        public = state["public"]
        if public["status"] == "completed":
            self._archive_completed_game(game_id, state)
            return
        # Schedule the guessing timeout when the next round starts.
        if public["status"] == "guessing" and public["currentRound"] == round_number + 1:
            enqueue_round_timeout(game_id, public["currentRound"])

    def delete_expired_games(self) -> int:
        game_ids = self.repository.get_expired_ids()
        if not game_ids:
            return 0
        self._root_ref().update({f"withFriendsGames/{game_id}": None for game_id in game_ids})
        return self.repository.delete(game_ids)
