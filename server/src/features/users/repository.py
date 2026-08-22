from typing import Any

from src.core.db import get_connection
from src.features.users.models import CurrentUserRecord, DistanceUnit, UserRecord


def _map_user_row(row: dict[str, Any]) -> UserRecord:
    return UserRecord.model_validate(
        {
            "userId": row["user_id"],
            "displayName": row["display_name"],
            "country": row["country"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }
    )


def _map_current_user_row(row: dict[str, Any]) -> CurrentUserRecord:
    return CurrentUserRecord.model_validate(
        {
            "userId": row["user_id"],
            "displayName": row["display_name"],
            "country": row["country"],
            "gamesPlayed": row["games_played"],
            "bestScore": row["best_score"],
            "averageScore": row["average_score"],
            "distanceUnit": row["distance_unit"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }
    )


class UsersRepository:
    def get_by_id(self, user_id: str) -> UserRecord | None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id AS user_id, display_name, country, created_at, updated_at
                FROM users
                WHERE id = %s
                """,
                (user_id,),
            )
            row = cursor.fetchone()

        return _map_user_row(row) if row is not None else None

    def get_current_by_id(self, user_id: str) -> CurrentUserRecord | None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id AS user_id, display_name, country,
                       games_played, best_score, average_score, distance_unit,
                       created_at, updated_at
                FROM users
                WHERE id = %s
                """,
                (user_id,),
            )
            row = cursor.fetchone()

        return _map_current_user_row(row) if row is not None else None

    def create(self, user_id: str, display_name: str, country: str | None) -> UserRecord:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO users (id, display_name, country)
                VALUES (%s, %s, %s)
                RETURNING id AS user_id, display_name, country, created_at, updated_at
                """,
                (user_id, display_name, country),
            )
            row = cursor.fetchone()

        return _map_user_row(row)

    def update(
        self,
        user_id: str,
        display_name: str,
        country: str | None,
        distance_unit: DistanceUnit,
    ) -> UserRecord | None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE users
                SET display_name = %s,
                    country = %s,
                    distance_unit = %s,
                    updated_at = NOW()
                WHERE id = %s
                RETURNING id AS user_id, display_name, country, created_at, updated_at
                """,
                (display_name, country, distance_unit, user_id),
            )
            row = cursor.fetchone()

        return _map_user_row(row) if row is not None else None

    def delete(self, user_id: str) -> bool:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            deleted_count = cursor.rowcount

        return deleted_count > 0
