import type {
  DroneZone,
  Position,
  RestrictionType,
} from "./types";

export interface ZoneStyle {
  color: string;
  fillColor: string;
  fillOpacity: number;
  weight: number;
}

/**
 * Liefert die Darstellungsfarben einer Zone für die Leaflet-Karte.
 */
export function getZoneStyle(
  restrictionType: RestrictionType,
): ZoneStyle {
  switch (restrictionType) {
    case "prohibited":
      return {
        color: "#dc2626",
        fillColor: "#ef4444",
        fillOpacity: 0.45,
        weight: 2,
      };

    case "restricted":
      return {
        color: "#ea580c",
        fillColor: "#f97316",
        fillOpacity: 0.4,
        weight: 2,
      };

    case "warning":
      return {
        color: "#ca8a04",
        fillColor: "#eab308",
        fillOpacity: 0.35,
        weight: 2,
      };

    case "information":
      return {
        color: "#2563eb",
        fillColor: "#3b82f6",
        fillOpacity: 0.3,
        weight: 2,
      };
  }
}

/**
 * Liefert eine lesbare deutsche Bezeichnung für einen Zonentyp.
 */
export function getRestrictionLabel(
  restrictionType: RestrictionType,
): string {
  switch (restrictionType) {
    case "prohibited":
      return "Flugverbot";

    case "restricted":
      return "Eingeschränkter Flugbereich";

    case "warning":
      return "Warnbereich";

    case "information":
      return "Information";
  }
}

/**
 * Prüft mit dem Ray-Casting-Verfahren, ob ein Punkt innerhalb
 * eines geschlossenen Polygon-Rings liegt.
 *
 * GeoJSON verwendet [Längengrad, Breitengrad].
 */
export function isPointInRing(
  point: Position,
  ring: Position[],
): boolean {
  const [pointLongitude, pointLatitude] = point;

  let isInside = false;

  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index++
  ) {
    const [longitude, latitude] = ring[index];
    const [previousLongitude, previousLatitude] = ring[previous];

    const crossesRay =
      latitude > pointLatitude !== previousLatitude > pointLatitude &&
      pointLongitude <
        ((previousLongitude - longitude) * (pointLatitude - latitude)) /
          (previousLatitude - latitude) +
          longitude;

    if (crossesRay) {
      isInside = !isInside;
    }
  }

  return isInside;
}

/**
 * Prüft, ob sich ein Punkt innerhalb eines GeoJSON-Polygons befindet.
 * Der erste Ring ist die Außenkante, alle weiteren Ringe sind Löcher.
 */
export function isPointInPolygon(
  point: Position,
  polygon: Position[][],
): boolean {
  const [outerRing, ...holes] = polygon;

  if (!outerRing || !isPointInRing(point, outerRing)) {
    return false;
  }

  return !holes.some((hole) => isPointInRing(point, hole));
}

/**
 * Prüft, ob ein Punkt in einer Polygon- oder MultiPolygon-Zone liegt.
 */
export function isPointInZone(
  point: Position,
  zone: DroneZone,
): boolean {
  if (zone.geometry.type === "Polygon") {
    return isPointInPolygon(point, zone.geometry.coordinates);
  }

  return zone.geometry.coordinates.some((polygon) =>
    isPointInPolygon(point, polygon),
  );
}

/**
 * Gibt alle Zonen zurück, welche den angegebenen Punkt enthalten.
 */
export function getZonesAtPoint(
  point: Position,
  zones: DroneZone[],
): DroneZone[] {
  return zones.filter((zone) => isPointInZone(point, zone));
}
