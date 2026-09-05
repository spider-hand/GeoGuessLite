from unittest.mock import patch

import pytest

from src.core import auth
from src.core.events import CustomApiGatewayEvent
from src.core.http import ApiError
from tests.factories.http_events import make_api_gateway_event, make_authorizer_event


@patch("src.core.auth.verify_firebase_token")
def test_lambda_authorizer_returns_simple_allow_response(mock_verify_firebase_token):
    mock_verify_firebase_token.return_value = {"uid": "user-123"}

    response = auth.lambda_handler(make_authorizer_event(), None)

    assert response == {"isAuthorized": True, "context": {"uid": "user-123"}}
    mock_verify_firebase_token.assert_called_once_with({"Authorization": "Bearer token"}, allow_anonymous=False)


@patch("src.core.auth.verify_firebase_token")
def test_lambda_authorizer_rejects_invalid_user(mock_verify_firebase_token):
    mock_verify_firebase_token.side_effect = ApiError(
        401,
        "authentication_required",
        "Authorization header is required.",
    )

    assert auth.lambda_handler(make_authorizer_event(authorization_header=None), None) == {"isAuthorized": False}


@patch("src.core.auth.verify_firebase_token")
def test_lambda_authorizer_rejects_anonymous_users_by_default(mock_verify_firebase_token):
    mock_verify_firebase_token.return_value = {"uid": "user-123"}

    auth.lambda_handler(make_authorizer_event(raw_path="/api/v1/future-resource"), None)

    mock_verify_firebase_token.assert_called_once_with({"Authorization": "Bearer token"}, allow_anonymous=False)


@patch("src.core.auth.verify_firebase_token")
def test_lambda_authorizer_allows_anonymous_single_player_users(mock_verify_firebase_token):
    mock_verify_firebase_token.return_value = {"uid": "guest-123"}

    auth.lambda_handler(make_authorizer_event(raw_path="/api/v1/single-player-games/game-123"), None)

    mock_verify_firebase_token.assert_called_once_with({"Authorization": "Bearer token"}, allow_anonymous=True)


def test_get_authorized_uid_reads_lambda_authorizer_context():
    event = CustomApiGatewayEvent.model_validate(make_api_gateway_event(authenticated_uid="user-123"))

    assert auth.get_authorized_uid(event) == "user-123"


@pytest.mark.parametrize("headers", [None, {}, {"Authorization": "Basic token"}, {"Authorization": "Bearer"}])
def test_verify_firebase_token_rejects_missing_or_malformed_authorization_headers(headers):
    with pytest.raises(ApiError):
        auth.verify_firebase_token(headers)


def test_verify_user_access_rejects_a_different_user():
    auth.verify_user_access("user-123", "user-123")
    with pytest.raises(ApiError, match="do not have access"):
        auth.verify_user_access("user-123", "other-user")
