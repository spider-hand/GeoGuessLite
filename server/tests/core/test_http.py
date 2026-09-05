import pytest

from src.core.events import CustomApiGatewayEvent
from src.core.http import (
    ApiError,
    empty_response,
    get_path_parameter,
    get_round_number,
    handle_api_error,
    json_response,
    parse_json_body,
    parse_list_query_parameters,
)
from tests.factories.http_events import make_api_gateway_event


def make_event(*, body=None, parameters=None, path_parameters=None):
    event = make_api_gateway_event(body=body, serialize_body=False, path_parameters=path_parameters)
    event["queryStringParameters"] = parameters
    return CustomApiGatewayEvent.model_validate(event)


def test_json_response_serializes_the_status_headers_and_body():
    assert json_response(201, {"id": "game-1"}, {"X-Test": "true"}) == {
        "statusCode": 201, "headers": {"X-Test": "true"}, "body": '{"id": "game-1"}'
    }


def test_empty_response_returns_an_empty_body():
    assert empty_response(204, {}) == {"statusCode": 204, "headers": {}, "body": ""}


def test_handle_api_error_serializes_api_errors_and_reraises_unexpected_errors():
    assert handle_api_error(ApiError(400, "invalid", "Invalid."), {})["statusCode"] == 400
    with pytest.raises(RuntimeError, match="unexpected"):
        handle_api_error(RuntimeError("unexpected"), {})


def test_get_path_parameter_returns_a_present_value():
    assert get_path_parameter(make_event(path_parameters={"gameId": "game-1"}), "gameId") == "game-1"


def test_get_path_parameter_rejects_a_missing_value():
    with pytest.raises(ApiError, match="Path parameter 'gameId' is required"):
        get_path_parameter(make_event(), "gameId")


def test_get_round_number_returns_an_integer():
    assert get_round_number(make_event(path_parameters={"roundNumber": "2"})) == 2


def test_get_round_number_rejects_a_non_integer_value():
    with pytest.raises(ApiError, match="roundNumber must be an integer"):
        get_round_number(make_event(path_parameters={"roundNumber": "one"}))


def test_parse_json_body_returns_an_empty_object_for_an_absent_body():
    assert parse_json_body(make_event(body=None)) == {}


def test_parse_json_body_returns_valid_object_bodies():
    assert parse_json_body(make_event(body='{"name":"GeoGuessLite"}')) == {"name": "GeoGuessLite"}
    assert parse_json_body(make_event(body={"name": "GeoGuessLite"})) == {"name": "GeoGuessLite"}


@pytest.mark.parametrize("body", ["{", "[]"])
def test_parse_json_body_rejects_non_object_or_malformed_json(body):
    with pytest.raises(ApiError, match="Request body must be valid JSON"):
        parse_json_body(make_event(body=body))


def test_parse_list_query_parameters_returns_defaults_and_valid_overrides():
    assert parse_list_query_parameters(make_event()) == (20, "updated_at", "desc")
    assert parse_list_query_parameters(
        make_event(parameters={"limit": "5", "sort_by": "completed_at", "order_by": "asc"}),
        allowed_sort_by=("created_at", "completed_at"), default_sort_by="completed_at",
    ) == (5, "completed_at", "asc")


@pytest.mark.parametrize(
    ("parameters", "code"),
    [({"limit": "none"}, "invalid_limit"), ({"limit": "0"}, "invalid_limit"),
     ({"sort_by": "score"}, "invalid_sort_by"), ({"order_by": "sideways"}, "invalid_order_by")],
)
def test_parse_list_query_parameters_rejects_invalid_values(parameters, code):
    with pytest.raises(ApiError) as error:
        parse_list_query_parameters(make_event(parameters=parameters))
    assert error.value.code == code
