flowchart TD

    %% ============================
    %%   DATENQUELLEN (EXTERN)
    %% ============================

    subgraph Sources[🌍 Externe Datenquellen]
        EASA[EASA Geo Zones<br>EU-Länder]
        FOCA[FOCA / BAZL<br>Schweiz]
        FAA[FAA UAS Facility Maps<br>USA]
        OPENAIP[OpenAIP<br>Weltweit]
        DJI[DJI GEO Zones<br>Global]
        NOTAM[NOTAMs<br>Eurocontrol / FAA]
    end

    %% ============================
    %%   FETCHING LAYER
    %% ============================

    subgraph Fetching[⬇️ Datenabruf (Clients)]
        C1[EasaClient.py]
        C2[FocaClient.py]
        C3[FaaClient.py]
        C4[OpenAipClient.py]
        C5[DjiClient.py]
        C6[NotamClient.py]
    end

    %% ============================
    %%   NORMALIZATION LAYER
    %% ============================

    subgraph Normalization[🔄 Normalisierung]
        NORM[ZoneNormalizer.py<br>→ Einheitliches GeoJSON Schema]
    end

    %% ============================
    %%   AGGREGATION LAYER
    %% ============================

    subgraph Aggregation[🧩 Aggregation]
        AGG[ZoneAggregatorService.py<br>→ Zusammenführen aller Quellen]
    end

    %% ============================
    %%   STORAGE LAYER
    %% ============================

    subgraph Storage[🗄️ Speicherung]
        POSTGIS[(PostGIS<br>zones table)]
        REDIS[(Redis Cache)]
    end

    %% ============================
    %%   API LAYER
    %% ============================

    subgraph API[🌐 DroneMap API]
        ZONES[/zones?country=CH/]
        GEO[/geofencing/check/]
        RULES[/rules/{country}/]
    end

    %% ============================
    %%   FRONTEND
    %% ============================

    subgraph Frontend[🛰️ Frontend – Google Maps]
        GMAPS[Google Maps JS API<br>Satellit / Hybrid / Terrain]
        LAYERS[Custom GeoJSON Layers<br>NFZ / Höhenlimits / NOTAMs]
        GEOFENCE[Live Geofencing<br>Warnungen]
    end

    %% ============================
    %%   FLOWS
    %% ============================

    %% Sources → Fetching
    EASA --> C1
    FOCA --> C2
    FAA --> C3
    OPENAIP --> C4
    DJI --> C5
    NOTAM --> C6

    %% Fetching → Normalization
    C1 --> NORM
    C2 --> NORM
    C3 --> NORM
    C4 --> NORM
    C5 --> NORM
    C6 --> NORM

    %% Normalization → Aggregation
    NORM --> AGG

    %% Aggregation → Storage
    AGG --> POSTGIS
    AGG --> REDIS

    %% Storage → API
    POSTGIS --> ZONES
    POSTGIS --> GEO
    POSTGIS --> RULES

    %% API → Frontend
    ZONES --> LAYERS
    GEO --> GEOFENCE
    RULES --> GMAPS

    %% Frontend internal flow
    GMAPS --> LAYERS
    LAYERS --> GEOFENCE
