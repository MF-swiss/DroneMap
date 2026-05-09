# api/zones.py – FastAPI Beispiel

from fastapi import APIRouter, Query
from geo.postgis import ZoneRepository

router = APIRouter()

@router.get("/zones")
def get_zones(country: str | None = Query(None), lat: float | None = None, lng: float | None = None):
    repo = ZoneRepository(dsn="postgres://...")
    if country:
        return repo.get_zones_by_country(country)
    if lat and lng:
        return repo.get_zones_by_location(lat, lng)
    return {"error": "country oder lat/lng erforderlich"}
