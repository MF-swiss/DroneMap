// utils/fetchAndCache.ts
import fs from "fs";
import path from "path";
import unzipper from "unzipper";

const CACHE_DIR = path.join(process.cwd(), "data/zones");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

export async function fetchAndCache(country: string, url: string) {
  const cacheFile = path.join(CACHE_DIR, `${country}.json`);

  // 1. Cache prüfen (24h gültig)
  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    const ageHours = (Date.now() - stats.mtimeMs) / 1000 / 3600;

    if (ageHours < 24) {
      return JSON.parse(fs.readFileSync(cacheFile, "utf8"));
    }
  }

  // 2. Quelle laden
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());

  // 3. ZIP erkennen
  if (buffer.slice(0, 2).toString() === "PK") {
    const directory = await unzipper.Open.buffer(buffer);
    const file = directory.files.find((f) => f.path.endsWith(".geojson"));

    if (!file) throw new Error("ZIP enthält kein GeoJSON");

    const content = await file.buffer();
    const json = JSON.parse(content.toString("utf8"));
    fs.writeFileSync(cacheFile, JSON.stringify(json));
    return json;
  }

  // 4. HTML erkennen
  const text = buffer.toString("utf8");
  if (text.startsWith("<")) {
    throw new Error("Quelle liefert HTML statt GeoJSON");
  }

  // 5. JSON parsen
  const json = JSON.parse(text);
  fs.writeFileSync(cacheFile, JSON.stringify(json));
  return json;
}
