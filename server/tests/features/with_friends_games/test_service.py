import copy
from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock

import pytest

from src.core.http import ApiError
from src.features.users.models import UserRecord
from src.features.with_friends_games.models import WithFriendsGameRecord
from src.features.with_friends_games.service import WithFriendsGamesService


class FakeReference:
    def __init__(self, value=None):
        self.value = value
        self.updates = []

    def set(self, value):
        self.value = copy.deepcopy(value)

    def transaction(self, callback):
        self.value = callback(copy.deepcopy(self.value))
        return copy.deepcopy(self.value)

    def update(self, value):
        self.updates.append(value)


def make_user(user_id="host", name="Host"):
    return UserRecord.model_validate(
        {
            "userId": user_id,
            "displayName": name,
            "country": "JP",
            "createdAt": "2026-08-31T00:00:00Z",
            "updatedAt": "2026-08-31T00:00:00Z",
        }
    )


def make_game(result=None):
    return WithFriendsGameRecord.model_validate(
        {
            "id": "game-1",
            "roomKey": "123456",
            "hostUserId": "host",
            "result": result,
            "createdAt": "2026-08-31T00:00:00Z",
        }
    )


def make_state(*, status="waiting", current_round=0, players=None):
    players = players or {
        "host": {
            "userId": "host",
            "displayName": "Host",
            "country": "JP",
            "isConnected": True,
            "isHost": True,
            "guessStatus": "waiting",
            "totalScore": 0,
            "joinedAt": 1,
        },
        "guest": {
            "userId": "guest",
            "displayName": "Guest",
            "country": "US",
            "isConnected": True,
            "isHost": False,
            "guessStatus": "waiting",
            "totalScore": 0,
            "joinedAt": 2,
        },
    }
    private_rounds = {
        f"round-{round_number}": {
            "imageId": f"image-{round_number}",
            "target": {"latitude": 35.0, "longitude": 139.0},
            "guesses": {},
        }
        for round_number in range(1, 6)
    }
    public_rounds = {}
    public = {
        "id": "game-1",
        "roomKey": "123456",
        "hostUserId": "host",
        "status": status,
        "currentRound": current_round,
        "players": players,
        "rounds": public_rounds,
        "createdAt": 1,
        "updatedAt": 1,
    }
    if status in ("guessing", "results"):
        public.update(
            {
                "rounds": {
                    f"round-{current_round}": {
                        "roundNumber": current_round,
                        "imageId": f"image-{current_round}",
                        "startedAt": 1_700_000_000_000,
                    }
                },
            }
        )
        deadline_key = "guessingEndsAt" if status == "guessing" else "proceedToNextRoundAt"
        public[deadline_key] = 1_800_000_000_000
        for player in players.values():
            player["guessStatus"] = "guessing"
    return {"public": public, "private": {"rounds": private_rounds}}


def make_service(state, now=None):
    repository = MagicMock()
    repository.get_by_id.return_value = make_game()
    users_repository = MagicMock()
    users_repository.get_by_id.side_effect = lambda user_id: make_user(user_id, user_id.title())
    game_ref = FakeReference(state)
    service = WithFriendsGamesService(
        repository=repository,
        users_repository=users_repository,
        images_repository=MagicMock(),
        clock=lambda: now or datetime(2026, 8, 31, tzinfo=UTC),
    )
    service._game_ref = MagicMock(return_value=game_ref)
    return service, repository, game_ref


def test_create_game_retries_room_key_and_keeps_targets_private(monkeypatch):
    repository = MagicMock()
    repository.create.side_effect = [None, make_game()]
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = make_user()
    images_repository = MagicMock()
    images_repository.get_random_panorama_ids.return_value = ["image"] * 10
    service = WithFriendsGamesService(
        repository=repository,
        users_repository=users_repository,
        images_repository=images_repository,
        clock=lambda: datetime(2026, 8, 31, tzinfo=UTC),
    )
    game_ref = FakeReference()
    service._game_ref = MagicMock(return_value=game_ref)
    monkeypatch.setattr(
        "src.features.with_friends_games.service.prepare_rounds",
        lambda image_ids, count: [(f"image-{number}", 35.0, 139.0) for number in range(1, 6)],
    )
    random_values = iter((111111, 123456))
    monkeypatch.setattr(
        "src.features.with_friends_games.service.random.randint",
        lambda start, end: next(random_values),
    )

    game = service.create_game("host")

    assert game.id == "game-1"
    assert repository.create.call_args_list[0].args[1] == "111111"
    assert repository.create.call_args_list[1].args[1] == "123456"
    assert game_ref.value["public"]["rounds"] == {}
    assert set(game_ref.value["private"]["rounds"]) == {
        "round-1",
        "round-2",
        "round-3",
        "round-4",
        "round-5",
    }
    assert game_ref.value["private"]["rounds"]["round-1"]["target"] == {
        "latitude": 35.0,
        "longitude": 139.0,
    }


