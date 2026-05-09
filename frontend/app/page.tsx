"use client";

import { useEffect, useRef } from "react";

export default function Home() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      const loader = new google.maps.plugins.loader.Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
      });

      const { Map, Data } = await loader.importLibrary("maps");

      const map = new Map(mapRef.current!, {
        center: { lat: 47.3769, lng: 8.5417 },
        zoom: 13,
        mapTypeId: "hybrid",
      });

      // Live Standort
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const userPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          new google.maps.Marker({
            position: userPos,
            map,
            title: "Dein Standort",
          });

          map.setCenter(userPos);
        });
      }

      // === GEOJSON ZONEN LADEN ===
      map.data.loadGeoJson("/data/test-zones.geojson");

      // === STYLE FÜR ZONEN ===
      map.data.setStyle((feature) => {
        const category = feature.getProperty("category");

        return {
          fillColor: category === "no_fly_zone" ? "#ff0000" : "#00ff00",
          fillOpacity: 0.35,
          strokeColor: "#ff0000",
          strokeWeight: 2,
        };
      });

      // === CLICK HANDLER ===
      map.data.addListener("click", (event) => {
        const name = event.feature.getProperty("name");
        alert(`Zone: ${name}`);
      });
    };

    initMap();
  }, []);

  return (
    <div className="w-screen h-screen">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
