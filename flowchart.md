flowchart TD

  subgraph UI[Frontend – DroneMap WebApp]
    A1[Next.js / React<br>Tailwind / ShadCN]
    A2[PWA – Mobile & Desktop]
    A3[Map Engine<br>Mapbox / Google Maps]
    A4[GPS Standort]
    A5[Layer Rendering<br>NFZ / Höhenlimits / NOTAMs]
  end

  subgraph API[Backend – Geo & Rules Engine]
    B1[FastAPI / Node.js]
    B2[Geo-Processing Engine]
    B3[Rules Aggregator<br>(EASA / FAA / OpenAIP)]
    B4[Scheduler<br>Cron Updates]
    B5[Auth / API Keys]
  end

  subgraph DB[Datenbank & Cache]
    C1[PostgreSQL + PostGIS]
    C2[Redis Cache]
    C3[GeoJSON Storage]
  end

  subgraph Sources[Datenquellen]
    D1[EASA Open Data]
    D2[BAZL / FOCA]
    D3[FAA UAS Facility Maps]
    D4[OpenAIP]
    D5[DJI GEO Zones]
    D6[NOTAMs]
  end

  UI -->|Requests| API
  API -->|Aggregiert Daten| Sources
  API -->|Speichert / lädt| DB
  UI -->|Live Standort| A4
  API -->|Sendet Zonen & Regeln| UI
