import fs from "fs";
import { topology } from "topojson-server";
import { presimplify, simplify } from "topojson-simplify";

export function compressGeoJSON(geojson: any) {
  const topo = topology({ data: geojson });
  const pre = presimplify(topo);
  const simplified = simplify(pre, 0.00001);
  return simplified;
}
