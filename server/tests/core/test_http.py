import pytest

from src.core.events import CustomApiGatewayEvent
from src.core.http import ApiError, error_response, parse_json_body
from tests.factories.http_events import make_api_gateway_event


def make_event(body):
    return CustomApiGatewayEvent.model_validate(make_api_gateway_event(body=body, serialize_body=False))


def test_parse_json_body_returns_empty_dict_for_missing_body():
    assert parse_json_body(make_event(None)) == {}


def test_parse_json_body_parses_json_string():
    assert parse_json_body(make_event('{"name":"GeoGuess Lite"}')) == {"name": "GeoGuess Lite"}


def test_parse_json_body_returns_dict_body_as_is():
    assert parse_json_body(make_event({"name": "GeoGuess Lite"})) == {"name": "GeoGuess Lite"}


def test_parse_json_body_raises_for_invalid_json():
    with pytest.raises(ApiError, match="Request body must be valid JSON."):
        parse_json_body(make_event("{"))


def test_error_response_serializes_api_error_fields():
    response = error_response(400, "invalid_request_body", "Request body must be valid JSON.", {"X-Test": "true"})

    assert response == {
        "statusCode": 400,
        "headers": {"X-Test": "true"},
        "body": '{"code": "invalid_request_body", "message": "Request body must be valid JSON."}',
    }
