frontend/
└── src/
    ├── app/
    │   ├── page.tsx                # Home (Karte)
    │   ├── settings/
    │   ├── flight-planner/
    │   └── api/                    # Next.js API Routes (optional)
    │
    ├── components/
    │   ├── map/
    │   │   ├── MapContainer.tsx
    │   │   ├── MapLayers.tsx
    │   │   ├── UserMarker.tsx
    │   │   └── ZonePopup.tsx
    │   ├── ui/                     # ShadCN UI Components
    │   └── layout/
    │
    ├── features/
    │   ├── zones/                  # Zonen-Feature
    │   │   ├── useZones.ts
    │   │   ├── zones.api.ts
    │   │   └── zones.types.ts
    │   ├── geofencing/
    │   ├── auth/
    │   └── flight-planner/
    │
    ├── hooks/
    │   ├── useGeolocation.ts
    │   ├── useMap.ts
    │   └── useTheme.ts
    │
    ├── lib/
    │   ├── mapbox.ts
    │   ├── api-client.ts
    │   └── constants.ts
    │
    ├── styles/
    └── types/
