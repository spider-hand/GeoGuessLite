import json
import os

import boto3


def _enqueue(queue_url: str, payload: dict[str, object]) -> None:
    boto3.client("sqs").send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps(payload),
    )


def enqueue_round_timeout(game_id: str, round_number: int) -> None:
    _enqueue(
        os.environ["WITH_FRIENDS_ROUND_TIMEOUT_QUEUE_URL"],
        {"gameId": game_id, "roundNumber": round_number},
    )


def enqueue_game_start(game_id: str) -> None:
    _enqueue(os.environ["WITH_FRIENDS_GAME_START_QUEUE_URL"], {"gameId": game_id})


def enqueue_round_advance(game_id: str, round_number: int) -> None:
    _enqueue(
        os.environ["WITH_FRIENDS_ROUND_ADVANCE_QUEUE_URL"],
        {"gameId": game_id, "roundNumber": round_number},
    )
