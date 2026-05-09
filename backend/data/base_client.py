# data/base_client.py

from abc import ABC, abstractmethod
from typing import List
from services.zone_normalizer import NormalizedZone

class BaseZoneClient(ABC):
    @abstractmethod
    def fetch_raw(self) -> dict:
        ...

    @abstractmethod
    def normalize(self) -> List[NormalizedZone]:
        ...
