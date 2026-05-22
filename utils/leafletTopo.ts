import { feature } from "topojson-client";

export async function topoLayer(topo: any, options: any) {
  const L = await import("leaflet");
  const geojson = feature(topo, topo.objects.zones);
  return L.geoJSON(geojson, options);
}
