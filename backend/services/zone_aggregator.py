# services/zone_aggregator.py

from typing import List
from data.foca_client import FocaClient
from data.easa_client import EasaClient
from data.faa_client import FaaClient
from data.openaip_client import OpenAipClient
from data.dji_client import DjiClient
from services.zone_normalizer import NormalizedZone
from geo.postgis import ZoneRepository

class ZoneAggregatorService:
    def __init__(self, repo: ZoneRepository):
        self.repo = repo
        self.clients = [
            FocaClient(),
            EasaClient(),
            FaaClient(),
            OpenAipClient(),
            DjiClient(),
        ]

    def update_all_zones(self) -> None:
        all_zones: List[NormalizedZone] = []

        for client in self.clients:
            try:
                zones = client.normalize()
                all_zones.extend(zones)
            except Exception as e:
                # TODO: Logging
                print(f"Error in {client.__class__.__name__}: {e}")

        self.repo.replace_all_zones(all_zones)
