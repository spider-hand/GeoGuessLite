from datetime import datetime
from typing import Any

from src.core.db import get_connection
from src.features.single_player_games.models import (
    OrderBy,
    SinglePlayerGameRecord,
    SinglePlayerGameRoundRecord,
    SinglePlayerGamesSortBy,
    SinglePlayerGameSummary,
)


def _map_round(row: dict[str, Any]) -> SinglePlayerGameRoundRecord:
    return SinglePlayerGameRoundRecord.model_validate(
        {
            "roundNumber": row["round_number"],
            "imageId": row["image_id"],
            "targetLatitude": row["target_latitude"],
            "targetLongitude": row["target_longitude"],
            "startedAt": row["started_at"],
            "guessLatitude": row["guess_latitude"],
            "guessLongitude": row["guess_longitude"],
            "distanceKm": row["distance_km"],
            "score": row["score"],
            "completedAt": row["round_completed_at"],
        }
    )


def _get_game(connection, game_id: str, user_id: str) -> SinglePlayerGameRecord | None:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT g.id, g.user_id, g.created_at, g.completed_at,
                   r.round_number, r.image_id, r.target_latitude, r.target_longitude,
                   r.started_at, r.guess_latitude, r.guess_longitude,
                   r.distance_km, r.score, r.completed_at AS round_completed_at
            FROM single_player_games g
            JOIN single_player_game_rounds r ON r.game_id = g.id
            WHERE g.id = %s AND g.user_id = %s
            ORDER BY r.round_number
            """,
            (game_id, user_id),
        )
        rows = cursor.fetchall()

    if not rows:
        return None
    return SinglePlayerGameRecord.model_validate(
        {
            "id": rows[0]["id"],
            "userId": rows[0]["user_id"],
            "createdAt": rows[0]["created_at"],
            "completedAt": rows[0]["completed_at"],
            "rounds": [_map_round(row) for row in rows],
        }
    )


class SinglePlayerGamesRepository:
    def get_random_panorama_ids(self, limit: int) -> list[str]:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM images WHERE is_pano = TRUE ORDER BY RANDOM() LIMIT %s",
                (limit,),
            )
            return [row["id"] for row in cursor.fetchall()]

    def create(self, game_id: str, user_id: str, rounds: list[tuple[str, float, float]]) -> SinglePlayerGameRecord:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO single_player_games (id, user_id) VALUES (%s, %s)",
                (game_id, user_id),
            )
            cursor.executemany(
                """
                INSERT INTO single_player_game_rounds (
                    game_id, round_number, image_id, target_latitude, target_longitude
                ) VALUES (%s, %s, %s, %s, %s)
                """,
                [
                    (game_id, round_number, image_id, latitude, longitude)
                    for round_number, (image_id, latitude, longitude) in enumerate(rounds, start=1)
                ],
            )
            game = _get_game(connection, game_id, user_id)
        if game is None:
            raise RuntimeError("Created single-player game could not be loaded.")
        return game

    def get_by_id(self, game_id: str, user_id: str) -> SinglePlayerGameRecord | None:
        with get_connection() as connection:
            return _get_game(connection, game_id, user_id)

    def list_completed(
        self,
        user_id: str,
        limit: int,
        sort_by: SinglePlayerGamesSortBy,
        order_by: OrderBy,
    ) -> list[SinglePlayerGameSummary]:
        sort_column = {"created_at": "g.created_at", "completed_at": "g.completed_at"}[sort_by]
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT g.id, COALESCE(SUM(r.score), 0) AS total_score,
                       g.created_at, g.completed_at
                FROM single_player_games g
                JOIN single_player_game_rounds r ON r.game_id = g.id
                WHERE g.user_id = %s AND g.completed_at IS NOT NULL
                GROUP BY g.id
                ORDER BY {sort_column} {order_by.upper()}
                LIMIT %s
                """,
                (user_id, limit),
            )
            return [
                SinglePlayerGameSummary.model_validate(
                    {
                        "id": row["id"],
                        "totalScore": row["total_score"],
                        "createdAt": row["created_at"],
                        "completedAt": row["completed_at"],
                    }
                )
                for row in cursor.fetchall()
            ]

    def start_round(
        self, game_id: str, user_id: str, round_number: int, started_at: datetime
    ) -> SinglePlayerGameRecord | None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT g.id
                FROM single_player_games g
                JOIN single_player_game_rounds r ON r.game_id = g.id
                WHERE g.id = %s AND g.user_id = %s AND r.round_number = %s
                FOR UPDATE OF g, r
                """,
                (game_id, user_id, round_number),
            )
            cursor.execute(
                """
                UPDATE single_player_game_rounds r
                SET started_at = %s
                FROM single_player_games g
                WHERE r.game_id = g.id
                  AND g.id = %s
                  AND g.user_id = %s
                  AND g.completed_at IS NULL
                  AND r.round_number = %s
                  AND r.started_at IS NULL
                  AND NOT EXISTS (
                      SELECT 1 FROM single_player_game_rounds previous
                      WHERE previous.game_id = r.game_id
                        AND previous.round_number < r.round_number
                        AND previous.completed_at IS NULL
                  )
                """,
                (started_at, game_id, user_id, round_number),
            )
            return _get_game(connection, game_id, user_id)

    def complete_round(
        self,
        game_id: str,
        user_id: str,
        round_number: int,
        *,
        completed_at: datetime,
        guess_latitude: float | None,
        guess_longitude: float | None,
        distance_km: float | None,
        score: int,
    ) -> SinglePlayerGameRecord | None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT g.id
                FROM single_player_games g
                JOIN single_player_game_rounds r ON r.game_id = g.id
                WHERE g.id = %s AND g.user_id = %s AND r.round_number = %s
                FOR UPDATE OF g, r
                """,
                (game_id, user_id, round_number),
            )
            cursor.execute(
                """
                UPDATE single_player_game_rounds r
                SET guess_latitude = %s,
                    guess_longitude = %s,
                    distance_km = %s,
                    score = %s,
                    completed_at = %s
                FROM single_player_games g
                WHERE r.game_id = g.id
                  AND g.id = %s
                  AND g.user_id = %s
                  AND g.completed_at IS NULL
                  AND r.round_number = %s
                  AND r.started_at IS NOT NULL
                  AND r.completed_at IS NULL
                RETURNING r.game_id
                """,
                (
                    guess_latitude,
                    guess_longitude,
                    distance_km,
                    score,
                    completed_at,
                    game_id,
                    user_id,
                    round_number,
                ),
            )
            did_complete_round = cursor.fetchone() is not None
            if did_complete_round and round_number == 5:
                cursor.execute(
                    """
                    UPDATE single_player_games
                    SET completed_at = %s
                    WHERE id = %s
                      AND completed_at IS NULL
                      AND NOT EXISTS (
                          SELECT 1 FROM single_player_game_rounds
                          WHERE game_id = %s AND completed_at IS NULL
                      )
                    RETURNING id
                    """,
                    (completed_at, game_id, game_id),
                )
                if cursor.fetchone() is not None:
                    cursor.execute(
                        """
                        SELECT COALESCE(SUM(score), 0) AS total_score
                        FROM single_player_game_rounds
                        WHERE game_id = %s
                        """,
                        (game_id,),
                    )
                    total_score = cursor.fetchone()["total_score"]
                    cursor.execute(
                        """
                        UPDATE users
                        SET best_score = GREATEST(best_score, %s),
                            average_score = ((average_score * games_played) + %s) / (games_played + 1),
                            games_played = games_played + 1,
                            updated_at = NOW()
                        WHERE id = %s
                        """,
                        (total_score, total_score, user_id),
                    )
            return _get_game(connection, game_id, user_id)

    def delete_expired(self) -> int:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                "DELETE FROM single_player_games WHERE created_at < NOW() - INTERVAL '30 days'"
            )
            return cursor.rowcount
