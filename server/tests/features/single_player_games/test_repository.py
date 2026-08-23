from datetime import UTC, datetime
from unittest.mock import MagicMock, patch

from src.features.single_player_games.repository import SinglePlayerGamesRepository

NOW = datetime(2026, 8, 23, tzinfo=UTC)


def make_connection_and_cursor():
    connection = MagicMock()
    cursor = MagicMock()
    connection.__enter__.return_value = connection
    connection.cursor.return_value.__enter__.return_value = cursor
    return connection, cursor


def make_round_rows(completed=True):
    return [
        {
            "id": "game-123",
            "user_id": "user-123",
            "created_at": NOW,
            "completed_at": NOW if completed else None,
            "round_number": round_number,
            "image_id": f"image-{round_number}",
            "target_latitude": 35.0,
            "target_longitude": 139.0,
            "started_at": NOW,
            "guess_latitude": 35.0,
            "guess_longitude": 139.0,
            "distance_km": 0.0,
            "score": 5000,
            "round_completed_at": NOW,
        }
        for round_number in range(1, 6)
    ]


def test_complete_final_round_finishes_game_and_updates_registered_user_once():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchone.side_effect = [
        {"game_id": "game-123"},
        {"id": "game-123"},
        {"total_score": 25000},
    ]
    cursor.fetchall.return_value = make_round_rows()

    with patch(
        "src.features.single_player_games.repository.get_connection",
        return_value=connection,
    ):
        game = SinglePlayerGamesRepository().complete_round(
            "game-123",
            "user-123",
            5,
            completed_at=NOW,
            guess_latitude=35.0,
            guess_longitude=139.0,
            distance_km=0.0,
            score=5000,
        )

    assert game.completed_at == NOW
    statements = [call.args[0] for call in cursor.execute.call_args_list]
    assert any("UPDATE single_player_games" in statement for statement in statements)
    assert any("UPDATE users" in statement for statement in statements)


def test_complete_round_does_not_update_stats_when_round_was_already_completed():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchone.return_value = None
    cursor.fetchall.return_value = make_round_rows()

    with patch(
        "src.features.single_player_games.repository.get_connection",
        return_value=connection,
    ):
        SinglePlayerGamesRepository().complete_round(
            "game-123",
            "user-123",
            5,
            completed_at=NOW,
            guess_latitude=35.0,
            guess_longitude=139.0,
            distance_km=0.0,
            score=5000,
        )

    statements = [call.args[0] for call in cursor.execute.call_args_list]
    assert not any("UPDATE users" in statement for statement in statements)


def test_delete_expired_games_uses_strict_30_day_cutoff():
    connection, cursor = make_connection_and_cursor()
    cursor.rowcount = 3

    with patch(
        "src.features.single_player_games.repository.get_connection",
        return_value=connection,
    ):
        deleted_count = SinglePlayerGamesRepository().delete_expired()

    assert deleted_count == 3
    cursor.execute.assert_called_once_with(
        "DELETE FROM single_player_games WHERE created_at < NOW() - INTERVAL '30 days'"
    )
