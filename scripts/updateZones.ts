import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { normalizeZones } from "../utils/normalizeZones";

const OUT_DIR = path.join(process.cwd(), "data/zones");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

type SourceCfg = {
  url: string;
  type: "geojson" | "zip";
  country: string;
  source: string;
};

const SOURCES: Record<string, SourceCfg> = {
  CH: {
    url: "https://data.geo.admin.ch/ch.bazl.sicherheitszonen-karte/sicherheitszonen.zip",
    type: "zip",
    country: "CH",
    source: "BAZL",
  },
  DE: {
    url: "https://www.bmdv.bund.de/SharedDocs/Downloads/DE/Drohnen/uas-zonen.geojson",
    type: "geojson",
    country: "DE",
    source: "BMVI",
  },
  AT: {
    url: "https://data.austrocontrol.at/uas/zones.geojson",
    type: "geojson",
    country: "AT",
    source: "AustroControl",
  },
  FR: {
    url: "https://www.geoportail.gouv.fr/carte/ressources/drones/zonage-drones.geojson",
    type: "geojson",
    country: "FR",
    source: "Geoportail",
  },
  IT: {
    url: "https://raw.githubusercontent.com/drone-map-data/italy-dzones/main/dzones.geojson",
    type: "geojson",
    country: "IT",
    source: "ENAC",
  }
};

async function fetchBufferWithRetry(url: string, retries = 3): Promise<Buffer> {
  let lastErr: any;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
      console.warn(`[fetch] Versuch ${i + 1} fehlgeschlagen:`, (err as any).message);
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }

  throw lastErr;
}

async function handleZip(buf: Buffer): Promise<any> {
  const zip = new AdmZip(buf);

  const entry =
    zip.getEntries().find((e: any) => e.entryName.endsWith(".geojson")) ||
    zip.getEntries().find((e: any) => e.entryName.endsWith(".json"));

  if (!entry) throw new Error("ZIP enthält kein GeoJSON/JSON");

  return JSON.parse(entry.getData().toString("utf8"));
}

async function loadRaw(cfg: SourceCfg): Promise<any> {
  const buf = await fetchBufferWithRetry(cfg.url);

  if (cfg.type === "zip") {
    return handleZip(buf);
  }

  const text = buf.toString("utf8");
  if (text.startsWith("<")) throw new Error("Quelle liefert HTML statt GeoJSON");

  return JSON.parse(text);
}

async function updateCountry(code: string, cfg: SourceCfg) {
  const outFile = path.join(OUT_DIR, `${code}.json`);
  const logPrefix = `[${code}]`;

  console.log(`${logPrefix} Lade von ${cfg.source}: ${cfg.url}`);

  try {
    const raw = await loadRaw(cfg);
    const normalized = normalizeZones(raw, cfg.country, cfg.source);

    fs.writeFileSync(outFile, JSON.stringify(normalized));
    console.log(`${logPrefix} OK – ${normalized.features.length} Features gespeichert.`);
  } catch (err: any) {
    console.error(`${logPrefix} FEHLER: ${err.message}`);

    fs.writeFileSync(
      outFile,
      JSON.stringify({ type: "FeatureCollection", features: [] })
    );

    console.log(`${logPrefix} Fallback: leere FeatureCollection geschrieben.`);
  }
}

(async () => {
  console.log("=== DroneMap EU Zonen Update v2 ===");

  for (const [code, cfg] of Object.entries(SOURCES)) {
    await updateCountry(code, cfg);
  }

  console.log("Fertig. Daten liegen in data/zones/*.json");
})();
