import json
from http import HTTPStatus
from typing import Any

from src.core.events import CustomApiGatewayEvent


def json_response(status_code: int, body: Any, headers: dict[str, str]) -> dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": headers,
        "body": json.dumps(body),
    }


def empty_response(status_code: int, headers: dict[str, str]) -> dict[str, Any]:
    return {"statusCode": status_code, "headers": headers, "body": ""}


class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


def error_response(status_code: int, code: str, message: str, headers: dict[str, str]) -> dict[str, Any]:
    return json_response(status_code, {"code": code, "message": message}, headers)


def handle_api_error(error: Exception, headers: dict[str, str]) -> dict[str, Any]:
    if isinstance(error, ApiError):
        return error_response(error.status_code, error.code, error.message, headers)
    raise error


def get_path_parameter(event: CustomApiGatewayEvent, name: str) -> str:
    value = (event.pathParameters or {}).get(name)
    if not value:
        raise ApiError(
            HTTPStatus.BAD_REQUEST,
            f"missing_{name}",
            f"Path parameter '{name}' is required.",
        )
    return value


def get_round_number(event: CustomApiGatewayEvent) -> int:
    value = get_path_parameter(event, "roundNumber")
    try:
        return int(value)
    except ValueError as error:
        raise ApiError(
            HTTPStatus.BAD_REQUEST,
            "invalid_round_number",
            "roundNumber must be an integer.",
        ) from error


def parse_json_body(event: CustomApiGatewayEvent) -> dict[str, Any]:
    if event.body in (None, ""):
        return {}
    if isinstance(event.body, str):
        try:
            return json.loads(event.body)
        except json.JSONDecodeError as error:
            raise ApiError(
                HTTPStatus.BAD_REQUEST,
                "invalid_request_body",
                "Request body must be valid JSON.",
            ) from error
    if isinstance(event.body, dict):
        return event.body
    raise ApiError(HTTPStatus.BAD_REQUEST, "invalid_request_body", "Request body must be valid JSON.")


def parse_list_query_parameters(
    event: CustomApiGatewayEvent,
    *,
    allowed_sort_by: tuple[str, ...] = ("created_at", "updated_at"),
    default_sort_by: str = "updated_at",
) -> tuple[int, str, str]:
    parameters = event.queryStringParameters or {}
    try:
        limit = int(parameters.get("limit", "20"))
    except ValueError as error:
        raise ApiError(
            HTTPStatus.BAD_REQUEST,
            "invalid_limit",
            "limit must be an integer between 1 and 100.",
        ) from error
    sort_by = parameters.get("sort_by", default_sort_by)
    order_by = parameters.get("order_by", "desc")
    if not 1 <= limit <= 100:
        raise ApiError(
            HTTPStatus.BAD_REQUEST,
            "invalid_limit",
            "limit must be an integer between 1 and 100.",
        )
    if sort_by not in allowed_sort_by:
        raise ApiError(
            HTTPStatus.BAD_REQUEST,
            "invalid_sort_by",
            f"sort_by must be {' or '.join(allowed_sort_by)}.",
        )
    if order_by not in ("asc", "desc"):
        raise ApiError(
            HTTPStatus.BAD_REQUEST,
            "invalid_order_by",
            "order_by must be asc or desc.",
        )
    return limit, sort_by, order_by
