import L from "leaflet";
import { feature } from "topojson-client";

export function topoLayer(topo: any, options = {}) {
  const geojson = feature(topo, topo.objects.zones);
  return L.geoJSON(geojson, options);
}
