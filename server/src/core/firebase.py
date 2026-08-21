from typing import Any

from src.core.secret import get_secrets

FIREBASE_SERVER_TIMESTAMP = {".sv": "timestamp"}


def get_firebase_database_url() -> str:
    project_id = get_secrets()["firebase_service_account"]["project_id"]
    return f"https://{project_id}-default-rtdb.firebaseio.com"


def get_firebase_app() -> Any:
    import firebase_admin
    from firebase_admin import credentials

    try:
        return firebase_admin.get_app()
    except ValueError:
        return firebase_admin.initialize_app(
            credentials.Certificate(get_secrets()["firebase_service_account"]),
            options={"databaseURL": get_firebase_database_url()},
        )
