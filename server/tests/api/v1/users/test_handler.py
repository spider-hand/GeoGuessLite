import json
from datetime import UTC, datetime
from unittest.mock import MagicMock

import pytest

from src.api.v1.users import handler
from src.core.http import ApiError
from src.features.users.models import CurrentUserRecord, UserRecord
from tests.factories.http_events import make_api_gateway_event

NOW = datetime(2026, 8, 22, tzinfo=UTC)


def make_user() -> UserRecord:
    return UserRecord.model_validate(
        {
            "userId": "user-123",
            "displayName": "Player One",
            "country": "JP",
            "createdAt": NOW,
            "updatedAt": NOW,
        }
    )


def make_current_user() -> CurrentUserRecord:
    return CurrentUserRecord.model_validate(
        {
            **make_user().model_dump(by_alias=True),
            "gamesPlayed": 8,
            "bestScore": 4800,
            "averageScore": 3000.5,
            "distanceUnit": "km",
            "dailyChallengeStatus": "completed",
        }
    )


def test_get_user_returns_public_profile(mocker):
    service = mocker.patch.object(handler, "_users_service")
    service.get_user.return_value = make_user()
    event = make_api_gateway_event(
        route_key="GET /api/v1/users/{userId}",
        raw_path="/api/v1/users/user-123",
        path_parameters={"userId": "user-123"},
    )

    response = handler.get_user(event, MagicMock())

    assert response["statusCode"] == 200
    assert json.loads(response["body"])["userId"] == "user-123"
    assert "gamesPlayed" not in json.loads(response["body"])
    service.get_user.assert_called_once_with("user-123")


def test_get_current_user_uses_authorizer_context_and_returns_statistics(mocker):
    service = mocker.patch.object(handler, "_users_service")
    service.get_current_user.return_value = make_current_user()

    response = handler.get_current_user(make_api_gateway_event(), MagicMock())

    body = json.loads(response["body"])
    assert response["statusCode"] == 200
    assert body["gamesPlayed"] == 8
    assert body["distanceUnit"] == "km"
    assert body["dailyChallengeStatus"] == "completed"
    service.get_current_user.assert_called_once_with("user-123")


@pytest.mark.parametrize("status_code", [200, 201])
def test_create_user_returns_service_status(mocker, status_code):
    service = mocker.patch.object(handler, "_users_service")
    service.create_user.return_value = (make_user(), status_code)
    event = make_api_gateway_event(method="POST", body={"displayName": "Player One"})

    response = handler.create_user(event, MagicMock())

    assert response["statusCode"] == status_code
    service.create_user.assert_called_once_with("user-123", {"displayName": "Player One"})


def test_update_user_passes_partial_payload(mocker):
    service = mocker.patch.object(handler, "_users_service")
    service.update_user.return_value = make_user()
    event = make_api_gateway_event(method="PATCH", body={"country": None})

    response = handler.update_user(event, MagicMock())

    assert response["statusCode"] == 200
    service.update_user.assert_called_once_with("user-123", {"country": None})


def test_delete_user_returns_empty_204(mocker):
    service = mocker.patch.object(handler, "_users_service")

    response = handler.delete_user(make_api_gateway_event(method="DELETE"), MagicMock())

    assert response["statusCode"] == 204
    assert response["body"] == ""
    service.delete_user.assert_called_once_with("user-123")


def test_handler_returns_api_validation_error(mocker):
    service = mocker.patch.object(handler, "_users_service")
    service.update_user.side_effect = ApiError(400, "invalid_request_body", "Invalid body.")

    response = handler.update_user(make_api_gateway_event(method="PATCH", body={}), MagicMock())

    assert response["statusCode"] == 400
    assert json.loads(response["body"]) == {"code": "invalid_request_body", "message": "Invalid body."}


def test_get_user_returns_404_for_missing_user(mocker):
    service = mocker.patch.object(handler, "_users_service")
    service.get_user.side_effect = ApiError(404, "user_not_found", "User was not found.")

    response = handler.get_user(
        make_api_gateway_event(path_parameters={"userId": "missing"}),
        MagicMock(),
    )

    assert response["statusCode"] == 404


def test_get_user_rejects_missing_path_parameter(mocker):
    mocker.patch.object(handler, "_users_service")

    response = handler.get_user(make_api_gateway_event(path_parameters=None), MagicMock())

    assert response["statusCode"] == 400
    assert json.loads(response["body"])["code"] == "missing_user_id"


def test_current_user_handler_requires_authorizer_context(mocker):
    mocker.patch.object(handler, "_users_service")

    with pytest.raises(RuntimeError, match="Missing authorizer context uid"):
        handler.get_current_user(make_api_gateway_event(authenticated_uid=None), MagicMock())
