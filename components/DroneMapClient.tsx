"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { topoLayer } from "@/utils/leafletTopo";

const ALL_COUNTRIES = ["CH","DE","AT","FR","IT","ES","NL","BE","DK","NO","SE","FI"];

// EU 2019/947 Zonentypen
export const ZONE_TYPES: Record<string, {
  label: string;
  short: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  desc: string;
  rules: string[];
  cats: string[];
}> = {
  NFZ: {
    label: "Flugverbot (No-Fly)",
    short: "NFZ",
    color: "#dc2626",
    badgeBg: "#450a0a",
    badgeText: "#fca5a5",
    desc: "Absolutes Flugverbot für alle Drohnenkategorien. Keine Ausnahmen ohne behördliche Sondergenehmigung.",
    rules: ["Alle Kategorien: verboten", "Keine BVLOS-Ausnahme", "Gilt 24/7 ohne Zeitfenster"],
    cats: ["Kernkraftwerke", "Flughäfen (Radius <5 km)", "Staatliche Sicherheitsbereiche"],
  },
  RFZ: {
    label: "Eingeschränkt (Restricted)",
    short: "RFZ",
    color: "#ea580c",
    badgeBg: "#431407",
    badgeText: "#fb923c",
    desc: "Nur bestimmte Kategorien erlaubt. Betrieb außerhalb bewohnter Gebiete nach EU-Kategorie A3 möglich.",
    rules: ["Kategorie A1/A2: verboten", "Kategorie A3: ggf. erlaubt", "Spezifisch: mit Genehmigung"],
    cats: ["Naturschutzgebiete", "Einsatzgebiete Behörden", "Militärische Übungsgebiete"],
  },
  GEO: {
    label: "Geo-Awareness Zone",
    short: "GEO",
    color: "#d97706",
    badgeBg: "#451a03",
    badgeText: "#fcd34d",
    desc: "Geo-Sensibilisierungszone nach EU 2019/945. Drohnen müssen Warnung anzeigen, Flug je nach Klasse möglich.",
    rules: ["Klasse C0: oft erlaubt", "Klasse C1–C3: Registrierung", "Fernpilot muss informiert sein"],
    cats: ["Stadtgebiete", "Infrastruktur-Korridore", "Veranstaltungszonen (temporär)"],
  },
  CTR: {
    label: "Kontrollzone (CTR)",
    short: "CTR",
    color: "#2563eb",
    badgeBg: "#0c1a4a",
    badgeText: "#93c5fd",
    desc: "Luftraum rund um kontrollierten Flugplatz. Koordination mit ATC (Flugsicherung) zwingend erforderlich.",
    rules: ["Freigabe durch ATC nötig", "Transponder empfohlen", "NOTAM vor Flug prüfen"],
    cats: ["Flughafen CTR", "Militärflugplatz", "Heliports (Radius variabel)"],
  },
  STS: {
    label: "Standard-Szenario (STS)",
    short: "STS",
    color: "#7c3aed",
    badgeBg: "#2e1065",
    badgeText: "#c4b5fd",
    desc: "Betrieb nach EU-Standard-Szenario STS-01 oder STS-02. Fernpiloten-Zertifikat (A2 CofC) erforderlich.",
    rules: ["STS-01: VLOS, unbewohnt", "STS-02: BVLOS mit Beobachter", "A2 CofC Zertifikat Pflicht"],
    cats: ["Industrie-/Agrargebiete", "Infrastrukturinspektion", "Vermessungsflüge"],
  },
  TFR: {
    label: "Temporäre Sperrung (TFR)",
    short: "TFR",
    color: "#db2777",
    badgeBg: "#4a0520",
    badgeText: "#f9a8d4",
    desc: "Zeitlich begrenzte Sperrung (NOTAM). Gilt für Veranstaltungen, Notfalllagen oder VIP-Bewegungen.",
    rules: ["Zeitfenster in NOTAM prüfen", "Gilt nur für angegebene Periode", "Militär/Polizei ggf. ausgenommen"],
    cats: ["Grossveranstaltungen", "Katastropheneinsätze", "Staatsbesuche / Gipfel"],
  },
};

