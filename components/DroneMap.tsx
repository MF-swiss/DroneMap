"use client";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function DroneMap() {
  useEffect(() => {
    const map = L.map("map").setView([47.42, 9.37], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    L.marker([47.42, 9.37]).addTo(map).bindPopup("Startpunkt");
    return () => map.remove();
  }, []);

  <Sidebar
  activeCountries={activeCountries}
  setActiveCountries={setActiveCountries}
  />

  <div ref={mapRef} className="w-full h-full" />

  return <div id="map" style={{ height: "600px", width: "100%" }} />;
}
