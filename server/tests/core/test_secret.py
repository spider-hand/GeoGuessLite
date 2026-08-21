from unittest.mock import patch

import pytest

from src.core.secret import get_app_secret_name, get_secrets


def setup_function():
    get_secrets.cache_clear()


@patch.dict("os.environ", {"ENVIRONMENT": "dev"}, clear=True)
def test_get_app_secret_name_uses_environment():
    assert get_app_secret_name() == "geoguesslite-dev"


@patch.dict("os.environ", {}, clear=True)
def test_get_app_secret_name_requires_environment():
    with pytest.raises(ValueError, match="ENVIRONMENT is required to resolve the app secret name."):
        get_app_secret_name()


@patch.dict("os.environ", {"ENVIRONMENT": "dev"}, clear=True)
@patch("src.core.secret.get_secret_json")
def test_get_secrets_reads_stage_scoped_json_secret(mock_get_secret_json):
    mock_get_secret_json.return_value = {
        "neon_db_uri": "postgresql://example",
        "firebase_service_account": '{"type":"service_account"}',
        "mapillary_token": "mapillary-token",
    }

    assert get_secrets() == {
        "neon_db_uri": "postgresql://example",
        "firebase_service_account": {"type": "service_account"},
        "mapillary_token": "mapillary-token",
    }
    mock_get_secret_json.assert_called_once_with("geoguesslite-dev")


@patch.dict("os.environ", {"ENVIRONMENT": "dev"}, clear=True)
@patch("src.core.secret.get_secret_json")
def test_get_secrets_requires_database_uri(mock_get_secret_json):
    mock_get_secret_json.return_value = {
        "firebase_service_account": '{"type":"service_account"}',
        "mapillary_token": "mapillary-token",
    }

    with pytest.raises(ValueError, match="non-empty 'neon_db_uri' string"):
        get_secrets()


@patch.dict("os.environ", {"ENVIRONMENT": "dev"}, clear=True)
@patch("src.core.secret.get_secret_json")
def test_get_secrets_requires_mapillary_token(mock_get_secret_json):
    mock_get_secret_json.return_value = {
        "neon_db_uri": "postgresql://example",
        "firebase_service_account": '{"type":"service_account"}',
    }

    with pytest.raises(ValueError, match="non-empty 'mapillary_token' string"):
        get_secrets()
