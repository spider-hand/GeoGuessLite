import os

from aws_lambda_powertools import Logger

environment = os.getenv("ENVIRONMENT", "dev")
is_prod = environment == "prod"

logger = Logger(service="server", level="DEBUG" if environment == "dev" else "INFO")


def dynamic_inject_lambda_context(func):
    return logger.inject_lambda_context(log_event=is_prod)(func)
