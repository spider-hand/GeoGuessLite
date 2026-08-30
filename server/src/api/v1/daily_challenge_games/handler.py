from http import HTTPStatus

from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from src.api.v1.single_player_games.handler import (
    _game_payload,
    _handle_api_error,
    _path_parameter,
    _round_number,
)
from src.core.auth import CORS_HEADERS, get_authorized_uid
from src.core.events import CustomApiGatewayEvent
from src.core.http import ApiError, json_response, parse_json_body
from src.core.logger import dynamic_inject_lambda_context
from src.features.daily_challenges import DailyChallengesService

_service = DailyChallengesService()


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
        return _handle_api_error(error)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def create_daily_challenge_game(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        if parse_json_body(event):
            raise ApiError(HTTPStatus.BAD_REQUEST, "invalid_request_body", "Request body must be empty.")
        game, created = _service.create_or_resume_today(get_authorized_uid(event))
        return json_response(HTTPStatus.CREATED if created else HTTPStatus.OK, _game_payload(game), CORS_HEADERS)
    except Exception as error:
        return _handle_api_error(error)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def start_daily_challenge_game_round(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        game_round = _service.start_round(
            get_authorized_uid(event),
            _path_parameter(event, "gameId"),
            _round_number(event),
        )
        payload = game_round.model_dump(by_alias=True, mode="json")
        if payload["result"] is None:
            payload.pop("result")
        return json_response(HTTPStatus.OK, payload, CORS_HEADERS)
    except Exception as error:
        return _handle_api_error(error)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def create_daily_challenge_game_guess(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        game_round = _service.create_guess(
            get_authorized_uid(event),
            _path_parameter(event, "gameId"),
            _round_number(event),
            parse_json_body(event),
        )
        return json_response(
            HTTPStatus.OK,
            game_round.model_dump(by_alias=True, mode="json"),
            CORS_HEADERS,
        )
    except Exception as error:
        return _handle_api_error(error)
