from unittest.mock import MagicMock

from src.jobs import process_with_friends_round_advance


def test_process_with_friends_round_advance_processes_each_queue_record(mocker):
    process = mocker.patch.object(process_with_friends_round_advance._service, "process_round_advance")
    event = {"Records": [{"body": '{"gameId":"one","roundNumber":2}'}]}
    process_with_friends_round_advance.process_with_friends_round_advance(event, MagicMock())
    process.assert_called_once_with("one", 2)
