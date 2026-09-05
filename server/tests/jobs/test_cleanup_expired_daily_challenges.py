from unittest.mock import MagicMock

from src.jobs import cleanup_expired_daily_challenges


def test_cleanup_expired_daily_challenges_returns_the_deleted_count(mocker):
    mocker.patch.object(cleanup_expired_daily_challenges._service, "delete_expired", return_value=3)
    assert cleanup_expired_daily_challenges.cleanup_expired_daily_challenges({}, MagicMock()) == {"deletedCount": 3}
