// pages/api/zones.ts
import type { NextApiRequest, NextApiResponse } from "next";

// Offizielle Quellen
const SOURCES: Record<string, string> = {
  CH: "https://data.geo.admin.ch/ch.bazl.sicherheitszonen-karte/sicherheitszonen.geojson",
  DE: "https://www.bmdv.bund.de/SharedDocs/Downloads/DE/Drohnen/uas-zonen.geojson",
  AT: "https://data.austrocontrol.at/uas/zones.geojson",
  FR: "https://www.geoportail.gouv.fr/carte/ressources/drones/zonage-drones.geojson",
  IT: "https://raw.githubusercontent.com/drone-map-data/italy-dzones/main/dzones.geojson"
};



// Normalisierung in ein einheitliches GeoJSON-Format
function normalize(data: any, country: string) {
  if (!data || !data.features) return { type: "FeatureCollection", features: [] };

  return {
    type: "FeatureCollection",
    features: data.features.map((f: any) => ({
      type: "Feature",
      geometry: f.geometry,
      properties: {
        source: country,
        country,
        zoneType: f.properties?.type ?? "unknown",
        name: f.properties?.name ?? "Zone",
        rules: f.properties?.rules ?? {},
      },
    })),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const country = (req.query.country as string)?.toUpperCase();

  if (!country || !SOURCES[country]) {
    return res.status(400).json({ error: "Unknown or missing country" });
  }

  try {
    const response = await fetch(SOURCES[country]);
    const data = await response.json();

    const normalized = normalize(data, country);
    res.status(200).json(normalized);
  } catch (e) {
    res.status(500).json({ error: "Failed to load zones" });
  }
}
