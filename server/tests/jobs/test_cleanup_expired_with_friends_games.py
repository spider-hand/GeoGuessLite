from unittest.mock import MagicMock

from src.jobs import cleanup_expired_with_friends_games


def test_cleanup_expired_with_friends_games_returns_the_deleted_count(mocker):
    mocker.patch.object(cleanup_expired_with_friends_games._service, "delete_expired_games", return_value=3)
    assert cleanup_expired_with_friends_games.cleanup_expired_with_friends_games({}, MagicMock()) == {"deletedCount": 3}