export default function DroneMapClient() {
  const mapRef = useRef<any>(null);
  const layersRef = useRef<Record<string, any>>({});
  const [activeCountries, setActiveCountries] = useState<string[]>(ALL_COUNTRIES);
  const [activeTypes, setActiveTypes] = useState<string[]>(Object.keys(ZONE_TYPES));
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [zoneCounts, setZoneCounts] = useState<Record<string, number>>({});

  // Init map
  useEffect(() => {
    async function init() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (mapRef.current) return;

      const map = L.map("map", { zoomControl: true, attributionControl: false }).setView([50.5, 10.5], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);
      mapRef.current = map;
    }
    init();
  }, []);

  // Load/unload country layers
  useEffect(() => {
    async function load() {
      if (!mapRef.current) return;
      const L = await import("leaflet");

      // Load new countries
      for (const country of activeCountries) {
        if (layersRef.current[country]) continue;

        const res = await fetch(`/data/zones_compressed/${country}.topo.json`);
        if (!res.ok) continue;

        const topo = await res.json();
        let count = 0;

        const layer = await topoLayer(topo, {
          style: (feature: any) => {
            const zt = ZONE_TYPES[feature.properties.zoneType as string];
            return {
              color: zt?.color ?? "#888",
              weight: 1.5,
              fillOpacity: 0.2,
              opacity: 0.75,
            };
          },
          onEachFeature: (feature: any, layer: any) => {
            count++;
            layer.on("mouseover", function (this: any) {
              this.setStyle({ fillOpacity: 0.38, weight: 2.5 });
            });
            layer.on("mouseout", function (this: any) {
              this.setStyle({ fillOpacity: 0.2, weight: 1.5 });
            });
            layer.on("click", () => {
              setSelectedZone({ ...feature.properties, geometry: feature.geometry });
            });
          },
        });

        layer.addTo(mapRef.current);
        layersRef.current[country] = layer;
        setZoneCounts((prev) => ({ ...prev, [country]: count }));
      }

      // Remove deactivated countries
      for (const country of Object.keys(layersRef.current)) {
        if (!activeCountries.includes(country)) {
          mapRef.current.removeLayer(layersRef.current[country]);
          delete layersRef.current[country];
        }
      }
    }

    load();
  }, [activeCountries]);

  function flyToZone(geometry: any) {
    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      const bounds = L.geoJSON(geometry).getBounds();
      mapRef.current.flyTo(bounds.getCenter(), 13, { animate: true, duration: 1.4, easeLinearity: 0.25 });
    });
  }

  const totalZones = Object.values(zoneCounts)
    .filter((_, i) => activeCountries.includes(Object.keys(zoneCounts)[i]))
    .reduce((a, b) => a + b, 0);

  return (
    <div className="flex h-screen w-full relative bg-[#0a0e1a]">
      <Sidebar
        activeCountries={activeCountries}
        setActiveCountries={setActiveCountries}
        activeTypes={activeTypes}
        setActiveTypes={setActiveTypes}
        zoneCounts={zoneCounts}
      />

      <div className="flex-1 relative">
        {/* Stats bar */}
        <div className="absolute top-3 left-3 z-[500] flex gap-2">
          <div className="bg-[rgba(13,18,32,0.92)] border border-white/10 rounded-md px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
            <span className="font-mono text-white font-bold mr-1">{totalZones}</span>Zonen
          </div>
          <div className="bg-[rgba(13,18,32,0.92)] border border-white/10 rounded-md px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
            <span className="font-mono text-white font-bold mr-1">{activeCountries.length}</span>Länder
          </div>
        </div>

        <div id="map" className="w-full h-full" />

        {/* Info panel */}
        {selectedZone && (
          <ZonePanel
            zone={selectedZone}
            onClose={() => setSelectedZone(null)}
            onZoom={() => flyToZone(selectedZone.geometry)}
          />
        )}
      </div>
    </div>
  );
}

function ZonePanel({ zone, onClose, onZoom }: { zone: any; onClose: () => void; onZoom: () => void }) {
  const ti = ZONE_TYPES[zone.zoneType as string];
  if (!ti) return null;

  return (
    <div className="absolute bottom-4 right-4 w-[272px] z-[9999] bg-[#0d1220] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 py-3 border-b border-white/[0.06]">
        <div>
          <span
            className="inline-block text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded mb-1"
            style={{ background: ti.badgeBg, color: ti.badgeText }}
          >
            {ti.short}
          </span>
          <p className="text-[13px] font-semibold text-white leading-tight">{zone.name}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-0.5 w-5 h-5 rounded bg-white/[0.07] hover:bg-white/[0.12] text-white/40 hover:text-white text-xs flex items-center justify-center flex-shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <InfoRow label="Kategorie" value={ti.label} />
        <InfoRow label="Land" value={zone.country} />
        <InfoRow label="Max. Höhe" value={zone.height ?? "—"} />
        <InfoRow label="Quelle" value={zone.source ?? "—"} />
        {zone.description && (
          <p className="text-[11px] text-white/45 leading-relaxed pt-2 border-t border-white/[0.06]">
            {zone.description}
          </p>
        )}
      </div>

      {/* Rules */}
      <div className="px-4 pb-2 border-t border-white/[0.06] pt-2 space-y-1.5">
        {ti.rules.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ti.color }} />
            <span className="text-[10px] text-white/50">{r}</span>
          </div>
        ))}
      </div>

      {/* Zoom button */}
      <div className="px-4 pb-4 pt-2">
        <button
          onClick={onZoom}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
          </svg>
          Auf Zone zoomen
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-[11px] text-white/35">{label}</span>
      <span className="text-[11px] text-white/80 font-medium text-right max-w-[150px] leading-tight">{value}</span>
    </div>
  );
}