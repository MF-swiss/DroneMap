// utils/normalizeZones.ts
export type RawGeoJSON = any;

export function normalizeZones(data: RawGeoJSON, country: string) {
  if (!data || !Array.isArray(data.features)) {
    return { type: "FeatureCollection", features: [] };
  }

  return {
    type: "FeatureCollection",
    features: data.features
      .filter((f: any) => f && f.geometry)
      .map((f: any) => ({
        type: "Feature",
        geometry: f.geometry,
        properties: {
          country,
          name:
            f.properties?.name ||
            f.properties?.NAME ||
            f.properties?.title ||
            "Zone",
          zoneType:
            f.properties?.type ||
            f.properties?.zoneType ||
            f.properties?.ZONE_TYPE ||
            "unknown",
          source: country,
          raw: undefined
        }
      }))
  };
}
