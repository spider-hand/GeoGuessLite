import json
import os
from functools import lru_cache
from typing import TypedDict, cast


class SecretsDict(TypedDict):
    neon_db_uri: str
    firebase_service_account: dict[str, object]
    mapillary_token: str


def get_app_secret_name() -> str:
    environment = os.getenv("ENVIRONMENT")
    if not environment:
        raise ValueError("ENVIRONMENT is required to resolve the app secret name.")
    return f"geoguesslite-{environment}"


@lru_cache(maxsize=None)
def get_secret_string(secret_name: str) -> str:
    import boto3

    secret_string = boto3.client("secretsmanager").get_secret_value(SecretId=secret_name).get("SecretString")
    if secret_string is None:
        raise ValueError(f"Secret '{secret_name}' does not contain a string value.")
    return secret_string


@lru_cache(maxsize=None)
def get_secret_json(secret_name: str) -> dict[str, object]:
    try:
        secret_json = json.loads(get_secret_string(secret_name))
    except json.JSONDecodeError as error:
        raise ValueError(f"Secret '{secret_name}' does not contain valid JSON.") from error
    if not isinstance(secret_json, dict):
        raise ValueError(f"Secret '{secret_name}' must contain a JSON object.")
    return cast(dict[str, object], secret_json)


@lru_cache(maxsize=1)
def get_secrets() -> SecretsDict:
    secret_name = get_app_secret_name()
    secret_json = get_secret_json(secret_name)
    neon_db_uri = secret_json.get("neon_db_uri")
    if not isinstance(neon_db_uri, str) or not neon_db_uri:
        raise ValueError(f"Secret '{secret_name}' must contain a non-empty 'neon_db_uri' string.")

    firebase_service_account = secret_json.get("firebase_service_account")
    if not isinstance(firebase_service_account, str):
        raise ValueError(f"Secret '{secret_name}' must contain a 'firebase_service_account' string.")

    mapillary_token = secret_json.get("mapillary_token")
    if not isinstance(mapillary_token, str) or not mapillary_token:
        raise ValueError(f"Secret '{secret_name}' must contain a non-empty 'mapillary_token' string.")

    return {
        "neon_db_uri": neon_db_uri,
        "firebase_service_account": cast(dict[str, object], json.loads(firebase_service_account)),
        "mapillary_token": mapillary_token,
    }
