flowchart TD

    %% ============================
    %%   START
    %% ============================

    START([App öffnen])

    %% ============================
    %%   PERMISSIONS
    %% ============================

    PERM[GPS-Berechtigung anfragen<br>„Standort erlauben?“]

    START --> PERM

    PERM -->|Erlaubt| HOME
    PERM -->|Abgelehnt| HOME_NO_GPS

    %% ============================
    %%   HOME SCREEN
    %% ============================

    HOME[Home Screen<br>Google Maps<br>Live-Standort aktiv]
    HOME_NO_GPS[Home Screen<br>Google Maps<br>Ohne Standort]

    %% ============================
    %%   LIVE LOCATION
    %% ============================

    subgraph LOCATION[📍 Live Standort]
        GPS[GPS aktiv<br>Position abrufen]
        TRACK[Live-Tracking<br>(optional)]
        USERMARKER[User Marker<br>auf Karte]
        RECENTER[„Standort zentrieren“ Button]
    end

    HOME --> GPS
    GPS --> USERMARKER
    USERMARKER --> TRACK
    RECENTER --> USERMARKER

    %% ============================
    %%   GEOFENCING
    %% ============================

    GEOFENCE[Live Geofencing<br>Safe / Warning / Restricted]

    TRACK --> GEOFENCE
    GPS --> GEOFENCE

    %% ============================
    %%   USER ACTIONS
    %% ============================

    subgraph ACTIONS[User Aktionen]
        LAYERS[Layer öffnen<br>NFZ / Höhen / NOTAMs]
        TAPZONE[Zone anklicken<br>Info Panel]
        PLAN[Flugplanung starten]
        SETTINGS[Einstellungen öffnen]
    end

    HOME --> LAYERS
    HOME --> TAPZONE
    HOME --> PLAN
    HOME --> SETTINGS

    %% ============================
    %%   ZONE DETAILS
    %% ============================

    ZONEINFO[Zonen-Info Panel<br>Name / Kategorie / Höhe / Quelle]
    TAPZONE --> ZONEINFO

    %% ============================
    %%   FLIGHT PLANNER
    %% ============================

    subgraph FLIGHT[✈️ Flugplanung]
        SETSTART[Startpunkt setzen<br>(optional: aktueller Standort)]
        SETEND[Endpunkt setzen]
        ROUTE[Route berechnen]
        ELEV[Höhenprofil anzeigen]
        WARN[Warnungen entlang der Route]
        EXPORT[Export (PDF/KML)<br>Pro Version]
    end

    PLAN --> SETSTART
    SETSTART --> SETEND
    SETEND --> ROUTE
    ROUTE --> ELEV
    ROUTE --> WARN
    WARN --> EXPORT

    %% ============================
    %%   SETTINGS
    %% ============================

    subgraph SETTINGSFLOW[Einstellungen]
        THEME[Dark/Light Mode]
        MAPSTYLE[Kartenstil wählen]
        COUNTRY[Land / Regulator wählen]
        PRIVACY[Datenschutz / GPS]
    end

    SETTINGS --> THEME
    SETTINGS --> MAPSTYLE
    SETTINGS --> COUNTRY
    SETTINGS --> PRIVACY

    %% ============================
    %%   RETURN FLOWS
    %% ============================

    ZONEINFO --> HOME
    GEOFENCE --> HOME
    EXPORT --> HOME
    SETTINGSFLOW --> HOME
