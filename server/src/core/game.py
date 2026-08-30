import json
import math
from datetime import timedelta
from urllib.parse import urlencode
from urllib.request import urlopen

from src.core.secret import get_secrets

EARTH_RADIUS_KM = 6371
GAME_ROUND_COUNT = 5
GAME_IMAGE_CANDIDATE_COUNT = GAME_ROUND_COUNT * 2
GAME_ROUND_TIMEOUT = timedelta(seconds=60)
MAX_SCORE = 5000
PERFECT_SCORE_THRESHOLD_KM = 0.025
WORLD_SCALE = 14917


def calculate_distance(first: tuple[float, float], second: tuple[float, float]) -> float:
    latitude_delta = math.radians(second[0] - first[0])
    longitude_delta = math.radians(second[1] - first[1])
    first_latitude = math.radians(first[0])
    second_latitude = math.radians(second[0])
    haversine = (
        math.sin(latitude_delta / 2) ** 2
        + math.sin(longitude_delta / 2) ** 2 * math.cos(first_latitude) * math.cos(second_latitude)
    )
    return round(EARTH_RADIUS_KM * 2 * math.atan2(math.sqrt(haversine), math.sqrt(1 - haversine)), 2)


def calculate_score(distance_km: float) -> int:
    if distance_km <= PERFECT_SCORE_THRESHOLD_KM:
        return MAX_SCORE
    return round(MAX_SCORE * math.exp(-(10 * distance_km) / WORLD_SCALE))


def get_image_coordinates(image_id: str) -> tuple[float, float] | None:
    query = urlencode(
        {
            "fields": "id,computed_geometry",
            "access_token": get_secrets()["mapillary_token"],
        }
    )
    try:
        with urlopen(f"https://graph.mapillary.com/{image_id}?{query}", timeout=5) as response:
            payload = json.load(response)
        longitude, latitude = payload["computed_geometry"]["coordinates"]
        if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
            return None
        return float(latitude), float(longitude)
    except (KeyError, TypeError, ValueError, OSError, json.JSONDecodeError):
        return None
