import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { normalizeZones } from "../utils/normalizeZones";
import { compressGeoJSON } from "./compress";
import { hashString } from "../utils/hash";

const OUT_DIR = path.join(process.cwd(), "data/zones");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const HASH_FILE = path.join(OUT_DIR, "hashes.json");
let HASHES: Record<string, string> = {};

if (fs.existsSync(HASH_FILE)) {
  HASHES = JSON.parse(fs.readFileSync(HASH_FILE, "utf8"));
}

type SourceCfg = {
  url: string;
  type: "geojson" | "zip";
  country: string;
  source: string;
};

const SOURCES: Record<string, SourceCfg> = {
  CH: { url: "...", type: "zip", country: "CH", source: "BAZL" },
  DE: { url: "...", type: "geojson", country: "DE", source: "BMVI" },
  AT: { url: "...", type: "geojson", country: "AT", source: "AustroControl" },
  FR: { url: "...", type: "geojson", country: "FR", source: "Geoportail" },
  IT: { url: "...", type: "geojson", country: "IT", source: "ENAC" },
  ES: { url: "...", type: "geojson", country: "ES", source: "ENAIRE" },
  NL: { url: "...", type: "geojson", country: "NL", source: "NL Gov" },
  BE: { url: "...", type: "geojson", country: "BE", source: "Belgocontrol" },
  DK: { url: "...", type: "geojson", country: "DK", source: "Trafikstyrelsen" },
  NO: { url: "...", type: "geojson", country: "NO", source: "Avinor" },
  SE: { url: "...", type: "geojson", country: "SE", source: "LFV" },
  FI: { url: "...", type: "geojson", country: "FI", source: "Traficom" }
};

async function fetchBuffer(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function loadRaw(cfg: SourceCfg) {
  const buf = await fetchBuffer(cfg.url);

  if (cfg.type === "zip") {
    const zip = new AdmZip(buf);
    const entry =
      zip.getEntries().find((e: any) => e.entryName.endsWith(".geojson")) ||
      zip.getEntries().find((e: any) => e.entryName.endsWith(".json"));
    if (!entry) throw new Error("Keine GeoJSON/JSON-Datei im ZIP gefunden");
    return JSON.parse(entry.getData().toString("utf8"));
  }

  return JSON.parse(buf.toString("utf8"));
}

async function updateCountry(code: string, cfg: SourceCfg) {
  console.log(`\n[${code}] Lade Daten von ${cfg.source}`);

  try {
    const raw = await loadRaw(cfg);
    const normalized = normalizeZones(raw, cfg.country, cfg.source);

    const topo = compressGeoJSON(normalized);
    const json = JSON.stringify(topo);
    const hash = hashString(json);

    if (HASHES[code] === hash) {
      console.log(`[${code}] Keine Änderungen – übersprungen`);
      return;
    }

    fs.writeFileSync(path.join(OUT_DIR, `${code}.topo.json`), json);
    HASHES[code] = hash;

    console.log(`[${code}] Aktualisiert (${normalized.features.length} Features)`);
  } catch (err: any) {
    console.error(`[${code}] FEHLER: ${err.message}`);
  }
}

(async () => {
  console.log("=== DroneMap EU Update v3 ===");

  for (const [code, cfg] of Object.entries(SOURCES)) {
    await updateCountry(code, cfg);
  }

  fs.writeFileSync(HASH_FILE, JSON.stringify(HASHES));
  console.log("Fertig.");
})();
