"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";


type DroneCategory = "A1" | "A2" | "A3" | "SPECIFIC" | "CERTIFIED";


export function DroneMapClient() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  const [locationStatus, setLocationStatus] = useState<
    "idle" | "asking" | "granted" | "denied" | "error"
  >("idle");
  const [tracking, setTracking] = useState<boolean>(true);

  const [legendOpen, setLegendOpen] = useState(true);


  useEffect(() => {
    let L: any;
    let map: any;

    (async () => {
      const mod = await import("leaflet");
      L = mod.default ?? mod;

      // Leaflet Icon Fix
      const DefaultIcon = L.Icon.Default;
      DefaultIcon.mergeOptions({
        iconUrl: "/leaflet/marker-icon.png",
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      if (!mapRef.current) return;

      // Karte erstellen
      map = L.map(mapRef.current).setView([47.42, 9.37], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // -----------------------------
      // LAYER-GRUPPEN FÜR KATEGORIEN
      // -----------------------------
      const layers: Record<DroneCategory, any> = {
        A1: L.layerGroup(),
        A2: L.layerGroup(),
        A3: L.layerGroup(),
        SPECIFIC: L.layerGroup(),
        CERTIFIED: L.layerGroup(),
      };

      L.control.layers(null, {
        "A1 – Nahe an Menschen": layers.A1,
        "A2 – Abstand nötig": layers.A2,
        "A3 – Weit weg von Menschen": layers.A3,
        "SPECIFIC – Bewilligungspflichtig": layers.SPECIFIC,
        "CERTIFIED – Hochrisiko": layers.CERTIFIED,
      }).addTo(map);


      const categoryColors: Record<DroneCategory, string> = {
        A1: "green",
        A2: "yellow",
        A3: "orange",
        SPECIFIC: "red",
        CERTIFIED: "purple",
      };

      // Kategorie bestimmen
      function getCategory(feature: any): DroneCategory {
        const type = feature?.properties?.zoneType?.toLowerCase() || "";

        if (type.includes("restricted")) return "SPECIFIC";
        if (type.includes("warning")) return "A2";
        if (type.includes("allowed")) return "A1";

        return "A3";
      }

      // GeoJSON layers are created when zones are loaded (see loadZones)
      function getLawText(cat: string) {
        switch (cat) {
          case "A1":
            return `
              <b>A1 – Nahe an Menschen</b><br/>
              • Überfliegen einzelner Personen möglich<br/>
              • Keine Menschenansammlungen<br/>
              • Max. 120 m Höhe<br/>
              • Nur C0/C1 Drohnen
            `;
          case "A2":
            return `
              <b>A2 – Abstand nötig</b><br/>
              • Mindestabstand 30 m (5 m im Langsamflug)<br/>
              • Nur C2 Drohnen<br/>
              • A2-Fernpiloten-Zusatzprüfung<br/>
              • Max. 120 m Höhe
            `;
          case "A3":
            return `
              <b>A3 – Weit weg von Menschen</b><br/>
              • Keine unbeteiligten Personen im Flugbereich<br/>
              • Nur in unbesiedelten Gebieten<br/>
              • Abstand zu Wohn-/Industriegebieten<br/>
              • Max. 120 m Höhe
            `;
          case "SPECIFIC":
            return `
              <b>SPECIFIC – Bewilligungspflichtig</b><br/>
              • Risikoanalyse (SORA) erforderlich<br/>
              • Behördliche Bewilligung nötig<br/>
              • Beispiele: BVLOS, Flüge über Menschen, kontrollierter Luftraum
            `;
          case "CERTIFIED":
            return `
              <b>CERTIFIED – Hochrisiko</b><br/>
              • Zertifizierung von Drohne & Pilot<br/>
              • Ähnlich bemannter Luftfahrt<br/>
              • Beispiele: schwere Drohnen, Menschenmengen, Gefahrgut
            `;
          default:
            return `<b>Unbekannte Kategorie</b>`;
        }
      }


      async function loadZones(country: string) {
        const res = await fetch(`/api/zones?country=${country}`);

        if (!res.ok) {
          console.warn("API Fehler für", country);
          return;
        }

        let data: any;

        try {
          data = await res.json();
        } catch (e) {
          console.warn("Antwort ist kein JSON für", country);
          return;
        }

        console.log("GeoJSON für", country, data);

        if (!data || data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
          console.warn("Ungültiges GeoJSON für", country, data);
          return;
        }

        // -----------------------------
        // BUFFERING (Linien → Flächen)
        // -----------------------------
        const BUFFER_METERS = 200;

        const bufferedFeatures = data.features.map((f: any) => {
          const type = f.geometry?.type;

          // Linien buffern
          if (type === "LineString" || type === "MultiLineString") {
            try {
              return turf.buffer(f, BUFFER_METERS, { units: "meters" });
            } catch (e) {
              console.warn("Buffering fehlgeschlagen:", f);
              return f;
            }
          }

          // Punkte buffern → kleine Kreise
          if (type === "Point") {
            try {
              return turf.buffer(f, BUFFER_METERS / 2, { units: "meters" });
            } catch (e) {
              return f;
            }
          }

          // Polygone unverändert lassen
          return f;
        });

        const bufferedGeoJSON = {
          type: "FeatureCollection",
          features: bufferedFeatures
        };

        // -----------------------------
        // LEAFLET RENDERING
        // -----------------------------
        const geoLayer = L.geoJSON(bufferedGeoJSON, {
          style: (feature: any) => {
            const cat = getCategory(feature);
            const type = feature.geometry.type;

            // Linien (falls ungebuffert)
            if (type === "LineString" || type === "MultiLineString") {
              return {
                color: categoryColors[cat],
                weight: 3,
                opacity: 0.9
              };
            }

            // Punkte (falls ungebuffert)
            if (type === "Point" || type === "MultiPoint") {
              return {
                color: categoryColors[cat],
                fillColor: categoryColors[cat],
                fillOpacity: 0.9,
                radius: 6
              };
            }

            // Buffer‑Flächen farbig schattieren
            return {
              color: categoryColors[cat],
              weight: 2,
              fillColor: categoryColors[cat],
              fillOpacity: 0.35
            };
          },

          pointToLayer: (feature: any, latlng: any) => {
            const cat = getCategory(feature);
            return L.circleMarker(latlng, {
              radius: 6,
              color: categoryColors[cat],
              fillColor: categoryColors[cat],
              fillOpacity: 0.9
            });
          },

          onEachFeature: (feature: any, layer: any) => {
            const cat = getCategory(feature);
            const lawText = getLawText(cat);

            layer.bindPopup(`
              <b>${feature.properties.name}</b><br/>
              Land: ${feature.properties.country}<br/><br/>
              ${lawText}
            `);

            layers[cat].addLayer(layer);
          }
        });

        geoLayer.addTo(map);
      }


      




      // LayerControl hinzufügen
      L.control
        .layers(null, {
          "A1 – Nahe an Menschen": layers.A1,
          "A2 – Abstand nötig": layers.A2,
          "A3 – Weit weg von Menschen": layers.A3,
          "SPECIFIC – Bewilligungspflichtig": layers.SPECIFIC,
          "CERTIFIED – Hochrisiko": layers.CERTIFIED,
        })
        .addTo(map);

      // Standardmäßig aktivieren
      layers.A1.addTo(map);
      layers.A2.addTo(map);
      layers.A3.addTo(map);
      layers.SPECIFIC.addTo(map);
      layers.CERTIFIED.addTo(map);

      // Länder laden
      /*
      await loadZones("CH");
      await loadZones("DE");
      await loadZones("AT");
      await loadZones("IT");
      await loadZones("FR");
      */
      loadZones("CH"); // oder das Land, das du sehen willst



      // -----------------------------
      // LIVE-STANDORT
      // -----------------------------
      async function requestAndMaybeWatch(startWatch = true) {
        setLocationStatus("asking");

        if (!("geolocation" in navigator)) {
          setLocationStatus("error");
          return;
        }

        const success = (pos: GeolocationPosition) => {
          setLocationStatus("granted");

          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([lat, lng]);
          } else {
            userMarkerRef.current = L.marker([lat, lng])
              .addTo(map)
              .bindPopup("Dein Standort")
              .openPopup();
          }

          map.setView([lat, lng], 15);
        };

        const error = (err: GeolocationPositionError) => {
          if (err.code === err.PERMISSION_DENIED) setLocationStatus("denied");
          else setLocationStatus("error");
        };

        navigator.geolocation.getCurrentPosition(success, error, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });

        if (startWatch) {
          const id = navigator.geolocation.watchPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;

              if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng([lat, lng]);
              } else {
                userMarkerRef.current = L.marker([lat, lng]).addTo(map);
              }

              map.setView([lat, lng], 15);
            },
            error,
            { enableHighAccuracy: true }
          );

          watchIdRef.current = id;
        }
      }

      // Standort sofort anfragen
      requestAndMaybeWatch(true);
    })();

    return () => {
      try {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }
      } catch (e) {}
    };
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <span>
          {locationStatus === "idle" && "Standort: nicht angefragt"}
          {locationStatus === "asking" && "Standort: Anfrage läuft…"}
          {locationStatus === "granted" && "Standort: gefunden"}
          {locationStatus === "denied" && "Standort: verweigert"}
          {locationStatus === "error" && "Standort: Fehler"}
        </span>
      </div>

      <div ref={mapRef} style={{ height: "600px", width: "100%" }} />
      {/* Ein-/Ausklappbare Legende */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setLegendOpen((prev) => !prev)}
          style={{
            padding: "8px 12px",
            background: "#0366d6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          {legendOpen ? "Legende ausblenden" : "Legende einblenden"}
        </button>

        {/* Legenden-Box */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            fontSize: "14px",
            lineHeight: "20px",
            width: "200px",
            maxHeight: legendOpen ? "300px" : "0px",
            overflow: "hidden",
            transition: "max-height 0.3s ease",
          }}
        >
          <b>Legende</b>
          <div><span style={{ color: "green", fontWeight: "bold" }}>■</span> A1 – Nahe an Menschen</div>
          <div><span style={{ color: "yellow", fontWeight: "bold" }}>■</span> A2 – Abstand nötig</div>
          <div><span style={{ color: "orange", fontWeight: "bold" }}>■</span> A3 – Weit weg von Menschen</div>
          <div><span style={{ color: "red", fontWeight: "bold" }}>■</span> SPECIFIC – Bewilligungspflichtig</div>
          <div><span style={{ color: "purple", fontWeight: "bold" }}>■</span> CERTIFIED – Hochrisiko</div>
        </div>
      </div>


    </div>

    

  );
}
