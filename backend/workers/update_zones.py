# workers/update_zones.py

from services.zone_aggregator import ZoneAggregatorService
from geo.postgis import ZoneRepository

def run():
    repo = ZoneRepository(dsn="postgres://...")
    service = ZoneAggregatorService(repo=repo)
    service.update_all_zones()

if __name__ == "__main__":
    run()
