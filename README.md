# 🛰️ DroneMap  
**Weltweite Live-Drohnenkarte mit Flugverbotszonen, Höhenlimits & Echtzeit-Warnungen**

DroneMap ist eine moderne Web‑App für Desktop & Smartphone, die Drohnenpiloten weltweit zeigt, **wo sie legal fliegen dürfen**.  
Mit Live‑Karten, internationalen Luftraumdaten, Geofencing‑Warnungen und einer klaren Premium‑UI.

---

## 🚀 Features

### 🗺️ Live-Karte
- Mapbox / Google Maps Integration  
- Satellit, Terrain, Hybrid  
- Live-GPS-Standort  
- Custom Layer für Flugverbotszonen  

### 🚫 Luftraumdaten (weltweit)
- **Europa (EASA)**  
- **Schweiz (BAZL / FOCA)**  
- **USA (FAA UAS Facility Maps)**  
- **OpenAIP (weltweit)**  
- **NOTAMs (Eurocontrol / FAA)**  
- DJI GEO Zones (optional)

### ⚠️ Geofencing & Warnungen
- „Du näherst dich einer NFZ“  
- Höhenlimits  
- Temporäre Sperrgebiete  
- Live-Status: *Safe / Warning / Restricted*

### ✈️ Flugplanung (V1+)
- Route zeichnen  
- Höhenprofil  
- Warnungen entlang der Route  
- Export (PDF/KML) – *Pro*

### 📱 PWA – Mobile & Desktop
- Offlinefähig (Pro)  
- Homescreen‑App  
- Ultra-schnelle UI  

---

## 🏗️ Architektur

### Frontend
- **Next.js 14 (App Router)**
- **React**
- **TailwindCSS + ShadCN**
- **Mapbox GL**
- **PWA**

### Backend
- **FastAPI** oder **Node.js**
- Geo‑Processing Engine  
- Regel‑Aggregator (EASA, FAA, OpenAIP, FOCA)  
- Cron‑Jobs für Datenupdates  

### Datenbank
- **PostgreSQL + PostGIS**  
- GeoJSON‑Storage  
- Redis Cache  

---

## 📂 Projektstruktur

drone-map/
├── frontend/               # Next.js App
│   ├── src/
│   │   ├── app/            # Routing
│   │   ├── components/     # UI
│   │   ├── features/       # Map, Zones, Auth
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   └── public/
│
├── backend/                # FastAPI / Node.js
│   ├── src/
│   │   ├── api/            # Endpoints
│   │   ├── services/       # Business-Logik
│   │   ├── data/           # Datenquellen
│   │   ├── geo/            # PostGIS
│   │   ├── models/
│   │   ├── schemas/
│   │   └── workers/        # Cronjobs
│   └── tests/
│
├── database/
│   ├── migrations/
│   └── schema.sql
│
├── infra/                  # DevOps
│   ├── docker/
│   ├── k8s/
│   ├── terraform/
│   └── ci-cd/
│
└── docs/
├── architecture/
├── api/
├── ui/
└── roadmap/



---

## 🧭 Roadmap

### 🟢 MVP (4–6 Wochen)
- Karte + Standort  
- CH/EU/US Zonen  
- Basis‑Backend  
- PWA  
- Info‑Panel  

### 🔵 Version 1 (2–3 Monate)
- Weltweite Daten  
- NOTAMs  
- Flugplanung  
- Live‑Warnungen  
- Account‑System  

### 🟣 Pro Version (3–6 Monate)
- Offline‑Karten  
- Export (PDF/KML)  
- Team‑Funktionen  
- Firmen‑API  
- Wetter & Winddaten  

---

## 🛠️ Installation

### Frontend
```bash
cd frontend
npm install
npm run dev


Backend
bash
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload

Datenbank (PostGIS)
bash
docker-compose up -d



🤝 Mitwirken
Pull Requests sind willkommen.
Bitte vorher ein Issue eröffnen, um Änderungen zu diskutieren.

📄 Lizenz
MIT License – frei nutzbar für private & kommerzielle Projekte.

👤 Autor
Marco Fritsche  
Drohnenpilot • Entwickler • Premium Branding
LinkedIn: coming soon