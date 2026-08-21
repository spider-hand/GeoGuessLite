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
