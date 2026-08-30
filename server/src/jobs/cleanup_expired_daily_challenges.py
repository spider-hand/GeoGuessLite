from typing import Any

from aws_lambda_powertools.utilities.typing import LambdaContext

from src.core.logger import dynamic_inject_lambda_context, logger
from src.features.daily_challenges import DailyChallengesService

_service = DailyChallengesService()


@dynamic_inject_lambda_context
def cleanup_expired_daily_challenges(event: dict[str, Any], context: LambdaContext):
    deleted_count = _service.delete_expired()
    logger.info("Deleted expired daily challenges.", extra={"deleted_count": deleted_count})
    return {"deletedCount": deleted_count}
