from unittest.mock import MagicMock

from src.jobs import process_with_friends_game_start


def test_process_with_friends_game_start_processes_each_queue_record(mocker):
    process = mocker.patch.object(process_with_friends_game_start._service, "process_game_start")
    event = {"Records": [{"body": '{"gameId":"one"}'}, {"body": '{"gameId":"two"}'}]}
    process_with_friends_game_start.process_with_friends_game_start(event, MagicMock())
    assert [call.args for call in process.call_args_list] == [("one",), ("two",)]
