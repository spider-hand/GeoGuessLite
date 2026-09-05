from unittest.mock import MagicMock

from src.jobs import process_with_friends_round_timeout


def test_process_with_friends_round_timeout_processes_each_queue_record(mocker):
    process = mocker.patch.object(process_with_friends_round_timeout._service, "process_round_timeout")
    event = {"Records": [{"body": '{"gameId":"one","roundNumber":2}'}]}
    process_with_friends_round_timeout.process_with_friends_round_timeout(event, MagicMock())
    process.assert_called_once_with("one", 2)
