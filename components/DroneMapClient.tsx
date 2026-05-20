// components/DroneMapClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function DroneMapClient() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [locationStatus, setLocationStatus] = useState<string>("idle"); // idle | asking | granted | denied | error

  useEffect(() => {
    let L: any;
    let map: any;

    (async () => {
      const mod = await import("leaflet");
      L = mod.default ?? mod;

      // Icon-Pfade setzen
      const DefaultIcon = L.Icon.Default;
      DefaultIcon.mergeOptions({
        iconUrl: "/leaflet/marker-icon.png",
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      if (!mapRef.current) return;

      // Initiale View (Fallback)
      map = L.map(mapRef.current).setView([47.42, 9.37], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // optional: Startmarker an Default-Position
      const startMarker = L.marker([47.42, 9.37]).addTo(map).bindPopup("Startpunkt (Standard)");
      // store if needed
      // Versuche jetzt, aktuellen Standort zu holen
      requestAndSetCurrentLocation(L, map);
    })();

    // Cleanup
    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (e) {}
    };
  }, []);

  // Funktion: Standort anfragen und auf Map setzen
  async function requestAndSetCurrentLocation(L: any, map?: any) {
    setLocationStatus("asking");
    if (!map) map = mapInstanceRef.current;
    if (!("geolocation" in navigator)) {
      setLocationStatus("error");
      console.warn("Geolocation API nicht verfügbar");
      return;
    }

    const success = (pos: GeolocationPosition) => {
      setLocationStatus("granted");
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // entferne alten Marker
      if (userMarkerRef.current) {
        try { map.removeLayer(userMarkerRef.current); } catch (e) {}
      }

      // neuen Marker setzen
      userMarkerRef.current = L.marker([lat, lng]).addTo(map).bindPopup("Dein Standort").openPopup();

      // Karte zentrieren (sanfte Animation)
      try {
        map.setView([lat, lng], 15, { animate: true });
      } catch (e) {
        map.setView([lat, lng], 15);
      }
    };

    const error = (err: GeolocationPositionError) => {
      console.warn("Geolocation Fehler:", err);
      if (err.code === err.PERMISSION_DENIED) {
        setLocationStatus("denied");
      } else {
        setLocationStatus("error");
      }
    };

    // einmalige Abfrage (alternativ: watchPosition)
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }

  // UI: Button klickt die Anfrage erneut an (falls zuvor abgelehnt, Browser zeigt ggf. nichts mehr)
  const handleLocateClick = async () => {
    // Wenn map noch nicht geladen, warte kurz
    if (!mapInstanceRef.current) {
      setTimeout(handleLocateClick, 300);
      return;
    }
    // dynamisch import L nur falls nötig
    const mod = await import("leaflet");
    const L = mod.default ?? mod;
    requestAndSetCurrentLocation(L, mapInstanceRef.current);
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={handleLocateClick}
          style={{
            padding: "8px 12px",
            background: "#0366d6",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Zu meinem Standort
        </button>
        <span style={{ marginLeft: 12 }}>
          {locationStatus === "idle" && "Standort: nicht angefragt"}
          {locationStatus === "asking" && "Standort: Anfrage läuft…"}
          {locationStatus === "granted" && "Standort: gefunden"}
          {locationStatus === "denied" && "Standort: Zugriff verweigert"}
          {locationStatus === "error" && "Standort: Fehler"}
        </span>
      </div>

      <div ref={mapRef} style={{ height: "600px", width: "100%" }} />
    </div>
  );
}
