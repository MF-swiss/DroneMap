import fs from "fs";
import path from "path";
import { topology } from "topojson-server";
import { presimplify, simplify } from "topojson-simplify";

const INPUT_DIR = path.join(process.cwd(), "data/zones");
const OUTPUT_DIR = path.join(process.cwd(), "data/zones_compressed");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function compressGeoJSON(country: string) {
  const file = path.join(INPUT_DIR, `${country}.json`);
  if (!fs.existsSync(file)) {
    console.log(`[${country}] Datei nicht gefunden`);
    return;
  }

  const raw = JSON.parse(fs.readFileSync(file, "utf8"));

  // GeoJSON → TopoJSON
  let topo = topology({ zones: raw });

  // Simplify
  topo = presimplify(topo);
  topo = simplify(topo, 0.00001);

  const outFile = path.join(OUTPUT_DIR, `${country}.topo.json`);
  fs.writeFileSync(outFile, JSON.stringify(topo));

  console.log(`[${country}] komprimiert gespeichert.`);
}

const COUNTRIES = ["CH", "DE", "AT", "FR", "IT"];

for (const c of COUNTRIES) compressGeoJSON(c);
