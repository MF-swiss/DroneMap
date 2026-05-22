// utils/leafletTopo.ts
import L from "leaflet";
import { feature } from "topojson-client";

export function topoLayer(topo: any, options: L.GeoJSONOptions = {}) {
  const geojson = feature(topo, topo.objects.zones);
  return L.geoJSON(geojson, options);
}
