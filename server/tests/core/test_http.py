import pytest

from src.core.events import CustomApiGatewayEvent
from src.core.http import ApiError, error_response, parse_json_body, parse_list_query_parameters
from tests.factories.http_events import make_api_gateway_event


def make_event(body):
    return CustomApiGatewayEvent.model_validate(make_api_gateway_event(body=body, serialize_body=False))


def test_parse_json_body_returns_empty_dict_for_missing_body():
    assert parse_json_body(make_event(None)) == {}


def test_parse_json_body_parses_json_string():
    assert parse_json_body(make_event('{"name":"GeoGuessLite"}')) == {"name": "GeoGuessLite"}


def test_parse_json_body_returns_dict_body_as_is():
    assert parse_json_body(make_event({"name": "GeoGuessLite"})) == {"name": "GeoGuessLite"}


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


def test_parse_list_query_parameters_supports_resource_sort_fields():
    event = make_api_gateway_event()
    event["queryStringParameters"] = {
        "limit": "5",
        "sort_by": "completed_at",
        "order_by": "asc",
    }

    assert parse_list_query_parameters(
        CustomApiGatewayEvent.model_validate(event),
        allowed_sort_by=("created_at", "completed_at"),
        default_sort_by="completed_at",
    ) == (5, "completed_at", "asc")


@pytest.mark.parametrize(
    ("parameters", "code"),
    [
        ({"limit": "none"}, "invalid_limit"),
        ({"limit": "0"}, "invalid_limit"),
        ({"sort_by": "score"}, "invalid_sort_by"),
        ({"order_by": "sideways"}, "invalid_order_by"),
    ],
)
def test_parse_list_query_parameters_rejects_invalid_values(parameters, code):
    event = make_api_gateway_event()
    event["queryStringParameters"] = parameters

    with pytest.raises(ApiError) as error:
        parse_list_query_parameters(CustomApiGatewayEvent.model_validate(event))

    assert error.value.code == code
