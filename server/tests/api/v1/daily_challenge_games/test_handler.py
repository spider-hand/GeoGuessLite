import json
from datetime import UTC, date, datetime
from unittest.mock import MagicMock

from src.api.v1.daily_challenge_games import handler
from src.features.daily_challenges.models import (
    DailyChallengeGameSummary,
    DailyChallengeLeaderboardEntry,
    TodayDailyChallenge,
)
from src.features.single_player_games.models import SinglePlayerGame
from tests.factories.http_events import make_api_gateway_event

NOW = datetime(2026, 8, 30, tzinfo=UTC)


def make_game() -> SinglePlayerGame:
    return SinglePlayerGame.model_validate(
        {
            "id": "game-123",
            "status": "ongoing",
            "currentRound": 0,
            "rounds": [],
            "createdAt": NOW,
        }
    )


def test_get_today_returns_available_without_a_game(mocker):
    service = mocker.patch.object(handler, "_service")
    service.get_today.return_value = TodayDailyChallenge(
        date=date(2026, 8, 30),
        status="available",
    )

    response = handler.get_today_daily_challenge(make_api_gateway_event(), MagicMock())

    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == {"date": "2026-08-30", "status": "available"}


def test_create_daily_challenge_returns_created_game(mocker):
    service = mocker.patch.object(handler, "_service")
    service.create_or_resume_today.return_value = (make_game(), True)

    response = handler.create_daily_challenge_game(
        make_api_gateway_event(method="POST", raw_path="/api/v1/daily-challenge-games"),
        MagicMock(),
    )

    assert response["statusCode"] == 201
    assert json.loads(response["body"])["id"] == "game-123"


def test_get_daily_challenge_games_returns_recent_history(mocker):
    service = mocker.patch.object(handler, "_service")
    service.list_games.return_value = [
        DailyChallengeGameSummary(
            id="game-123", date=date(2026, 8, 30), totalScore=12345, completedAt=NOW
        )
    ]

    event = make_api_gateway_event()
    event["queryStringParameters"] = {
        "limit": "5",
        "sort_by": "created_at",
        "order_by": "asc",
    }
    response = handler.get_daily_challenge_games(event, MagicMock())

    assert response["statusCode"] == 200
    assert json.loads(response["body"])[0]["totalScore"] == 12345
    service.list_games.assert_called_once_with("user-123", 5, "created_at", "asc")


def test_get_daily_challenge_game_returns_completed_game(mocker):
    service = mocker.patch.object(handler, "_service")
    game = make_game()
    game.status = "completed"
    game.completed_at = NOW
    service.get_game.return_value = game
    event = make_api_gateway_event(path_parameters={"gameId": "game-123"})

    response = handler.get_daily_challenge_game(event, MagicMock())

    assert response["statusCode"] == 200
    service.get_game.assert_called_once_with("user-123", "game-123")


def test_get_daily_challenge_leaderboard_parses_the_date(mocker):
    service = mocker.patch.object(handler, "_service")
    service.get_leaderboard.return_value = [
        DailyChallengeLeaderboardEntry(
            rank=1,
            userId="user-123",
            displayName="Taylor",
            country="JP",
            totalScore=25000,
        )
    ]
    event = make_api_gateway_event()
    event["queryStringParameters"] = {"date": "2026-08-30"}

    response = handler.get_daily_challenge_leaderboard(event, MagicMock())

    assert response["statusCode"] == 200
    assert json.loads(response["body"])[0]["rank"] == 1
    service.get_leaderboard.assert_called_once_with(date(2026, 8, 30))


def test_get_daily_challenge_leaderboard_rejects_an_invalid_date(mocker):
    mocker.patch.object(handler, "_service")
    event = make_api_gateway_event()
    event["queryStringParameters"] = {"date": "not-a-date"}

    response = handler.get_daily_challenge_leaderboard(event, MagicMock())

    assert response["statusCode"] == 400
