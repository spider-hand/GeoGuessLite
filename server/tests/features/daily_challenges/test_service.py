from datetime import UTC, date, datetime, timedelta
from unittest.mock import MagicMock

import pytest

from src.core.http import ApiError
from src.features.daily_challenges.models import DailyChallengeRecord
from src.features.daily_challenges.service import DailyChallengesService
from src.features.single_player_games.models import SinglePlayerGameRecord

NOW = datetime(2026, 8, 30, 12, tzinfo=UTC)


def make_challenge(challenge_date: date = NOW.date()) -> DailyChallengeRecord:
    return DailyChallengeRecord.model_validate(
        {
            "id": "challenge-123",
            "date": challenge_date,
            "rounds": [
                {
                    "roundNumber": number,
                    "imageId": f"image-{number}",
                    "targetLatitude": 35 + number,
                    "targetLongitude": 139 + number,
                }
                for number in range(1, 6)
            ],
        }
    )


def make_game(*, completed: bool = False) -> SinglePlayerGameRecord:
    return SinglePlayerGameRecord.model_validate(
        {
            "id": "game-123",
            "userId": "user-123",
            "gameMode": "daily_challenge",
            "dailyChallengeId": "challenge-123",
            "createdAt": NOW,
            "completedAt": NOW if completed else None,
            "rounds": [
                {
                    "roundNumber": number,
                    "imageId": f"image-{number}",
                    "targetLatitude": 35 + number,
                    "targetLongitude": 139 + number,
                }
                for number in range(1, 6)
            ],
        }
    )


def make_service(challenge_repository, game_repository):
    return DailyChallengesService(challenge_repository, game_repository, clock=lambda: NOW)


def test_get_today_returns_available_without_an_attempt():
    challenges = MagicMock()
    games = MagicMock()
    challenges.get_by_date.return_value = make_challenge()
    games.get_by_daily_challenge.return_value = None

    today = make_service(challenges, games).get_today("user-123")

    assert today.status == "available"
    assert today.game is None


def test_get_today_rejects_a_missing_scheduled_challenge():
    challenges = MagicMock()
    challenges.get_by_date.return_value = None

    with pytest.raises(ApiError) as error:
        make_service(challenges, MagicMock()).get_today("user-123")

    assert error.value.code == "daily_challenge_unavailable"


def test_create_today_copies_the_shared_template_rounds():
    challenges = MagicMock()
    games = MagicMock()
    challenge = make_challenge()
    game = make_game()
    challenges.get_by_date.return_value = challenge
    games.get_by_daily_challenge.return_value = None
    games.create_daily.return_value = (game, True)
    games.get_by_id.return_value = game

    public_game, created = make_service(challenges, games).create_or_resume_today("user-123")

    assert created is True
    assert public_game.status == "ongoing"
    games.create_daily.assert_called_once()
    assert games.create_daily.call_args.args[3] == [
        (f"image-{number}", 35 + number, 139 + number) for number in range(1, 6)
    ]


def test_create_today_resumes_an_unfinished_attempt():
    challenges = MagicMock()
    games = MagicMock()
    game = make_game()
    challenges.get_by_date.return_value = make_challenge()
    games.get_by_daily_challenge.return_value = game
    games.get_by_id.return_value = game

    public_game, created = make_service(challenges, games).create_or_resume_today("user-123")

    assert created is False
    assert public_game.id == "game-123"
    games.create_daily.assert_not_called()


def test_create_today_rejects_a_completed_attempt():
    challenges = MagicMock()
    games = MagicMock()
    game = make_game(completed=True)
    challenges.get_by_date.return_value = make_challenge()
    games.get_by_daily_challenge.return_value = game
    games.get_by_id.return_value = game

    with pytest.raises(ApiError) as error:
        make_service(challenges, games).create_or_resume_today("user-123")

    assert error.value.code == "daily_challenge_already_completed"


def test_create_tomorrow_is_idempotent():
    challenges = MagicMock()
    games = MagicMock()
    existing = make_challenge(NOW.date() + timedelta(days=1))
    challenges.get_by_date.return_value = existing

    assert make_service(challenges, games).create_tomorrow() == existing
    games.get_random_panorama_ids.assert_not_called()


def test_delete_expired_keeps_today_and_the_previous_twenty_nine_dates():
    challenges = MagicMock()
    challenges.delete_before.return_value = 3

    deleted = make_service(challenges, MagicMock()).delete_expired()

    assert deleted == 3
    challenges.delete_before.assert_called_once_with(NOW.date() - timedelta(days=29))


def test_list_games_passes_the_requested_list_options():
    challenges = MagicMock()
    challenges.list_completed_for_user.return_value = ["game"]
    service = make_service(challenges, MagicMock())

    assert service.list_games("user-123", 5, "created_at", "asc") == ["game"]
    challenges.list_completed_for_user.assert_called_once_with(
        "user-123", 5, "created_at", "asc"
    )


def test_get_game_returns_only_a_completed_daily_challenge():
    challenges = MagicMock()
    games = MagicMock()
    completed = make_game(completed=True)
    games.get_by_id.return_value = completed

    game = make_service(challenges, games).get_game("user-123", "game-123")

    assert game.status == "completed"


def test_get_game_rejects_an_ongoing_daily_challenge():
    games = MagicMock()
    games.get_by_id.return_value = make_game()

    with pytest.raises(ApiError) as error:
        make_service(MagicMock(), games).get_game("user-123", "game-123")

    assert error.value.code == "daily_challenge_game_not_found"


@pytest.mark.parametrize("offset", [-7, 1])
def test_get_leaderboard_rejects_dates_outside_the_last_seven_days(offset):
    with pytest.raises(ApiError) as error:
        make_service(MagicMock(), MagicMock()).get_leaderboard(NOW.date() + timedelta(days=offset))

    assert error.value.code == "invalid_challenge_date"


@pytest.mark.parametrize("offset", [-6, 0])
def test_get_leaderboard_accepts_the_seven_day_boundaries(offset):
    challenges = MagicMock()
    challenges.get_leaderboard.return_value = ["entry"]

    result = make_service(challenges, MagicMock()).get_leaderboard(
        NOW.date() + timedelta(days=offset)
    )

    assert result == ["entry"]
    challenges.get_leaderboard.assert_called_once_with(NOW.date() + timedelta(days=offset), 10)
