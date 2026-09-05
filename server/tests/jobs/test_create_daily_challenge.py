from unittest.mock import MagicMock

from src.jobs import create_daily_challenge


def test_create_daily_challenge_returns_the_created_or_existing_date(mocker):
    challenge = MagicMock(date=MagicMock(isoformat=lambda: "2026-09-06"))
    mocker.patch.object(create_daily_challenge._service, "create_tomorrow", return_value=challenge)
    assert create_daily_challenge.create_daily_challenge({}, MagicMock()) == {"date": "2026-09-06"}
