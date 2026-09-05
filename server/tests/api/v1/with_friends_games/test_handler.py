import json
from unittest.mock import MagicMock, patch

from src.api.v1.with_friends_games import handler
from src.features.with_friends_games.models import (
    WithFriendsGameHistoryRecord,
    WithFriendsGameRecord,
)
from tests.factories.http_events import make_api_gateway_event


def make_event(method="POST", path="/api/v1/with-friends-games", body=None):
    event = make_api_gateway_event(route_key=f"{method} {path}", raw_path=path, method=method)
    if body is not None:
        event["body"] = json.dumps(body)
    return event


def test_create_with_friends_game_returns_room_key():
    game = WithFriendsGameRecord.model_validate(
        {
            "id": "game-1",
            "roomKey": "123456",
            "hostUserId": "user-123",
            "createdAt": "2026-08-31T00:00:00Z",
        }
    )
    with patch.object(handler._service, "create_game", return_value=game):
        response = handler.create_with_friends_game(make_event(), MagicMock())

    assert response["statusCode"] == 201
    assert json.loads(response["body"]) == {"id": "game-1", "roomKey": "123456"}


def test_join_with_friends_game_passes_the_room_key():
    event = make_event(path="/api/v1/with-friends-games/join", body={"roomKey": "123456"})
    with patch.object(handler._service, "join_game", return_value="game-1") as join_game:
        response = handler.join_with_friends_game(event, MagicMock())

    assert response["statusCode"] == 200
    join_game.assert_called_once_with("user-123", {"roomKey": "123456"})


def test_create_with_friends_game_guess_returns_202():
    path = "/api/v1/with-friends-games/game-1/rounds/1/guesses"
    event = make_event(path=path, body={"guess": {"latitude": 35, "longitude": 139}})
    event["pathParameters"] = {"gameId": "game-1", "roundNumber": "1"}
    with patch.object(handler._service, "create_guess") as create_guess:
        response = handler.create_with_friends_game_guess(event, MagicMock())

    assert response["statusCode"] == 202
    create_guess.assert_called_once_with(
        "user-123",
        "game-1",
        1,
        {"guess": {"latitude": 35, "longitude": 139}},
    )


def test_get_with_friends_games_returns_recent_history(mocker):
    service = mocker.patch.object(handler, "_service")
    service.list_games.return_value = [
        WithFriendsGameHistoryRecord(
            id="game-1",
            hostUserId="host",
            hostDisplayName="Host",
            hostCountry="JP",
            rank=2,
            playerCount=3,
            totalScore=15000,
            completedAt="2026-09-05T00:00:00Z",
        )
    ]

    event = make_event(method="GET")
    event["queryStringParameters"] = {
        "limit": "5",
        "sort_by": "created_at",
        "order_by": "asc",
    }
    response = handler.get_with_friends_games(event, MagicMock())

    assert response["statusCode"] == 200
    assert json.loads(response["body"])[0]["rank"] == 2
    service.list_games.assert_called_once_with("user-123", 5, "created_at", "asc")
