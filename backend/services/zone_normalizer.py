# services/zone_normalizer.py

from typing import TypedDict, Literal, Any

ZoneCategory = Literal["no_fly_zone", "warning", "altitude_limit", "restricted", "other"]

class NormalizedZone(TypedDict):
    id: str
    country: str
    name: str
    category: ZoneCategory
    max_altitude: float | None
    source: str
    updated_at: str
    geometry: dict  # GeoJSON
