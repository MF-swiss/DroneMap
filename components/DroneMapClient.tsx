"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { topoLayer } from "@/utils/leafletTopo";

const ALL_COUNTRIES = ["CH","DE","AT","FR","IT","ES","NL","BE","DK","NO","SE","FI"];

export const ZONE_TYPES: Record<string, {
  label: string; short: string; color: string;
  badgeBg: string; badgeText: string; desc: string;
  rules: string[]; cats: string[];
}> = {
  NFZ: {
    label: "Flugverbot (No-Fly)", short: "NFZ", color: "#dc2626",
    badgeBg: "#450a0a", badgeText: "#fca5a5",
    desc: "Absolutes Flugverbot für alle Drohnenkategorien. Keine Ausnahmen ohne behördliche Sondergenehmigung.",
    rules: ["Alle Kategorien: verboten", "Keine BVLOS-Ausnahme", "Gilt 24/7 ohne Zeitfenster"],
    cats: ["Kernkraftwerke", "Flughäfen (Radius <5 km)", "Staatliche Sicherheitsbereiche"],
  },
  RFZ: {
    label: "Eingeschränkt (Restricted)", short: "RFZ", color: "#ea580c",
    badgeBg: "#431407", badgeText: "#fb923c",
    desc: "Nur bestimmte Kategorien erlaubt. Betrieb außerhalb bewohnter Gebiete nach EU-Kategorie A3 möglich.",
    rules: ["Kategorie A1/A2: verboten", "Kategorie A3: ggf. erlaubt", "Spezifisch: mit Genehmigung"],
    cats: ["Naturschutzgebiete", "Einsatzgebiete Behörden", "Militärische Übungsgebiete"],
  },
  GEO: {
    label: "Geo-Awareness Zone", short: "GEO", color: "#d97706",
    badgeBg: "#451a03", badgeText: "#fcd34d",
    desc: "Geo-Sensibilisierungszone nach EU 2019/945. Drohnen müssen Warnung anzeigen, Flug je nach Klasse möglich.",
    rules: ["Klasse C0: oft erlaubt", "Klasse C1–C3: Registrierung", "Fernpilot muss informiert sein"],
    cats: ["Stadtgebiete", "Infrastruktur-Korridore", "Veranstaltungszonen (temporär)"],
  },
  CTR: {
    label: "Kontrollzone (CTR)", short: "CTR", color: "#2563eb",
    badgeBg: "#0c1a4a", badgeText: "#93c5fd",
    desc: "Luftraum rund um kontrollierten Flugplatz. Koordination mit ATC (Flugsicherung) zwingend erforderlich.",
    rules: ["Freigabe durch ATC nötig", "Transponder empfohlen", "NOTAM vor Flug prüfen"],
    cats: ["Flughafen CTR", "Militärflugplatz", "Heliports (Radius variabel)"],
  },
  STS: {
    label: "Standard-Szenario (STS)", short: "STS", color: "#7c3aed",
    badgeBg: "#2e1065", badgeText: "#c4b5fd",
    desc: "Betrieb nach EU-Standard-Szenario STS-01 oder STS-02. Fernpiloten-Zertifikat (A2 CofC) erforderlich.",
    rules: ["STS-01: VLOS, unbewohnt", "STS-02: BVLOS mit Beobachter", "A2 CofC Zertifikat Pflicht"],
    cats: ["Industrie-/Agrargebiete", "Infrastrukturinspektion", "Vermessungsflüge"],
  },
  TFR: {
    label: "Temporäre Sperrung (TFR)", short: "TFR", color: "#db2777",
    badgeBg: "#4a0520", badgeText: "#f9a8d4",
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

  // Init Leaflet map
  useEffect(() => {
    async function init() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (mapRef.current) return;

      const map = L.map("drone-map", {
        zoomControl: true,
        attributionControl: false,
      }).setView([50.5, 10.5], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
    }
    init();
  }, []);

  // Load / unload country layers
  useEffect(() => {
    async function load() {
      if (!mapRef.current) return;

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
              color: zt?.color ?? "#6b7280",
              weight: 1.5,
              fillOpacity: 0.2,
              opacity: 0.75,
            };
          },
          onEachFeature: (feature: any, lyr: any) => {
            count++;
            lyr.on("mouseover", function (this: any) {
              this.setStyle({ fillOpacity: 0.38, weight: 2.5 });
            });
            lyr.on("mouseout", function (this: any) {
              this.setStyle({ fillOpacity: 0.2, weight: 1.5 });
            });
            lyr.on("click", () => {
              setSelectedZone({ ...feature.properties, geometry: feature.geometry });
            });
          },
        });

        layer.addTo(mapRef.current);
        layersRef.current[country] = layer;
        setZoneCounts((prev) => ({ ...prev, [country]: count }));
      }

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
      mapRef.current.flyTo(bounds.getCenter(), 13, {
        animate: true,
        duration: 1.4,
        easeLinearity: 0.25,
      });
    });
  }

  const totalZones = activeCountries.reduce((sum, c) => sum + (zoneCounts[c] ?? 0), 0);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: "#0a0e1a", position: "relative" }}>
      <Sidebar
        activeCountries={activeCountries}
        setActiveCountries={setActiveCountries}
        activeTypes={activeTypes}
        setActiveTypes={setActiveTypes}
        zoneCounts={zoneCounts}
      />

      <div style={{ flex: 1, position: "relative" }}>
        {/* Stats bar */}
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 500, display: "flex", gap: 8 }}>
          <StatChip value={totalZones} label="Zonen" />
          <StatChip value={activeCountries.length} label="Länder" />
        </div>

        <div id="drone-map" style={{ width: "100%", height: "100%" }} />

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

