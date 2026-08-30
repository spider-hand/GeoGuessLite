from datetime import UTC, datetime
from unittest.mock import MagicMock, patch

from src.features.users.repository import UsersRepository


def test_get_current_user_includes_utc_daily_challenge_status():
    connection = MagicMock()
    cursor = MagicMock()
    connection.__enter__.return_value = connection
    connection.cursor.return_value.__enter__.return_value = cursor
    cursor.fetchone.return_value = {
        "user_id": "user-123",
        "display_name": "Player One",
        "country": "JP",
        "games_played": 1,
        "best_score": 1000,
        "average_score": 1000.0,
        "distance_unit": "km",
        "daily_challenge_status": "ongoing",
        "created_at": datetime(2026, 8, 30, tzinfo=UTC),
        "updated_at": datetime(2026, 8, 30, tzinfo=UTC),
    }

    with patch("src.features.users.repository.get_connection", return_value=connection):
        user = UsersRepository().get_current_by_id("user-123")

    assert user is not None
    assert user.daily_challenge_status == "ongoing"
    assert "AT TIME ZONE 'UTC'" in cursor.execute.call_args.args[0]
