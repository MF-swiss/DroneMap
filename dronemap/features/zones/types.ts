export type Position = [longitude: number, latitude: number];

export interface PolygonGeometry {
  type: "Polygon";
  coordinates: Position[][];
}

export interface MultiPolygonGeometry {
  type: "MultiPolygon";
  coordinates: Position[][][];
}

export type ZoneGeometry = PolygonGeometry | MultiPolygonGeometry;

export type RestrictionType =
  | "prohibited"
  | "restricted"
  | "warning"
  | "information";

export interface DroneZone {
  id: string;
  title: string;
  restrictionType: RestrictionType;
  geometry: ZoneGeometry;

  description?: string;

  source: string;
  sourceUrl?: string;

  validFrom?: string;
  validTo?: string;

  maxAltitudeMeters?: number;

  updatedAt: string;
}
