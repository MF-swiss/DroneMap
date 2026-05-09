flowchart TD

    %% ============================
    %%   START
    %% ============================

    START([App öffnen])

    %% ============================
    %%   HOME SCREEN
    %% ============================

    HOME[Home Screen<br>Vollbild Karte<br>Google Maps]

    START --> HOME

    %% ============================
    %%   USER ACTIONS
    %% ============================

    subgraph ACTIONS[User Aktionen]
        LOCATE[Standort anzeigen<br>GPS aktivieren]
        LAYERS[Layer öffnen<br>NFZ / Höhen / NOTAMs]
        TAPZONE[Zone anklicken<br>Popup öffnen]
        PLAN[Flugplanung starten]
        SETTINGS[Einstellungen öffnen]
    end

    HOME --> LOCATE
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
    %%   GEOFENCING
    %% ============================

    GEOFENCE[Live Geofencing<br>Warnung: Safe / Warning / Restricted]
    LOCATE --> GEOFENCE
    HOME --> GEOFENCE

    %% ============================
    %%   FLIGHT PLANNER
    %% ============================

    subgraph FLIGHT[Flugplanung]
        SETSTART[Startpunkt setzen]
        SETEND[Endpunkt setzen]
        ROUTE[Route berechnen]
        ELEV[E Höhenprofil anzeigen]
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
