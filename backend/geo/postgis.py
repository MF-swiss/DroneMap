# geo/postgis.py

import psycopg2
from typing import List
from services.zone_normalizer import NormalizedZone

class ZoneRepository:
    def __init__(self, dsn: str):
        self.dsn = dsn

    def replace_all_zones(self, zones: List[NormalizedZone]) -> None:
        conn = psycopg2.connect(self.dsn)
        cur = conn.cursor()

        # Einfacher Ansatz: truncate + bulk insert
        cur.execute("TRUNCATE TABLE zones;")

        for z in zones:
            cur.execute(
                """
                INSERT INTO zones (id, country, name, category, max_altitude, source, updated_at, geom)
                VALUES (%s, %s, %s, %s, %s, %s, %s,
                        ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326))
                """,
                (
                    z["id"],
                    z["country"],
                    z["name"],
                    z["category"],
                    z["max_altitude"],
                    z["source"],
                    z["updated_at"],
                    json.dumps(z["geometry"]),
                ),
            )

        conn.commit()
        cur.close()
        conn.close()
