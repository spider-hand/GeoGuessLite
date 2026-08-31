from http import HTTPStatus

from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from src.core.auth import CORS_HEADERS, get_authorized_uid
from src.core.events import CustomApiGatewayEvent
from src.core.http import (
    ApiError,
    get_path_parameter,
    get_round_number,
    handle_api_error,
    json_response,
    parse_json_body,
    parse_list_query_parameters,
)
from src.core.logger import dynamic_inject_lambda_context
from src.features.single_player_games import SinglePlayerGamesService

_service = SinglePlayerGamesService()


def _game_payload(game) -> dict[str, object]:
    payload = game.model_dump(by_alias=True, mode="json")
    if payload["completedAt"] is None:
        payload.pop("completedAt")
    for round_payload in payload["rounds"]:
        if round_payload["result"] is None:
            round_payload.pop("result")
    return payload


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def create_single_player_game(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        if parse_json_body(event):
            raise ApiError(HTTPStatus.BAD_REQUEST, "invalid_request_body", "Request body must be empty.")
        game = _service.create_game(get_authorized_uid(event))
        return json_response(HTTPStatus.CREATED, _game_payload(game), CORS_HEADERS)
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def get_single_player_games(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        limit, sort_by, order_by = parse_list_query_parameters(
            event,
            allowed_sort_by=("created_at", "completed_at"),
            default_sort_by="completed_at",
        )
        games = _service.list_games(get_authorized_uid(event), limit, sort_by, order_by)
        return json_response(
            HTTPStatus.OK,
            [game.model_dump(by_alias=True, mode="json") for game in games],
            CORS_HEADERS,
        )
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def get_single_player_game(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        game = _service.get_game(get_authorized_uid(event), get_path_parameter(event, "gameId"))
        return json_response(HTTPStatus.OK, _game_payload(game), CORS_HEADERS)
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def start_single_player_game_round(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        game_round = _service.start_round(
            get_authorized_uid(event),
            get_path_parameter(event, "gameId"),
            get_round_number(event),
        )
        payload = game_round.model_dump(by_alias=True, mode="json")
        if payload["result"] is None:
            payload.pop("result")
        return json_response(HTTPStatus.OK, payload, CORS_HEADERS)
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def create_single_player_game_guess(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        game_round = _service.create_guess(
            get_authorized_uid(event),
            get_path_parameter(event, "gameId"),
            get_round_number(event),
            parse_json_body(event),
        )
        return json_response(
            HTTPStatus.OK,
            game_round.model_dump(by_alias=True, mode="json"),
            CORS_HEADERS,
        )
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)
