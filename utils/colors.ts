import { ZONE_TYPES } from "@/components/DroneMapClient";

/**
 * Gibt die Farbe für einen gegebenen Zonentyp zurück.
 * Zonentypen basieren auf EU 2019/947.
 */
export function getZoneColor(zoneType: string): string {
  return ZONE_TYPES[zoneType]?.color ?? "#6b7280";
}

/**
 * Gibt das vollständige Styling-Objekt für Leaflet-Layer zurück.
 */
export function getZoneStyle(zoneType: string) {
  const color = getZoneColor(zoneType);
  return {
    color,
    fillColor: color,
    weight: 1.5,
    fillOpacity: 0.2,
    opacity: 0.75,
  };
}