import json
from unittest.mock import MagicMock

from src.api.v1.health.handler import handler
from tests.factories.http_events import make_api_gateway_event


def test_returns_200_with_alive_message():
    event = make_api_gateway_event(
        route_key="GET /api/v1/health",
        raw_path="/api/v1/health",
        method="GET",
    )
    context = MagicMock()

    response = handler(event, context)

    assert response["statusCode"] == 200
    assert response["headers"]["Access-Control-Allow-Origin"] == "*"
    assert json.loads(response["body"]) == {"message": "alive"}
