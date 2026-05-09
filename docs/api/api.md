# 🛰️ DroneMap – API Design

Die DroneMap API besteht aus 4 Kernbereichen:

1. **Zones API** – Flugverbotszonen, Höhenlimits, Warnzonen  
2. **Rules API** – Gesetzliche Vorgaben pro Land  
3. **Geofencing API** – Distanzberechnung & Warnungen  
4. **Flight Planner API** (V1+) – Routen, Höhenprofil, Warnungen  
5. **Auth API** (V1+) – Accounts, Tokens  
6. **Pro API** – Export, Offline, Teams

---

# 1) Zones API (MVP)

## GET `/zones`
Liefert alle Zonen eines Landes oder einer Region.

### Query Parameter
| Name | Typ | Beschreibung |
|------|-----|--------------|
| `country` | string | ISO‑Code (CH, EU, US, DE, AT, …) |
| `bbox` | string | Bounding Box (optional) |
| `type` | string | nfz, warning, altitude, all |

### Beispiel



### Response (GeoJSON)
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "ch_nfz_001",
        "name": "Flughafen Zürich",
        "category": "no_fly_zone",
        "max_altitude": 0,
        "source": "FOCA",
        "updated_at": "2026-05-01T12:00:00Z"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [...]
      }
    }
  ]
}