def test_join_game_rejects_the_101st_player():
    players = {
        f"user-{number}": {"userId": f"user-{number}", "isConnected": True}
        for number in range(100)
    }
    service, repository, _ = make_service(make_state(players=players))
    repository.get_by_room_key.return_value = make_game()

    with pytest.raises(ApiError) as error:
        service.join_game("new-user", {"roomKey": "123456"})

    assert error.value.code == "with_friends_game_full"


def test_start_game_exposes_only_the_current_image_and_enqueues_timeout(monkeypatch):
    service, _, game_ref = make_service(make_state())
    enqueue = MagicMock()
    monkeypatch.setattr("src.features.with_friends_games.service.enqueue_round_timeout", enqueue)

    service.start_game("host", "game-1")

    public = game_ref.value["public"]
    assert public["status"] == "guessing"
    assert public["rounds"]["round-1"] == {
        "roundNumber": 1,
        "imageId": "image-1",
        "startedAt": 1788134400000,
    }
    assert "target" not in public["rounds"]["round-1"]
    enqueue.assert_called_once_with("game-1", 1)


def test_last_guess_reveals_results_early_and_enqueues_advance(monkeypatch):
    state = make_state(status="guessing", current_round=1)
    state["private"]["rounds"]["round-1"]["guesses"]["host"] = {
        "guess": {"latitude": 35.0, "longitude": 139.0},
        "submittedAt": 1,
    }
    service, _, game_ref = make_service(state)
    enqueue = MagicMock()
    monkeypatch.setattr("src.features.with_friends_games.service.enqueue_round_advance", enqueue)

    service.create_guess(
        "guest",
        "game-1",
        1,
        {"guess": {"latitude": 36.0, "longitude": 140.0}},
    )

    public = game_ref.value["public"]
    assert public["status"] == "results"
    assert public["rounds"]["round-1"]["target"] == {"latitude": 35.0, "longitude": 139.0}
    assert set(public["rounds"]["round-1"]["results"]) == {"host", "guest"}
    enqueue.assert_called_once_with("game-1", 1)


def test_timeout_gives_missing_players_zero_points(monkeypatch):
    now = datetime(2026, 8, 31, tzinfo=UTC)
    state = make_state(status="guessing", current_round=1)
    state["public"]["guessingEndsAt"] = int((now - timedelta(seconds=1)).timestamp() * 1000)
    service, _, game_ref = make_service(state, now)
    enqueue = MagicMock()
    monkeypatch.setattr("src.features.with_friends_games.service.enqueue_round_advance", enqueue)

    service.process_round_timeout("game-1", 1)

    results = game_ref.value["public"]["rounds"]["round-1"]["results"]
    assert results["host"] == {"score": 0}
    assert results["guest"] == {"score": 0}
    enqueue.assert_called_once()


def test_final_round_advance_archives_the_completed_game():
    now = datetime(2026, 8, 31, tzinfo=UTC)
    state = make_state(status="results", current_round=5)
    state["public"]["proceedToNextRoundAt"] = int((now - timedelta(seconds=1)).timestamp() * 1000)
    for round_number in range(1, 6):
        state["public"]["rounds"][f"round-{round_number}"] = {
            "roundNumber": round_number,
            "imageId": f"image-{round_number}",
            "startedAt": 1,
            "revealedAt": 2,
            "target": {"latitude": 35.0, "longitude": 139.0},
            "results": {"host": {"score": 0}, "guest": {"score": 0}},
        }
    service, repository, game_ref = make_service(state, now)

    service.process_round_advance("game-1", 5)

    assert game_ref.value["public"]["status"] == "completed"
    archive = repository.finish.call_args.args[1]
    assert len(archive["players"]) == 2
    assert len(archive["rounds"]) == 5


def test_cleanup_deletes_realtime_state_before_postgres():
    service, repository, _ = make_service(make_state())
    repository.get_expired_ids.return_value = ["game-1"]
    repository.delete.return_value = 1
    root_ref = FakeReference()
    service._root_ref = MagicMock(return_value=root_ref)

    assert service.delete_expired_games() == 1
    assert root_ref.updates == [{"withFriendsGames/game-1": None}]
    repository.delete.assert_called_once_with(["game-1"])
