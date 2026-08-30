import json
from datetime import UTC, date, datetime
from unittest.mock import MagicMock

from src.api.v1.daily_challenge_games import handler
from src.features.daily_challenges.models import TodayDailyChallenge
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
