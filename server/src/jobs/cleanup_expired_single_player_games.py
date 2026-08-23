from typing import Any

from aws_lambda_powertools.utilities.typing import LambdaContext

from src.core.logger import dynamic_inject_lambda_context, logger
from src.features.single_player_games import SinglePlayerGamesService

_service = SinglePlayerGamesService()


@dynamic_inject_lambda_context
def cleanup_expired_single_player_games(event: dict[str, Any], context: LambdaContext):
    deleted_count = _service.delete_expired_games()
    logger.info("Deleted expired single-player games.", extra={"deleted_count": deleted_count})
    return {"deletedCount": deleted_count}
