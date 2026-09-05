import io
import json
from unittest.mock import patch

from src.core.game import calculate_distance, calculate_score, get_image_coordinates


class Response(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


def test_calculate_distance_returns_zero_for_the_same_location():
    assert calculate_distance((35.0, 139.0), (35.0, 139.0)) == 0


def test_calculate_distance_returns_a_quarter_of_earths_circumference_at_the_equator():
    # A 90° longitude difference at the equator is π × 6,371 km ÷ 2 = 10,007.54 km.
    assert calculate_distance((0, 0), (0, 90)) == 10007.54


def test_calculate_score_returns_perfect_score_for_nearby_guess():
    assert calculate_score(0.02) == 5000


def test_calculate_score_returns_the_maximum_at_the_perfect_score_threshold():
    assert calculate_score(0.025) == 5000


def test_calculate_score_decreases_with_distance():
    assert calculate_score(100) < calculate_score(10)


@patch("src.core.game.get_secrets")
@patch("src.core.game.urlopen")
def test_get_image_coordinates_reads_computed_geometry(mock_urlopen, mock_get_secrets):
    mock_get_secrets.return_value = {"mapillary_token": "token"}
    mock_urlopen.return_value = Response(
        json.dumps({"computed_geometry": {"coordinates": [139.5, 35.5]}}).encode()
    )

    assert get_image_coordinates("image-1") == (35.5, 139.5)
    assert "access_token=token" in mock_urlopen.call_args.args[0]


@patch("src.core.game.get_secrets")
@patch("src.core.game.urlopen")
def test_get_image_coordinates_returns_none_for_missing_geometry(mock_urlopen, mock_get_secrets):
    mock_get_secrets.return_value = {"mapillary_token": "token"}
    mock_urlopen.return_value = Response(b"{}")

    assert get_image_coordinates("image-1") is None
