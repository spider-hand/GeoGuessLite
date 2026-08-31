from datetime import datetime
from typing import Any

from psycopg.types.json import Jsonb

from src.core.db import get_connection
from src.features.with_friends_games.models import WithFriendsGameRecord


def _map_game(row: dict[str, Any]) -> WithFriendsGameRecord:
    return WithFriendsGameRecord.model_validate(
        {
            "id": row["id"],
            "roomKey": row["room_key"],
            "hostUserId": row["host_user_id"],
            "result": row["result"],
            "createdAt": row["created_at"],
            "completedAt": row["completed_at"],
        }
    )


class WithFriendsGamesRepository:
    def create(self, game_id: str, room_key: str, host_user_id: str) -> WithFriendsGameRecord | None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO with_friends_games (id, room_key, host_user_id)
                VALUES (%s, %s, %s)
                ON CONFLICT (room_key) DO NOTHING
                RETURNING id, room_key, host_user_id, result, created_at, completed_at
                """,
                (game_id, room_key, host_user_id),
            )
            row = cursor.fetchone()
        return _map_game(row) if row is not None else None

    def get_by_id(self, game_id: str) -> WithFriendsGameRecord | None:
        return self._get("id = %s", game_id)

    def get_by_room_key(self, room_key: str) -> WithFriendsGameRecord | None:
        return self._get("room_key = %s", room_key)

    def _get(self, condition: str, value: str) -> WithFriendsGameRecord | None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT id, room_key, host_user_id, result, created_at, completed_at
                FROM with_friends_games
                WHERE {condition}
                """,
                (value,),
            )
            row = cursor.fetchone()
        return _map_game(row) if row is not None else None

    def finish(self, game_id: str, result: dict[str, object], completed_at: datetime) -> bool:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE with_friends_games
                SET result = %s, completed_at = %s
                WHERE id = %s AND result IS NULL
                """,
                (Jsonb(result), completed_at, game_id),
            )
            return cursor.rowcount == 1

    def get_expired_ids(self) -> list[str]:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id
                FROM with_friends_games
                WHERE (completed_at IS NOT NULL AND completed_at < NOW() - INTERVAL '30 days')
                   OR (completed_at IS NULL AND created_at < NOW() - INTERVAL '30 days')
                """
            )
            return [row["id"] for row in cursor.fetchall()]

    def delete(self, game_ids: list[str]) -> int:
        if not game_ids:
            return 0
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute("DELETE FROM with_friends_games WHERE id = ANY(%s)", (game_ids,))
            return cursor.rowcount
