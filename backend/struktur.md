backend/
└── src/
    ├── api/
    │   ├── zones.py            # /zones
    │   ├── countries.py        # /countries
    │   ├── auth.py             # /auth
    │   └── flight.py           # /flight-planner
    │
    ├── services/
    │   ├── zone_service.py     # Zonen aggregieren
    │   ├── rules_service.py    # Regeln pro Land
    │   ├── notam_service.py    # NOTAMs laden
    │   ├── geofencing.py       # Geofencing-Logik
    │   └── flight_planner.py   # Routenberechnung
    │
    ├── data/
    │   ├── easa_client.py
    │   ├── faa_client.py
    │   ├── openaip_client.py
    │   ├── dji_client.py
    │   └── cache.py
    │
    ├── geo/
    │   ├── postgis.py
    │   ├── geojson_utils.py
    │   └── spatial_queries.py
    │
    ├── models/
    │   ├── zone.py
    │   ├── country.py
    │   └── user.py
    │
    ├── schemas/
    │   ├── zone_schema.py
    │   ├── flight_schema.py
    │   └── user_schema.py
    │
    ├── workers/
    │   ├── update_zones.py     # Cronjob
    │   ├── update_notams.py
    │   └── scheduler.py
    │
    └── utils/
        ├── logger.py
        ├── config.py
        └── http.py
