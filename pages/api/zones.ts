// pages/api/zones.ts
import type { NextApiRequest, NextApiResponse } from "next";

// Offizielle Quellen
const SOURCES = {
  CH: "https://data.geo.admin.ch/ch.bazl.luftfahrthindernis/luftfahrthindernis.json", // Schweiz
  DE: "https://www.dfs.de/dfs-homepage/services/uas/uas-geo-data.json", // Deutschland
  AT: "https://data.austrocontrol.at/uas/zones.json", // Österreich
  IT: "https://api.d-flight.it/dzones/geojson", // Italien
  FR: "https://geoservices.ign.fr/ressources/geoportail/zonage-drones.json", // Frankreich
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
