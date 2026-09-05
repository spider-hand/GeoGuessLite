from datetime import date
from typing import Any

from src.core.db import get_connection
from src.features.daily_challenges.models import (
    DailyChallengeGameSummary,
    DailyChallengeLeaderboardEntry,
    DailyChallengeRecord,
)


def _map_challenge(rows: list[dict[str, Any]]) -> DailyChallengeRecord | None:
    if not rows:
        return None
    return DailyChallengeRecord.model_validate(
        {
            "id": rows[0]["id"],
            "date": rows[0]["date"],
            "rounds": [
                {
                    "roundNumber": row["round_number"],
                    "imageId": row["image_id"],
                    "targetLatitude": row["target_latitude"],
                    "targetLongitude": row["target_longitude"],
                }
                for row in rows
            ],
        }
    )


def _get_by_date(connection, challenge_date: date) -> DailyChallengeRecord | None:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT dc.id, dc.date, dcr.round_number, dcr.image_id,
                   dcr.target_latitude, dcr.target_longitude
            FROM daily_challenges dc
            JOIN daily_challenge_rounds dcr ON dcr.daily_challenge_id = dc.id
            WHERE dc.date = %s
            ORDER BY dcr.round_number
            """,
            (challenge_date,),
        )
        return _map_challenge(cursor.fetchall())


class DailyChallengesRepository:
    def get_by_date(self, challenge_date: date) -> DailyChallengeRecord | None:
        with get_connection() as connection:
            return _get_by_date(connection, challenge_date)

    def create(
        self,
        challenge_date: date,
        rounds: list[tuple[str, float, float]],
    ) -> DailyChallengeRecord:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO daily_challenges (date)
                VALUES (%s)
                ON CONFLICT (date) DO NOTHING
                RETURNING id
                """,
                (challenge_date,),
            )
            inserted = cursor.fetchone()
            if inserted is not None:
                challenge_id = inserted["id"]
                cursor.executemany(
                    """
                    INSERT INTO daily_challenge_rounds (
                        daily_challenge_id, round_number, image_id,
                        target_latitude, target_longitude
                    ) VALUES (%s, %s, %s, %s, %s)
                    """,
                    [
                        (challenge_id, number, image_id, latitude, longitude)
                        for number, (image_id, latitude, longitude) in enumerate(rounds, start=1)
                    ],
                )
            challenge = _get_by_date(connection, challenge_date)
        if challenge is None:
            raise RuntimeError("Daily challenge could not be loaded.")
        return challenge

    def delete_before(self, cutoff: date) -> int:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute("DELETE FROM daily_challenges WHERE date < %s", (cutoff,))
            return cursor.rowcount

    def list_completed_for_user(
        self, user_id: str, limit: int, sort_by: str, order_by: str
    ) -> list[DailyChallengeGameSummary]:
        sort_column = {"created_at": "g.created_at", "completed_at": "g.completed_at"}[
            sort_by
        ]
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT g.id, dc.date, COALESCE(SUM(r.score), 0) AS total_score,
                       CASE
                           WHEN COUNT(r.distance_km) = COUNT(*) THEN SUM(r.distance_km)
                           ELSE NULL
                       END AS total_distance_km,
                       g.completed_at
                FROM single_player_games g
                JOIN daily_challenges dc ON dc.id = g.daily_challenge_id
                JOIN single_player_game_rounds r ON r.game_id = g.id
                WHERE g.user_id = %s
                  AND g.game_mode = 'daily_challenge'
                  AND g.completed_at IS NOT NULL
                GROUP BY g.id, dc.date
                ORDER BY {sort_column} {order_by.upper()}
                LIMIT %s
                """,
                (user_id, limit),
            )
            return [DailyChallengeGameSummary.model_validate(row) for row in cursor.fetchall()]

    def get_leaderboard(
        self, challenge_date: date, limit: int
    ) -> list[DailyChallengeLeaderboardEntry]:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                WITH scores AS (
                    SELECT g.id, g.user_id, u.display_name, u.country,
                           g.completed_at, COALESCE(SUM(r.score), 0)::INTEGER AS total_score
                    FROM single_player_games g
                    JOIN daily_challenges dc ON dc.id = g.daily_challenge_id
                    JOIN single_player_game_rounds r ON r.game_id = g.id
                    JOIN users u ON u.id = g.user_id
                    WHERE dc.date = %s
                      AND g.game_mode = 'daily_challenge'
                      AND g.completed_at IS NOT NULL
                    GROUP BY g.id, g.user_id, u.display_name, u.country
                ), ranked AS (
                    SELECT RANK() OVER (ORDER BY total_score DESC) AS rank,
                           user_id, display_name, country, total_score, completed_at
                    FROM scores
                )
                SELECT rank, user_id, display_name, country, total_score
                FROM ranked
                ORDER BY rank, completed_at, user_id
                LIMIT %s
                """,
                (challenge_date, limit),
            )
            return [DailyChallengeLeaderboardEntry.model_validate(row) for row in cursor.fetchall()]
