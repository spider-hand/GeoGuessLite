import json
import os

import boto3


def _enqueue(queue_url: str, game_id: str, round_number: int) -> None:
    boto3.client("sqs").send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps({"gameId": game_id, "roundNumber": round_number}),
    )


def enqueue_round_timeout(game_id: str, round_number: int) -> None:
    _enqueue(os.environ["WITH_FRIENDS_ROUND_TIMEOUT_QUEUE_URL"], game_id, round_number)


def enqueue_round_advance(game_id: str, round_number: int) -> None:
    _enqueue(os.environ["WITH_FRIENDS_ROUND_ADVANCE_QUEUE_URL"], game_id, round_number)
