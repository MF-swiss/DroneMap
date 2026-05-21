import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import unzipper from "unzipper";

const SOURCES: Record<string, string> = {
  CH: "https://data.geo.admin.ch/ch.bazl.sicherheitszonen-karte/sicherheitszonen.geojson",
  DE: "https://www.bmdv.bund.de/SharedDocs/Downloads/DE/Drohnen/uas-zonen.geojson",
  AT: "https://data.austrocontrol.at/uas/zones.geojson",
  FR: "https://www.geoportail.gouv.fr/carte/ressources/drones/zonage-drones.geojson",
  IT: "https://raw.githubusercontent.com/drone-map-data/italy-dzones/main/dzones.geojson"
};

const CACHE_DIR = path.join(process.cwd(), "data/zones");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

async function fetchAndCache(country: string, url: string) {
  const cacheFile = path.join(CACHE_DIR, `${country}.json`);

  // Cache 24h gültig
  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    const ageHours = (Date.now() - stats.mtimeMs) / 1000 / 3600;

    if (ageHours < 24) {
      return JSON.parse(fs.readFileSync(cacheFile, "utf8"));
    }
  }

  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());

  // ZIP erkennen
  if (buffer.slice(0, 2).toString() === "PK") {
    const directory = await unzipper.Open.buffer(buffer);
    const file = directory.files.find((f) => f.path.endsWith(".geojson"));
    if (!file) throw new Error("ZIP enthält kein GeoJSON");

    const content = await file.buffer();
    const json = JSON.parse(content.toString("utf8"));
    fs.writeFileSync(cacheFile, JSON.stringify(json));
    return json;
  }

  const text = buffer.toString("utf8");

  // HTML erkennen
  if (text.startsWith("<")) {
    throw new Error("Quelle liefert HTML statt GeoJSON");
  }

  const json = JSON.parse(text);
  fs.writeFileSync(cacheFile, JSON.stringify(json));
  return json;
}

function normalize(data: any, country: string) {
  if (!data || !data.features) return { type: "FeatureCollection", features: [] };

  return {
    type: "FeatureCollection",
    features: data.features.map((f: any) => ({
      type: "Feature",
      geometry: f.geometry,
      properties: {
        country,
        name: f.properties?.name ?? "Zone",
        zoneType: f.properties?.type ?? "unknown",
        rules: f.properties?.rules ?? {},
      },
    })),
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country")?.toUpperCase();

  if (!country || !SOURCES[country]) {
    return NextResponse.json({ error: "Unknown country" }, { status: 400 });
  }

  try {
    const raw = await fetchAndCache(country, SOURCES[country]);
    const normalized = normalize(raw, country);
    return NextResponse.json(normalized);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
