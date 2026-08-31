import json
from typing import Any

from aws_lambda_powertools.utilities.typing import LambdaContext

from src.core.logger import dynamic_inject_lambda_context
from src.features.with_friends_games import WithFriendsGamesService

_service = WithFriendsGamesService()


@dynamic_inject_lambda_context
def process_with_friends_round_timeout(event: dict[str, Any], context: LambdaContext):
    for record in event.get("Records", []):
        message = json.loads(record["body"])
        _service.process_round_timeout(message["gameId"], int(message["roundNumber"]))
