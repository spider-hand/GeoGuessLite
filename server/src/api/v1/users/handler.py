from http import HTTPStatus

from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from src.core.auth import CORS_HEADERS, get_authorized_uid
from src.core.events import CustomApiGatewayEvent
from src.core.http import ApiError, empty_response, error_response, json_response, parse_json_body
from src.core.logger import dynamic_inject_lambda_context
from src.features.users import UsersService

_users_service = UsersService()


def _handle_api_error(error: Exception):
    if isinstance(error, ApiError):
        return error_response(error.status_code, error.code, error.message, CORS_HEADERS)
    raise error


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def get_user(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        user_id = (event.pathParameters or {}).get("userId")
        if not user_id:
            raise ApiError(HTTPStatus.BAD_REQUEST, "missing_user_id", "Path parameter 'userId' is required.")
        user = _users_service.get_user(user_id)
        return json_response(HTTPStatus.OK, user.model_dump(by_alias=True, mode="json"), CORS_HEADERS)
    except Exception as error:
        return _handle_api_error(error)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def get_current_user(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        user = _users_service.get_current_user(get_authorized_uid(event))
        return json_response(HTTPStatus.OK, user.model_dump(by_alias=True, mode="json"), CORS_HEADERS)
    except Exception as error:
        return _handle_api_error(error)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def create_user(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        user, status_code = _users_service.create_user(get_authorized_uid(event), parse_json_body(event))
        return json_response(status_code, user.model_dump(by_alias=True, mode="json"), CORS_HEADERS)
    except Exception as error:
        return _handle_api_error(error)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def update_user(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        user = _users_service.update_user(get_authorized_uid(event), parse_json_body(event))
        return json_response(HTTPStatus.OK, user.model_dump(by_alias=True, mode="json"), CORS_HEADERS)
    except Exception as error:
        return _handle_api_error(error)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def delete_user(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        _users_service.delete_user(get_authorized_uid(event))
        return empty_response(HTTPStatus.NO_CONTENT, CORS_HEADERS)
    except Exception as error:
        return _handle_api_error(error)
