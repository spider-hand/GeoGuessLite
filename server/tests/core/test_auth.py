from unittest.mock import patch

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


def test_get_authorized_uid_reads_lambda_authorizer_context():
    event = CustomApiGatewayEvent.model_validate(make_api_gateway_event(authenticated_uid="user-123"))

    assert auth.get_authorized_uid(event) == "user-123"
