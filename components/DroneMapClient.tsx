"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { topoLayer } from "@/utils/leafletTopo";
import { getZoneColor } from "@/utils/colors";

import {
  XMarkIcon,
  ArrowUpRightIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";

const ALL_COUNTRIES = ["CH","DE","AT","FR","IT","ES","NL","BE","DK","NO","SE","FI"];

export default function DroneMapClient() {
  const mapRef = useRef<any>(null);
  const layersRef = useRef<Record<string, any>>({});
  const [activeCountries, setActiveCountries] = useState<string[]>([]);
  const [selectedZone, setSelectedZone] = useState<any>(null);

  // Auto-load all countries
  useEffect(() => {
    if (activeCountries.length === 0) {
      setActiveCountries(ALL_COUNTRIES);
    }
  }, []);

  // Init map
  useEffect(() => {
    async function init() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current) {
        const map = L.map("map").setView([47.42, 9.37], 6);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
        }).addTo(map);

        mapRef.current = map;
      }
    }

    init();
  }, []);

  // Load/unload countries
  useEffect(() => {
    async function load() {
      if (!mapRef.current) return;

      const L = await import("leaflet");

      activeCountries.forEach(async (country) => {
        if (layersRef.current[country]) return;

        const res = await fetch(`/data/zones_compressed/${country}.topo.json`);
        if (!res.ok) return;

        const topo = await res.json();

        const layer = await topoLayer(topo, {
          style: (feature: any) => ({
            color: getZoneColor(feature.properties.zoneType),
            weight: 1,
            fillOpacity: 0.25,
          }),
          onEachFeature: (feature: any, layer: any) => {
            layer.on("click", () => {
              const el = layer.getElement();
              if (el) {
                el.classList.add("leaflet-highlight");
                setTimeout(() => el.classList.remove("leaflet-highlight"), 800);
              }

              setSelectedZone({
                ...feature.properties,
                geometry: feature.geometry,
              });
            });
          },
        });

        layer.addTo(mapRef.current);
        layersRef.current[country] = layer;
      });

      Object.keys(layersRef.current).forEach((country) => {
        if (!activeCountries.includes(country)) {
          mapRef.current.removeLayer(layersRef.current[country]);
          delete layersRef.current[country];
        }
      });
    }

    load();
  }, [activeCountries]);

  function flyToZone(feature: any) {
    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      const bounds = L.geoJSON(feature).getBounds();
      const center = bounds.getCenter();

      mapRef.current.flyTo(center, 13, {
        animate: true,
        duration: 1.4,
        easeLinearity: 0.25,
      });
    });
  }

  return (
    <div className="flex h-screen w-full relative">

      <Sidebar
        activeCountries={activeCountries}
        setActiveCountries={setActiveCountries}
      />

      <div id="map" className="flex-1 h-full" />

      {selectedZone && (
        <div className="absolute bottom-4 right-4 bg-white text-black shadow-2xl p-5 rounded-xl w-80 z-[9999] border border-gray-200">

          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-xl">{selectedZone.name}</h3>
            <XMarkIcon
              className="w-6 h-6 cursor-pointer text-gray-500 hover:text-black"
              onClick={() => setSelectedZone(null)}
            />
          </div>

          <div className="space-y-2 text-sm">
            <p><strong>Typ:</strong> {selectedZone.type}</p>
            <p><strong>Land:</strong> {selectedZone.country}</p>
            <p><strong>Quelle:</strong> {selectedZone.source}</p>

            {selectedZone.height && (
              <p><strong>Höhenlimit:</strong> {selectedZone.height} m</p>
            )}

            {selectedZone.rules && (
              <p><strong>Flugregeln:</strong> {selectedZone.rules}</p>
            )}

            {selectedZone.description && (
              <p><strong>Info:</strong> {selectedZone.description}</p>
            )}

            {selectedZone.link && (
              <a
                href={selectedZone.link}
                target="_blank"
                className="text-blue-600 underline flex items-center gap-1"
              >
                Offizielle Quelle <ArrowUpRightIcon className="w-4 h-4" />
              </a>
            )}
          </div>

          <button
            onClick={() => flyToZone(selectedZone)}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            <MapPinIcon className="w-5 h-5" />
            Auf Zone zoomen
          </button>
        </div>
      )}
    </div>
  );
}
