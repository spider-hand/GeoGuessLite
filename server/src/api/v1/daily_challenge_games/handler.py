from datetime import date
from http import HTTPStatus

from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from src.api.v1.single_player_games.handler import _game_payload
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
from src.features.daily_challenges import DailyChallengesService

_service = DailyChallengesService()


def _get_challenge_date(event: CustomApiGatewayEvent) -> date:
    value = (event.queryStringParameters or {}).get("date")
    try:
        return date.fromisoformat(value or "")
    except ValueError as error:
        raise ApiError(
            HTTPStatus.BAD_REQUEST,
            "invalid_challenge_date",
            "date must use YYYY-MM-DD format.",
        ) from error


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def get_daily_challenge_games(event: CustomApiGatewayEvent, context: LambdaContext):
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
def get_daily_challenge_game(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        game = _service.get_game(
            get_authorized_uid(event), get_path_parameter(event, "gameId")
        )
        return json_response(HTTPStatus.OK, _game_payload(game), CORS_HEADERS)
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def get_daily_challenge_leaderboard(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        get_authorized_uid(event)
        entries = _service.get_leaderboard(_get_challenge_date(event))
        return json_response(
            HTTPStatus.OK,
            [entry.model_dump(by_alias=True, mode="json") for entry in entries],
            CORS_HEADERS,
        )
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def get_today_daily_challenge(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        today = _service.get_today(get_authorized_uid(event))
        payload = today.model_dump(by_alias=True, mode="json")
        if today.game is None:
            payload.pop("game")
        else:
            payload["game"] = _game_payload(today.game)
        return json_response(HTTPStatus.OK, payload, CORS_HEADERS)
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def create_daily_challenge_game(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        if parse_json_body(event):
            raise ApiError(HTTPStatus.BAD_REQUEST, "invalid_request_body", "Request body must be empty.")
        game, created = _service.create_or_resume_today(get_authorized_uid(event))
        return json_response(HTTPStatus.CREATED if created else HTTPStatus.OK, _game_payload(game), CORS_HEADERS)
    except Exception as error:
        return handle_api_error(error, CORS_HEADERS)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def start_daily_challenge_game_round(event: CustomApiGatewayEvent, context: LambdaContext):
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
def create_daily_challenge_game_guess(event: CustomApiGatewayEvent, context: LambdaContext):
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
