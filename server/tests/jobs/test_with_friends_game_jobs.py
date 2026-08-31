import json
from unittest.mock import MagicMock, patch

from src.jobs import (
    cleanup_expired_with_friends_games,
    process_with_friends_round_advance,
    process_with_friends_round_timeout,
)


def test_process_with_friends_round_timeout_delegates_queue_message():
    event = {
        "Records": [
            {"body": json.dumps({"gameId": "game-1", "roundNumber": 2})}
        ]
    }
    with patch.object(process_with_friends_round_timeout._service, "process_round_timeout") as process:
        process_with_friends_round_timeout.process_with_friends_round_timeout(event, MagicMock())
    process.assert_called_once_with("game-1", 2)


def test_process_with_friends_round_advance_delegates_queue_message():
    event = {
        "Records": [
            {"body": json.dumps({"gameId": "game-1", "roundNumber": 2})}
        ]
    }
    with patch.object(process_with_friends_round_advance._service, "process_round_advance") as process:
        process_with_friends_round_advance.process_with_friends_round_advance(event, MagicMock())
    process.assert_called_once_with("game-1", 2)


def test_cleanup_expired_with_friends_games_returns_deleted_count():
    with patch.object(cleanup_expired_with_friends_games._service, "delete_expired_games", return_value=3):
        result = cleanup_expired_with_friends_games.cleanup_expired_with_friends_games({}, MagicMock())
    assert result == {"deletedCount": 3}
