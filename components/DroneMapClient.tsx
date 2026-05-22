"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Sidebar from "./Sidebar";

export default function DroneMapClient() {
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Record<string, L.LayerGroup>>({});
  const [activeCountries, setActiveCountries] = useState<string[]>([]);

  // Karte initialisieren
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map").setView([47.42, 9.37], 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    mapRef.current = map;
  }, []);

  // Länder toggeln → Layer laden/entfernen
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    activeCountries.forEach(async (country) => {
      if (layersRef.current[country]) return;

      const res = await fetch(`/api/zones?country=${country}`);
      const data = await res.json();

      const layer = L.geoJSON(data, {
        style: {
          color: "#ff6600",
          weight: 2,
          fillOpacity: 0.3,
        },
      });

      layer.addTo(map);
      layersRef.current[country] = layer;
    });

    Object.keys(layersRef.current).forEach((country) => {
      if (!activeCountries.includes(country)) {
        mapRef.current!.removeLayer(layersRef.current[country]);
        delete layersRef.current[country];
      }
    });
  }, [activeCountries]);

  return (
    <div className="flex h-full w-full">
      <Sidebar
        activeCountries={activeCountries}
        setActiveCountries={setActiveCountries}
      />

      <div id="map" className="flex-1 h-screen" />
    </div>
  );
}
