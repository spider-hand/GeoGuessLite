from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from src.core.auth import CORS_HEADERS
from src.core.events import CustomApiGatewayEvent
from src.core.http import json_response
from src.core.logger import dynamic_inject_lambda_context


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def handler(event: CustomApiGatewayEvent, context: LambdaContext) -> dict:
    return json_response(status_code=200, body={"message": "alive"}, headers=CORS_HEADERS)
