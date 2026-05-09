# 🏃‍♂️ DroneMap – Sprint Plan (Woche 1–6)

Dieser Sprint‑Plan deckt die komplette MVP‑Phase ab und ist so strukturiert,  
dass du jede Woche ein sichtbares, funktionierendes Ergebnis bekommst.

---

# 📌 Übersicht

- **Sprintdauer:** 6 Wochen  
- **Ziel:** DroneMap MVP (Karte + Standort + Basis‑Zonen + UI)  
- **Methodik:** Agile, wöchentliche Deliverables  
- **Tech:** Next.js, Mapbox, FastAPI/Node.js, PostGIS

---

# 🟢 Woche 1 – Projekt Setup & Basis-Architektur

### 🎯 Ziele
- Monorepo aufsetzen  
- Frontend + Backend Grundgerüst  
- Dev‑Umgebung stabil

### ✔️ Aufgaben
- GitHub Repo erstellen  
- Projektstruktur anlegen  
- Next.js + Tailwind + ShadCN installieren  
- Backend (FastAPI oder Node.js) initialisieren  
- Docker Compose für PostGIS  
- ENV‑Struktur definieren  
- CI‑Check (Linting, Prettier)

### 📦 Deliverable
- Startfähiges Projekt mit funktionierendem Frontend & Backend Skeleton

---

# 🔵 Woche 2 – Kartenintegration & UI‑Grundlayout

### 🎯 Ziele
- Mapbox integrieren  
- Premium‑UI Grundlayout

### ✔️ Aufgaben
- Mapbox initialisieren  
- Karte rendern (Satellit, Terrain, Hybrid)  
- User‑Marker (Mock)  
- UI‑Layout: Header, Floating Action Bar, Panels  
- Dark Mode + Theme System

### 📦 Deliverable
- Vollbild‑Karte + UI‑Grundgerüst

---

# 🟡 Woche 3 – GPS‑Standort & Zonen‑API (Backend)

### 🎯 Ziele
- Live‑Standort  
- Backend‑API für Zonen

### ✔️ Aufgaben
- `useGeolocation` Hook  
- Standort auf Karte anzeigen  
- Backend Endpoints:
  - `/zones?country=CH`
  - `/zones?country=EU`
  - `/zones?country=US`
- PostGIS Tabellen anlegen  
- Datenquellen vorbereiten (EASA, FOCA, FAA)

### 📦 Deliverable
- Karte zeigt **Live‑Standort**  
- Backend liefert **erste Zonen**

---

# 🟠 Woche 4 – Zonen‑Rendering & Info‑Panels

### 🎯 Ziele
- Zonen auf Karte anzeigen  
- Klickbare Info‑Panels

### ✔️ Aufgaben
- GeoJSON Layer Rendering  
- Farben & Styles:
  - Rot = NFZ
  - Gelb = Höhenlimit
  - Orange = Warnzone
- Popup/Panel mit:
  - Name
  - Kategorie
  - Höhe
  - Quelle
- Performance Optimierung (Clustering, Simplify)

### 📦 Deliverable
- DroneMap zeigt **echte Flugverbotszonen** auf der Karte

---

# 🟣 Woche 5 – Geofencing