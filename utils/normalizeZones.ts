// utils/normalizeZones.ts
export type RawGeoJSON = any;

export type NormalizedFeature = {
  type: "Feature";
  geometry: any;
  properties: {
    country: string;
    name: string;
    zoneType: string;
    source: string;
    raw?: any;
  };
};

export type NormalizedCollection = {
  type: "FeatureCollection";
  features: NormalizedFeature[];
};

export function normalizeZones(
  data: RawGeoJSON,
  country: string,
  source: string
): NormalizedCollection {
  if (!data || !Array.isArray(data.features)) {
    return { type: "FeatureCollection", features: [] };
  }

  return {
    type: "FeatureCollection",
    features: data.features
      .filter((f: any) => f && f.geometry)
      .map((f: any) => {
        const p = f.properties || {};
        const name =
          p.name ||
          p.NAME ||
          p.title ||
          p.TITLE ||
          p.designator ||
          p.DESIGNATOR ||
          "Zone";

        const zoneType =
          p.zoneType ||
          p.ZONE_TYPE ||
          p.type ||
          p.TYPE ||
          p.class ||
          p.CLASS ||
          "unknown";

        return {
          type: "Feature",
          geometry: f.geometry,
          properties: {
            country,
            name,
            zoneType,
            source,
          },
        };
      }),
  };
}
