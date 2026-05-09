# data/foca_client.py

import requests
from typing import List
from .base_client import BaseZoneClient
from services.zone_normalizer import NormalizedZone

FOCA_URL = "https://example-foca.ch/drones/zones.geojson"  # Platzhalter

class FocaClient(BaseZoneClient):
    def fetch_raw(self) -> dict:
        resp = requests.get(FOCA_URL, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def normalize(self) -> List[NormalizedZone]:
        raw = self.fetch_raw()
        zones: List[NormalizedZone] = []

        for feature in raw.get("features", []):
            props = feature.get("properties", {})
            zones.append(
                {
                    "id": f"CH_{props.get('id')}",
                    "country": "CH",
                    "name": props.get("name", "Unbenannt"),
                    "category": self._map_category(props),
                    "max_altitude": props.get("max_altitude"),
                    "source": "FOCA",
                    "updated_at": props.get("updated_at", ""),
                    "geometry": feature.get("geometry"),
                }
            )
        return zones

    def _map_category(self, props) -> str:
        # Mapping FOCA → internes Schema
        t = props.get("type", "").lower()
        if "nfz" in t or "no-fly" in t:
            return "no_fly_zone"
        if "warning" in t:
            return "warning"
        if "altitude" in t:
            return "altitude_limit"
        return "other"