function StatChip({ value, label }: { value: number; label: string }) {
  return (
    <div style={{
      background: "rgba(13,18,32,0.92)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 6,
      padding: "4px 10px",
      fontSize: 11,
      color: "rgba(255,255,255,0.65)",
    }}>
      <strong style={{ color: "#fff", fontFamily: "monospace", marginRight: 4 }}>{value}</strong>
      {label}
    </div>
  );
}

function ZonePanel({ zone, onClose, onZoom }: { zone: any; onClose: () => void; onZoom: () => void }) {
  const ti = ZONE_TYPES[zone.zoneType as string];
  if (!ti) return null;

  return (
    <div style={{
      position: "absolute", bottom: 16, right: 16, width: 272, zIndex: 9999,
      background: "#0d1220", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
    }}>
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 8, padding: "12px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div>
          <span style={{
            display: "inline-block", fontSize: 9, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "2px 7px", borderRadius: 3,
            background: ti.badgeBg, color: ti.badgeText, marginBottom: 5,
          }}>
            {ti.short}
          </span>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.25 }}>
            {zone.name}
          </p>
        </div>
        <button onClick={onClose} style={{
          width: 20, height: 20, borderRadius: 4, border: "none",
          background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)",
          cursor: "pointer", fontSize: 13, flexShrink: 0,
        }}>✕</button>
      </div>

      <div style={{ padding: "11px 14px 4px" }}>
        <InfoRow label="Kategorie" value={ti.label} />
        <InfoRow label="Land" value={zone.country} />
        <InfoRow label="Max. Höhe" value={zone.height ?? "—"} />
        <InfoRow label="Quelle" value={zone.source ?? "—"} />
        {zone.description && (
          <p style={{
            fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.55,
            marginTop: 6, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            {zone.description}
          </p>
        )}
      </div>

      <div style={{ padding: "8px 14px 4px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {ti.rules.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: ti.color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{r}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "8px 14px 12px" }}>
        <button onClick={onZoom} style={{
          width: "100%", background: "#2563eb", color: "#fff",
          border: "none", borderRadius: 6, padding: "8px 0",
          fontSize: 12, fontWeight: 500, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
        }}>
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
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{label}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 500, textAlign: "right", maxWidth: 150, lineHeight: 1.3 }}>
        {value}
      </span>
    </div>
  );
}