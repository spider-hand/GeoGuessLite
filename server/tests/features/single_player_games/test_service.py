from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock

import pytest

from src.core.http import ApiError
from src.features.single_player_games.models import SinglePlayerGameRecord
from src.features.single_player_games.service import SinglePlayerGamesService

NOW = datetime(2026, 8, 23, 12, tzinfo=UTC)


def make_game(*, started_rounds=0, completed_rounds=0, completed=False) -> SinglePlayerGameRecord:
    rounds = []
    for round_number in range(1, 6):
        is_started = round_number <= started_rounds
        is_completed = round_number <= completed_rounds
        rounds.append(
            {
                "roundNumber": round_number,
                "imageId": f"image-{round_number}",
                "targetLatitude": 35.0 + round_number,
                "targetLongitude": 139.0 + round_number,
                "startedAt": NOW - timedelta(seconds=30) if is_started else None,
                "guessLatitude": 35.5 if is_completed else None,
                "guessLongitude": 139.5 if is_completed else None,
                "distanceKm": 10.0 if is_completed else None,
                "score": 4900 if is_completed else None,
                "completedAt": NOW - timedelta(seconds=10) if is_completed else None,
            }
        )
    return SinglePlayerGameRecord.model_validate(
        {
            "id": "game-123",
            "userId": "user-123",
            "createdAt": NOW - timedelta(minutes=10),
            "completedAt": NOW if completed else None,
            "rounds": rounds,
        }
    )


def test_create_game_prepares_five_images_without_exposing_rounds(mocker):
    repository = MagicMock()
    repository.get_random_panorama_ids.return_value = [f"image-{number}" for number in range(1, 11)]
    repository.create.return_value = make_game()
    values = {
        "image-2": (36.0, 140.0),
        "image-3": (37.0, 141.0),
        "image-4": (38.0, 142.0),
        "image-5": (39.0, 143.0),
        "image-6": (40.0, 144.0),
    }
    coordinates = mocker.patch(
        "src.features.single_player_games.service.get_image_coordinates",
        side_effect=lambda image_id: values.get(image_id),
    )

    game = SinglePlayerGamesService(repository).create_game("user-123")

    assert game.status == "ongoing"
    assert game.current_round == 0
    assert game.rounds == []
    assert coordinates.call_count == 10
    repository.get_random_panorama_ids.assert_called_once_with(10)
    created_game_id, user_id, prepared_rounds = repository.create.call_args.args
    assert created_game_id
    assert user_id == "user-123"
    assert prepared_rounds == [
        ("image-2", 36.0, 140.0),
        ("image-3", 37.0, 141.0),
        ("image-4", 38.0, 142.0),
        ("image-5", 39.0, 143.0),
        ("image-6", 40.0, 144.0),
    ]


def test_create_game_returns_503_when_five_images_cannot_be_prepared(mocker):
    repository = MagicMock()
    repository.get_random_panorama_ids.return_value = ["image-1", "image-2"]
    mocker.patch("src.features.single_player_games.service.get_image_coordinates", return_value=None)

    with pytest.raises(ApiError) as error:
        SinglePlayerGamesService(repository).create_game("user-123")

    assert error.value.status_code == 503
    assert error.value.code == "game_images_unavailable"
    repository.create.assert_not_called()


def test_get_game_returns_404_for_missing_or_unowned_game():
    repository = MagicMock()
    repository.get_by_id.return_value = None

    with pytest.raises(ApiError) as error:
        SinglePlayerGamesService(repository).get_game("user-123", "game-123")

    assert error.value.status_code == 404


def test_get_game_rejects_a_game_from_another_mode():
    repository = MagicMock()
    game = make_game()
    game.game_mode = "daily_challenge"
    game.daily_challenge_id = "challenge-123"
    repository.get_by_id.return_value = game

    with pytest.raises(ApiError) as error:
        SinglePlayerGamesService(repository).get_game("user-123", "game-123")

    assert error.value.status_code == 404


def test_get_game_exposes_only_started_rounds_and_hides_active_target():
    repository = MagicMock()
    repository.get_by_id.return_value = make_game(started_rounds=2, completed_rounds=1)

    game = SinglePlayerGamesService(repository).get_game("user-123", "game-123")

    assert game.current_round == 2
    assert len(game.rounds) == 2
    assert game.rounds[0].result.target.latitude == 36.0
    assert game.rounds[1].result is None


def test_start_round_starts_the_next_round():
    repository = MagicMock()
    repository.get_by_id.return_value = make_game(started_rounds=1, completed_rounds=1)
    repository.start_round.return_value = make_game(started_rounds=2, completed_rounds=1)
    service = SinglePlayerGamesService(repository, clock=lambda: NOW)

    game_round = service.start_round("user-123", "game-123", 2)

    assert game_round.round_number == 2
    assert game_round.result is None
    repository.start_round.assert_called_once_with("game-123", "user-123", 2, NOW)


