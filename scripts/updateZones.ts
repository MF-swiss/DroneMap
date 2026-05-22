// scripts/updateZones.ts
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

import { normalizeZones } from "../utils/normalizeZones";

const res = await fetch(url);
const OUT_DIR = path.join(process.cwd(), "data/zones");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SOURCES: Record<
  string,
  { url: string; type: "geojson" | "zip" | "wms" }
> = {
  CH: {
    url: "https://data.geo.admin.ch/ch.bazl.sicherheitszonen-karte/sicherheitszonen.zip",
    type: "zip"
  },
  DE: {
    url: "https://www.bmdv.bund.de/SharedDocs/Downloads/DE/Drohnen/uas-zonen.geojson",
    type: "geojson"
  },
  AT: {
    url: "https://data.austrocontrol.at/uas/zones.geojson",
    type: "geojson"
  },
  FR: {
    url: "https://www.geoportail.gouv.fr/carte/ressources/drones/zonage-drones.geojson",
    type: "geojson"
  },
  IT: {
    url: "https://raw.githubusercontent.com/drone-map-data/italy-dzones/main/dzones.geojson",
    type: "geojson"
  },
  ES: {
    url: "https://ais.enaire.es/geojson/drones.geojson",
    type: "geojson"
  },
  NL: {
    url: "https://geodata.nationaalgeoregister.nl/drones/geojson",
    type: "geojson"
  },
  BE: {
    url: "https://geoservices.belgocontrol.be/drones/geojson",
    type: "geojson"
  },
  DK: {
    url: "https://api.dronerules.dk/zones.geojson",
    type: "geojson"
  },
  NO: {
    url: "https://avinor.no/drones/zones.geojson",
    type: "geojson"
  },
  SE: {
    url: "https://lfv.se/drones/zones.geojson",
    type: "geojson"
  },
  FI: {
    url: "https://traficom.fi/drones/zones.geojson",
    type: "geojson"
  }
};

async function fetchBuffer(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function handleZip(buf: Buffer): Promise<any> {
  const zip = new AdmZip(buf);

  const entry =
    zip.getEntries().find((e: any) => e.entryName.endsWith(".geojson")) ||
    zip.getEntries().find((e: any) => e.entryName.endsWith(".json"));

  if (!entry) throw new Error("ZIP enthält kein GeoJSON/JSON");

  const content = entry.getData().toString("utf8");
  return JSON.parse(content);
}


// Platzhalter – falls du später echte WMS→GeoJSON Konvertierung einbaust
async function handleWms(_url: string): Promise<any> {
  throw new Error("WMS-Konvertierung noch nicht implementiert");
}

async function updateCountry(code: string, cfg: { url: string; type: string }) {
  const outFile = path.join(OUT_DIR, `${code}.json`);
  console.log(`\n[${code}] Lade: ${cfg.url}`);

  try {
    let raw: any;

    if (cfg.type === "zip") {
      const buf = await fetchBuffer(cfg.url);
      raw = await handleZip(buf);
    } else if (cfg.type === "geojson") {
      const buf = await fetchBuffer(cfg.url);
      const text = buf.toString("utf8");

      if (text.startsWith("<")) {
        throw new Error("Quelle liefert HTML statt GeoJSON");
      }

      raw = JSON.parse(text);
    }


(async () => {
  console.log("=== DroneMap EU Zonen Update ===");
  for (const [code, cfg] of Object.entries(SOURCES)) {
    await updateCountry(code, cfg);
  }
  console.log("\nFertig. Daten liegen in data/zones/*.json");
})();
