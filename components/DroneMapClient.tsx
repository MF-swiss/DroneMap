// components/DroneMapClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function DroneMapClient() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "asking" | "granted" | "denied" | "error"
  >("idle");
  const [tracking, setTracking] = useState<boolean>(true);

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
      L.marker([47.42, 9.37]).addTo(map).bindPopup("Startpunkt (Standard)");

      // sofort Standort anfragen und ggf. watchPosition starten
      requestAndMaybeWatch(L, map, tracking);
    })();

    return () => {
      // Cleanup: stop watchPosition und remove map
      try {
        if (watchIdRef.current !== null && "geolocation" in navigator) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // nur einmal beim Mount

  // startet einmalige Anfrage und optional watchPosition
  async function requestAndMaybeWatch(L: any, map?: any, startWatch = true) {
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

      // alten Marker entfernen
      if (userMarkerRef.current) {
        try {
          map.removeLayer(userMarkerRef.current);
        } catch (e) {}
      }

      userMarkerRef.current = L.marker([lat, lng]).addTo(map).bindPopup("Dein Standort").openPopup();
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

    // einmalige Abfrage
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // optional: watchPosition für Live-Tracking
    if (startWatch) {
      try {
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            // update marker bei jeder Position
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            if (userMarkerRef.current) {
              try {
                userMarkerRef.current.setLatLng([lat, lng]);
              } catch (e) {}
            } else {
              userMarkerRef.current = L.marker([lat, lng]).addTo(map).bindPopup("Dein Standort");
            }
            try {
              map.setView([lat, lng], 15, { animate: true });
            } catch (e) {
              map.setView([lat, lng], 15);
            }
          },
          (err) => {
            console.warn("watchPosition Fehler:", err);
            if (err.code === err.PERMISSION_DENIED) setLocationStatus("denied");
            else setLocationStatus("error");
          },
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
        );
        watchIdRef.current = id;
        setTracking(true);
      } catch (e) {
        console.warn("watchPosition nicht verfügbar", e);
      }
    }
  }

  // Button togglet watchPosition
  const toggleTracking = async () => {
    if (!("geolocation" in navigator)) return;
    if (tracking) {
      // stop tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setTracking(false);
    } else {
      // start tracking again
      const mod = await import("leaflet");
      const L = mod.default ?? mod;
      requestAndMaybeWatch(L, mapInstanceRef.current, true);
      setTracking(true);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={toggleTracking}
          style={{
            padding: "8px 12px",
            background: tracking ? "#d64545" : "#0366d6",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {tracking ? "Live‑Tracking stoppen" : "Live‑Tracking starten"}
        </button>

        <span>
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
