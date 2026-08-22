from datetime import UTC, datetime
from http import HTTPStatus
from unittest.mock import MagicMock

import pytest
from firebase_admin import auth as firebase_auth

from src.core.http import ApiError
from src.features.users.models import CurrentUserRecord, UserRecord
from src.features.users.service import UsersService

NOW = datetime(2026, 8, 22, tzinfo=UTC)


def make_user(**overrides) -> UserRecord:
    return UserRecord.model_validate(
        {
            "userId": "user-123",
            "displayName": "Player One",
            "country": "JP",
            "createdAt": NOW,
            "updatedAt": NOW,
            **overrides,
        }
    )


def make_current_user(**overrides) -> CurrentUserRecord:
    return CurrentUserRecord.model_validate(
        {
            "userId": "user-123",
            "displayName": "Player One",
            "country": "JP",
            "gamesPlayed": 12,
            "bestScore": 4990,
            "averageScore": 3210.5,
            "distanceUnit": "km",
            "createdAt": NOW,
            "updatedAt": NOW,
            **overrides,
        }
    )


def test_get_current_user_retains_statistics():
    repository = MagicMock()
    repository.get_current_by_id.return_value = make_current_user()

    user = UsersService(repository).get_current_user("user-123")

    assert user.games_played == 12
    assert user.best_score == 4990
    assert user.average_score == 3210.5
    assert user.distance_unit == "km"


def test_get_user_raises_when_missing():
    repository = MagicMock()
    repository.get_by_id.return_value = None

    with pytest.raises(ApiError) as error:
        UsersService(repository).get_user("missing")

    assert error.value.status_code == HTTPStatus.NOT_FOUND
    assert error.value.code == "user_not_found"


def test_create_user_normalizes_profile_fields():
    repository = MagicMock()
    repository.get_by_id.return_value = None
    repository.create.return_value = make_user(country="US", displayName="Player")

    user, status = UsersService(repository).create_user(
        "user-123", {"displayName": "  Player  ", "country": " us "}
    )

    assert status == HTTPStatus.CREATED
    assert user.country == "US"
    repository.create.assert_called_once_with("user-123", "Player", "US")


def test_create_user_is_idempotent_without_revalidating_payload():
    repository = MagicMock()
    existing = make_user()
    repository.get_by_id.return_value = existing

    user, status = UsersService(repository).create_user("user-123", {})

    assert (user, status) == (existing, HTTPStatus.OK)
    repository.create.assert_not_called()


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"displayName": " "},
        {"displayName": "x" * 51},
        {"displayName": "Player", "country": "USA"},
        {"displayName": "Player", "distanceUnit": "km"},
    ],
)
def test_create_user_rejects_invalid_payload(payload):
    repository = MagicMock()
    repository.get_by_id.return_value = None

    with pytest.raises(ApiError) as error:
        UsersService(repository).create_user("user-123", payload)

    assert error.value.status_code == HTTPStatus.BAD_REQUEST
    repository.create.assert_not_called()


def test_update_user_partially_updates_distance_unit_and_preserves_profile():
    repository = MagicMock()
    repository.get_current_by_id.return_value = make_current_user()
    repository.update.return_value = make_user()

    UsersService(repository).update_user("user-123", {"distanceUnit": "mile"})

    repository.update.assert_called_once_with("user-123", "Player One", "JP", "mile")


def test_update_user_clears_country_when_explicitly_null():
    repository = MagicMock()
    repository.get_current_by_id.return_value = make_current_user()
    repository.update.return_value = make_user(country=None)

    UsersService(repository).update_user("user-123", {"country": None})

    repository.update.assert_called_once_with("user-123", "Player One", None, "km")


def test_update_user_normalizes_country_and_display_name():
    repository = MagicMock()
    repository.get_current_by_id.return_value = make_current_user()
    repository.update.return_value = make_user(country="GB", displayName="New Name")

    UsersService(repository).update_user(
        "user-123", {"displayName": "  New Name ", "country": "gb"}
    )

    repository.update.assert_called_once_with("user-123", "New Name", "GB", "km")


def test_update_user_skips_unchanged_update_and_returns_public_profile():
    repository = MagicMock()
    repository.get_current_by_id.return_value = make_current_user()

    user = UsersService(repository).update_user("user-123", {"displayName": "Player One"})

    assert user.model_dump(by_alias=True).keys() == {
        "userId",
        "displayName",
        "country",
        "createdAt",
        "updatedAt",
    }
    repository.update.assert_not_called()


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"displayName": None},
        {"displayName": " "},
        {"country": "JPN"},
        {"distanceUnit": None},
        {"distanceUnit": "meters"},
        {"gamesPlayed": 99},
    ],
)
def test_update_user_rejects_invalid_or_read_only_fields(payload):
    repository = MagicMock()
    repository.get_current_by_id.return_value = make_current_user()

    with pytest.raises(ApiError) as error:
        UsersService(repository).update_user("user-123", payload)

    assert error.value.status_code == HTTPStatus.BAD_REQUEST
    repository.update.assert_not_called()


def test_delete_user_deletes_postgres_and_firebase(mocker):
    repository = MagicMock()
    firebase_app = object()
    mocker.patch("src.features.users.service.get_firebase_app", return_value=firebase_app)
    delete_firebase_user = mocker.patch("firebase_admin.auth.delete_user")

    UsersService(repository).delete_user("user-123")

    repository.delete.assert_called_once_with("user-123")
    delete_firebase_user.assert_called_once_with("user-123", app=firebase_app)


def test_delete_user_ignores_missing_firebase_account(mocker):
    repository = MagicMock()
    mocker.patch("src.features.users.service.get_firebase_app", return_value=object())
    mocker.patch("firebase_admin.auth.delete_user", side_effect=firebase_auth.UserNotFoundError("missing"))

    UsersService(repository).delete_user("user-123")

    repository.delete.assert_called_once_with("user-123")
