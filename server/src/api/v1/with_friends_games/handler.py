from http import HTTPStatus

from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from src.core.auth import CORS_HEADERS, get_authorized_uid
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
from src.core.logger import dynamic_inject_lambda_context
from src.features.with_friends_games import WithFriendsGamesService

_service = WithFriendsGamesService()


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def get_with_friends_games(event: CustomApiGatewayEvent, context: LambdaContext):
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
def create_with_friends_game(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        if parse_json_body(event):
            raise ApiError(HTTPStatus.BAD_REQUEST, "invalid_request_body", "Request body must be empty.")
        game = _service.create_game(get_authorized_uid(event))
        return json_response(HTTPStatus.CREATED, {"id": game.id, "roomKey": game.room_key}, CORS_HEADERS)
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def join_with_friends_game(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        game_id = _service.join_game(get_authorized_uid(event), parse_json_body(event))
        return json_response(HTTPStatus.OK, {"id": game_id}, CORS_HEADERS)
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def start_with_friends_game(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        if parse_json_body(event):
            raise ApiError(HTTPStatus.BAD_REQUEST, "invalid_request_body", "Request body must be empty.")
        _service.start_game(get_authorized_uid(event), get_path_parameter(event, "gameId"))
        return empty_response(HTTPStatus.ACCEPTED, CORS_HEADERS)
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def create_with_friends_game_guess(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        _service.create_guess(
            get_authorized_uid(event),
            get_path_parameter(event, "gameId"),
            get_round_number(event),
            parse_json_body(event),
        )
        return empty_response(HTTPStatus.ACCEPTED, CORS_HEADERS)
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)
