import json
from datetime import UTC, datetime
from unittest.mock import MagicMock

from src.api.v1.single_player_games import handler
from src.core.http import ApiError
from src.features.single_player_games.models import (
    SinglePlayerGame,
    SinglePlayerGameRound,
    SinglePlayerGameRoundResult,
    SinglePlayerGameSummary,
)
from tests.factories.http_events import make_api_gateway_event

NOW = datetime(2026, 8, 23, tzinfo=UTC)


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


def make_round() -> SinglePlayerGameRound:
    return SinglePlayerGameRound.model_validate(
        {"roundNumber": 1, "imageId": "image-1", "startedAt": NOW}
    )


def test_create_single_player_game_returns_public_game(mocker):
    service = mocker.patch.object(handler, "_service")
    service.create_game.return_value = make_game()

    response = handler.create_single_player_game(
        make_api_gateway_event(method="POST", raw_path="/api/v1/single-player-games"),
        MagicMock(),
    )

    assert response["statusCode"] == 201
    assert json.loads(response["body"]) == {
        "id": "game-123",
        "status": "ongoing",
        "currentRound": 0,
        "rounds": [],
        "createdAt": "2026-08-23T00:00:00Z",
    }
    service.create_game.assert_called_once_with("user-123")


def test_get_single_player_game_omits_active_result_and_completed_at(mocker):
    service = mocker.patch.object(handler, "_service")
    game = make_game()
    game.current_round = 1
    game.rounds = [make_round()]
    service.get_game.return_value = game
    event = make_api_gateway_event(path_parameters={"gameId": "game-123"})

    response = handler.get_single_player_game(event, MagicMock())

    body = json.loads(response["body"])
    assert "completedAt" not in body
    assert "result" not in body["rounds"][0]
    assert "target" not in body["rounds"][0]


def test_get_single_player_games_returns_recent_history(mocker):
    service = mocker.patch.object(handler, "_service")
    service.list_games.return_value = [
        SinglePlayerGameSummary(
            id="game-123",
            totalScore=12345,
            totalDistanceKm=42.5,
            createdAt=NOW,
            completedAt=NOW,
        )
    ]
    event = make_api_gateway_event()
    event["queryStringParameters"] = {
        "limit": "10",
        "sort_by": "completed_at",
        "order_by": "desc",
    }

    response = handler.get_single_player_games(event, MagicMock())

    assert response["statusCode"] == 200
    assert json.loads(response["body"])[0]["totalDistanceKm"] == 42.5
    service.list_games.assert_called_once_with(
        "user-123", 10, "completed_at", "desc"
    )


def test_start_single_player_game_round_parses_path_parameters(mocker):
    service = mocker.patch.object(handler, "_service")
    service.start_round.return_value = make_round()
    event = make_api_gateway_event(
        method="POST",
        path_parameters={"gameId": "game-123", "roundNumber": "1"},
    )

    response = handler.start_single_player_game_round(event, MagicMock())

    assert response["statusCode"] == 200
    service.start_round.assert_called_once_with("user-123", "game-123", 1)


def test_create_single_player_game_guess_passes_payload(mocker):
    service = mocker.patch.object(handler, "_service")
    completed_round = make_round()
    completed_round.result = SinglePlayerGameRoundResult.model_validate(
        {
            "guess": None,
            "target": {"latitude": 35, "longitude": 139},
            "distanceKm": None,
            "score": 0,
            "completedAt": NOW,
        }
    )
    service.create_guess.return_value = completed_round
    payload = {"guess": None}
    event = make_api_gateway_event(
        method="POST",
        body=payload,
        path_parameters={"gameId": "game-123", "roundNumber": "1"},
    )

    response = handler.create_single_player_game_guess(event, MagicMock())

    assert response["statusCode"] == 200
    assert json.loads(response["body"])["result"]["target"] == {"latitude": 35.0, "longitude": 139.0}
    service.create_guess.assert_called_once_with("user-123", "game-123", 1, payload)


def test_handler_returns_api_error(mocker):
    service = mocker.patch.object(handler, "_service")
    service.get_game.side_effect = ApiError(404, "single_player_game_not_found", "Missing.")
    event = make_api_gateway_event(path_parameters={"gameId": "missing"})

    response = handler.get_single_player_game(event, MagicMock())

    assert response["statusCode"] == 404
