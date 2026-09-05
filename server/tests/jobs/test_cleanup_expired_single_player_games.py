from unittest.mock import MagicMock

from src.jobs import cleanup_expired_single_player_games


def test_cleanup_expired_single_player_games_returns_the_deleted_count(mocker):
    mocker.patch.object(cleanup_expired_single_player_games._service, "delete_expired_games", return_value=3)
    result = cleanup_expired_single_player_games.cleanup_expired_single_player_games({}, MagicMock())
    assert result == {"deletedCount": 3}
