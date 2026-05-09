flowchart TD

    %% ============================
    %%   FRONTEND ROOT
    %% ============================

    subgraph APP[🌐 DroneMap Frontend (Next.js)]
        ROUTER[Next.js App Router]
        STATE[Global State<br>Zustand / Cache]
        API[API Client<br>(/zones, /rules, /geofencing)]
    end

    %% ============================
    %%   GOOGLE MAPS ENGINE
    %% ============================

    subgraph MAPS[🗺️ Google Maps Engine]
        GMAPS[Google Maps JS API<br>Satellit / Hybrid / Terrain]
        GEOJSON[GeoJSON Layer Renderer]
        MARKERS[User Marker<br>+ Custom Icons]
        CONTROLS[Map Controls<br>Zoom / Style / Compass]
    end

    %% ============================
    %%   FEATURE MODULES
    %% ============================

    subgraph FEATURES[🧩 Feature Layer]
        ZONES[Zones Module<br>NFZ / Höhenlimits / NOTAMs]
        GEOFENCE[Geofencing Engine<br>Live Warnungen]
        FLIGHT[Flight Planner<br>Route + Höhenprofil]
        RULES[Rules Module<br>Landesregeln]
    end

    %% ============================
    %%   UI LAYER
    %% ============================

    subgraph UI[🎨 UI Layer (ShadCN + Tailwind)]
        HEADER[Header Bar<br>Logo / Status / Country]
        ACTIONS[Floating Action Bar<br>Standort / Layer / Planung]
        PANELS[Info Panels<br>Zonen / Regeln / Details]
        MODALS[Modals<br>Einstellungen / Warnungen]
    end

    %% ============================
    %%   DEVICE INTEGRATION
    %% ============================

    subgraph DEVICE[📱 Device Integration]
        GPS[Geolocation API<br>Live Standort]
        PWA[PWA Engine<br>Offline Shell / Icons]
        STORAGE[Local Storage<br>Settings / Cache]
    end

    %% ============================
    %%   FLOWS
    %% ============================

    %% Router → UI
    ROUTER --> UI

    %% UI → Features
    UI --> ZONES
    UI --> GEOFENCE
    UI --> FLIGHT
    UI --> RULES

    %% Features → API
    ZONES --> API
    GEOFENCE --> API
    FLIGHT --> API
    RULES --> API

    %% API → State
    API --> STATE

    %% State → Features
    STATE --> ZONES
    STATE --> GEOFENCE
    STATE --> FLIGHT
    STATE --> RULES

    %% Features → Google Maps
    ZONES --> GEOJSON
    GEOFENCE --> GMAPS
    FLIGHT --> GMAPS

    %% Google Maps internal
    GMAPS --> GEOJSON
    GMAPS --> MARKERS
    GMAPS --> CONTROLS

    %% Device Integration
    GPS --> MARKERS
    GPS --> GEOFENCE
    STORAGE --> UI
    PWA --> APP