def test_start_round_is_idempotent_without_resetting_started_at():
    repository = MagicMock()
    game = make_game(started_rounds=1)
    repository.get_by_id.return_value = game

    game_round = SinglePlayerGamesService(repository, clock=lambda: NOW).start_round("user-123", "game-123", 1)

    assert game_round.started_at == NOW - timedelta(seconds=30)
    repository.start_round.assert_not_called()


@pytest.mark.parametrize("round_number", [0, 2, 6])
def test_start_round_rejects_invalid_sequence(round_number):
    repository = MagicMock()
    repository.get_by_id.return_value = make_game(started_rounds=1)

    with pytest.raises(ApiError) as error:
        SinglePlayerGamesService(repository).start_round("user-123", "game-123", round_number)

    assert error.value.status_code == 409
    repository.start_round.assert_not_called()


def test_create_guess_scores_valid_coordinates_before_timeout():
    repository = MagicMock()
    repository.get_by_id.return_value = make_game(started_rounds=1)
    completed_game = make_game(started_rounds=1, completed_rounds=1)
    completed_game.rounds[0].guess_latitude = 36.0
    completed_game.rounds[0].guess_longitude = 140.0
    completed_game.rounds[0].distance_km = 0
    completed_game.rounds[0].score = 5000
    repository.complete_round.return_value = completed_game
    service = SinglePlayerGamesService(repository, clock=lambda: NOW)

    game_round = service.create_guess(
        "user-123",
        "game-123",
        1,
        {"guess": {"latitude": 36.0, "longitude": 140.0}},
    )

    assert game_round.result.score == 5000
    repository.complete_round.assert_called_once_with(
        "game-123",
        "user-123",
        1,
        completed_at=NOW,
        guess_latitude=36.0,
        guess_longitude=140.0,
        distance_km=0.0,
        score=5000,
    )


def test_create_guess_times_out_at_exactly_sixty_seconds():
    repository = MagicMock()
    game = make_game(started_rounds=1)
    game.rounds[0].started_at = NOW - timedelta(seconds=60)
    repository.get_by_id.return_value = game
    completed_game = make_game(started_rounds=1, completed_rounds=1)
    completed_game.rounds[0].guess_latitude = None
    completed_game.rounds[0].guess_longitude = None
    completed_game.rounds[0].distance_km = None
    completed_game.rounds[0].score = 0
    repository.complete_round.return_value = completed_game

    game_round = SinglePlayerGamesService(repository, clock=lambda: NOW).create_guess(
        "user-123",
        "game-123",
        1,
        {"guess": {"latitude": 36.0, "longitude": 140.0}},
    )

    assert game_round.result.guess is None
    assert game_round.result.distance_km is None
    assert game_round.result.score == 0
    assert repository.complete_round.call_args.kwargs["guess_latitude"] is None


def test_create_guess_rejects_null_guess_before_timeout():
    repository = MagicMock()
    repository.get_by_id.return_value = make_game(started_rounds=1)

    with pytest.raises(ApiError) as error:
        SinglePlayerGamesService(repository, clock=lambda: NOW).create_guess(
            "user-123", "game-123", 1, {"guess": None}
        )

    assert error.value.code == "round_not_expired"
    repository.complete_round.assert_not_called()


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"guess": {"latitude": 91, "longitude": 0}},
        {"guess": {"latitude": 0, "longitude": -181}},
        {"guess": {"latitude": 0}},
        {"guess": None, "score": 5000},
    ],
)
def test_create_guess_rejects_invalid_payload(payload):
    repository = MagicMock()

    with pytest.raises(ApiError) as error:
        SinglePlayerGamesService(repository).create_guess("user-123", "game-123", 1, payload)

    assert error.value.status_code == 400
    repository.get_by_id.assert_not_called()


def test_create_guess_returns_existing_result_for_duplicate_submission():
    repository = MagicMock()
    repository.get_by_id.return_value = make_game(started_rounds=1, completed_rounds=1)

    game_round = SinglePlayerGamesService(repository).create_guess(
        "user-123",
        "game-123",
        1,
        {"guess": {"latitude": 0, "longitude": 0}},
    )

    assert game_round.result.score == 4900
    repository.complete_round.assert_not_called()


def test_delete_expired_games_delegates_to_repository():
    repository = MagicMock()
    repository.delete_expired.return_value = 3

    assert SinglePlayerGamesService(repository).delete_expired_games() == 3
