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
            "dailyChallengeStatus": row["daily_challenge_status"],
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
                SELECT u.id AS user_id, u.display_name, u.country,
                       u.games_played, u.best_score, u.average_score, u.distance_unit,
                       u.created_at, u.updated_at,
                       CASE
                           WHEN dc.id IS NULL THEN 'unavailable'
                           WHEN daily_game.completed_at IS NOT NULL THEN 'completed'
                           WHEN daily_game.id IS NOT NULL THEN 'ongoing'
                           ELSE 'available'
                       END AS daily_challenge_status
                FROM users u
                LEFT JOIN daily_challenges dc
                    ON dc.date = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::DATE
                LEFT JOIN single_player_games daily_game
                    ON daily_game.daily_challenge_id = dc.id
                    AND daily_game.user_id = u.id
                WHERE u.id = %s
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
