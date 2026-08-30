from typing import Any

from aws_lambda_powertools.utilities.typing import LambdaContext

from src.core.logger import dynamic_inject_lambda_context, logger
from src.features.daily_challenges import DailyChallengesService

_service = DailyChallengesService()


@dynamic_inject_lambda_context
def create_daily_challenge(event: dict[str, Any], context: LambdaContext):
    challenge = _service.create_tomorrow()
    logger.info("Prepared daily challenge.", extra={"date": challenge.date.isoformat()})
    return {"date": challenge.date.isoformat()}
