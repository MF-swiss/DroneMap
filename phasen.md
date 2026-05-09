🟢 MVP – Minimum Viable Product (4–6 Wochen)
Ziel: Eine funktionierende Web‑App, die Karte + Standort + Basis‑Zonen zeigt.

1) Basis‑Frontend
Next.js oder Nuxt (du bevorzugst modern → Next.js)

Tailwind + ShadCN (Premium‑Look, schnell)

PWA‑Setup (Mobile‑fähig)

2) Kartenintegration
Mapbox (beste Wahl für Custom Layers)

Features:

Zoom, Pan, Satellit

Standort anzeigen (GPS)

Custom Marker für User

3) Erste Luftraumdaten
Schweiz (BAZL / FOCA)

EU (EASA Open Data)

USA (FAA UAS Facility Maps)

Format: GeoJSON
Anzeige: Layer in Mapbox

4) Backend (leicht)
FastAPI oder Node.js

Endpunkte:

/zones?country=CH

/zones?country=US

/zones?country=EU

Cron‑Job: Daten 1× täglich aktualisieren

5) UI‑Grundstruktur
Home (Karte)

Layer‑Panel

Info‑Panel (Zone anklicken → Details)

Settings (Light/Dark Mode)

6) Deployment
Frontend: Vercel

Backend: Railway / Render

DB: PostgreSQL + PostGIS (klein)

MVP‑Ergebnis:  
DroneMap zeigt Karte + Standort + Flugverbotszonen für CH/EU/US.
Schnell, stabil, minimalistisch.

🔵 Version 1 – Vollwertige App (2–3 Monate)
Ziel: Internationale App mit Live‑Daten, Warnungen und Flugplanung.

1) Erweiterte Datenquellen
OpenAIP (weltweit)

DJI GEO Zones (wenn API möglich)

NOTAMs (Eurocontrol + FAA)

Höhenlimits pro Land

2) Live‑Warnsystem
Geofencing:

„Du näherst dich einer NFZ“

„Max. Höhe hier: 120m“

Echtzeit‑Status oben in der UI:

Safe / Warning / Restricted

3) Flugplanung
Startpunkt setzen

Route zeichnen

Höhenprofil

Warnungen entlang der Route

4) Account‑System
Login (E‑Mail oder OAuth)

Favoriten speichern

Einstellungen synchronisieren

5) Performance & Skalierung
Redis Cache

CDN für GeoJSON

Delta‑Updates statt Full‑Downloads

6) UI‑Verbesserungen
Premium‑Dark‑Mode

Glas‑UI Panels

Animierte Layer‑Transitions

V1‑Ergebnis:  
DroneMap ist international, live, warnfähig und professionell nutzbar.

🟣 Pro Version – Premium für Firmen & Pro‑Piloten (3–6 Monate)
Ziel: Monetarisierung + Profi‑Tools + Business‑Features.

1) Offline‑Karten (Premium)
Mapbox Offline Tiles

Lokale GeoJSON‑Caches

Flugplanung ohne Internet

2) Export‑Funktionen
PDF‑Export (Flugplan)

KML/GPX Export

Firmen‑Berichte

3) Team‑Funktionen
Mehrere Piloten verwalten

Gemeinsame Flugzonen

Rollen & Rechte

4) API für Firmen
REST API für:

Zonen

Höhenlimits

Flugplanung

API‑Keys & Rate Limits

5) Erweiterte Datenquellen
Kommerzielle Luftraumdaten

Satelliten‑Wetter (Wind, Regen, Sicht)

Live‑Windkarten (z. B. Windy API)

6) Business Dashboard
Heatmaps

Flugstatistiken

Compliance‑Reports

Pro‑Ergebnis:  
DroneMap wird ein Premium‑Tool für Firmen, Behörden und professionelle Piloten.

🧭 Zusammenfassung als Tabelle
|  Phase  |                 Fokus              |             Ergebnis              |
|  -----  | ---------------------------------- | --------------------------------- |
| **MVP** | Karte, Standort, Basis‑Zonen       | Funktionierende App               |
| ** V1** | Live‑Daten, Warnungen, Flugplanung | Internationale Profi‑App          |
| **Pro** | Offline, Export, Firmen‑Tools      | Monetarisierbares Premium‑Produkt |