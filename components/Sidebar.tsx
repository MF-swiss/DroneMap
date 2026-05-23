"use client";

import { ZONE_TYPES } from "./DroneMapClient";

const ALL_COUNTRIES = [
  { code: "CH", name: "Schweiz",     flag: "🇨🇭" },
  { code: "DE", name: "Deutschland", flag: "🇩🇪" },
  { code: "AT", name: "Österreich",  flag: "🇦🇹" },
  { code: "FR", name: "Frankreich",  flag: "🇫🇷" },
  { code: "IT", name: "Italien",     flag: "🇮🇹" },
  { code: "ES", name: "Spanien",     flag: "🇪🇸" },
  { code: "NL", name: "Niederlande", flag: "🇳🇱" },
  { code: "BE", name: "Belgien",     flag: "🇧🇪" },
  { code: "DK", name: "Dänemark",   flag: "🇩🇰" },
  { code: "NO", name: "Norwegen",   flag: "🇳🇴" },
  { code: "SE", name: "Schweden",   flag: "🇸🇪" },
  { code: "FI", name: "Finnland",   flag: "🇫🇮" },
];

type Props = {
  activeCountries: string[];
  setActiveCountries: React.Dispatch<React.SetStateAction<string[]>>;
  activeTypes: string[];
  setActiveTypes: React.Dispatch<React.SetStateAction<string[]>>;
  zoneCounts: Record<string, number>;
};

const S = {
  sidebar: {
    width: 230, minWidth: 230, background: "#0d1220",
    borderRight: "1px solid rgba(255,255,255,0.07)",
    display: "flex" as const, flexDirection: "column" as const,
    height: "100vh", zIndex: 50, overflowY: "hidden" as const,
  },
  header: {
    padding: "14px 14px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  logoRow: { display: "flex" as const, alignItems: "center", gap: 8, marginBottom: 2 },
  logoIcon: {
    width: 26, height: 26, background: "#2563eb", borderRadius: 5,
    display: "flex" as const, alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: "0.02em" },
  subtitle: { fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginTop: 2 },
  sectionLabel: {
    fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.25)", padding: "10px 14px 5px",
  },
  scrollBox: { padding: "0 10px", overflowY: "auto" as const },
  countryBtn: (on: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", padding: "6px 8px", borderRadius: 5, border: "none",
    background: on ? "rgba(37,99,235,0.16)" : "transparent",
    cursor: "pointer", marginBottom: 2,
  }),
  check: (on: boolean): React.CSSProperties => ({
    width: 13, height: 13, borderRadius: 3, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: on ? "#2563eb" : "transparent",
    border: on ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.15)",
  }),
  countryName: (on: boolean): React.CSSProperties => ({
    fontSize: 12, color: on ? "#93bbff" : "rgba(255,255,255,0.65)",
    fontWeight: on ? 500 : 400,
  }),
  badge: (on: boolean): React.CSSProperties => ({
    fontSize: 10, fontFamily: "monospace", padding: "1px 5px", borderRadius: 3,
    background: on ? "rgba(37,99,235,0.28)" : "rgba(255,255,255,0.05)",
    color: on ? "#93bbff" : "rgba(255,255,255,0.28)",
  }),
};

export default function Sidebar({ activeCountries, setActiveCountries, activeTypes, setActiveTypes, zoneCounts }: Props) {

  function toggleCountry(code: string) {
    setActiveCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function toggleType(id: string) {
    setActiveTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  return (
    <div style={S.sidebar}>
      {/* Logo */}
      <div style={S.header}>
        <div style={S.logoRow}>
          <div style={S.logoIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={S.logoText}>DroneMap EU</span>
        </div>
        <p style={S.subtitle}>EU 2019/947 Luftraumklassen</p>
      </div>

      {/* Countries */}
      <p style={S.sectionLabel}>Länder</p>
      <div style={{ ...S.scrollBox, maxHeight: 200 }}>
        {ALL_COUNTRIES.map((c) => {
          const on = activeCountries.includes(c.code);
          return (
            <button key={c.code} onClick={() => toggleCountry(c.code)} style={S.countryBtn(on)}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={S.check(on)}>
                  {on && (
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
                      <polyline points="1.5,6 5,9.5 10.5,2.5"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 15, lineHeight: 1 }}>{c.flag}</span>
                <span style={S.countryName(on)}>{c.name}</span>
              </div>
              <span style={S.badge(on)}>{zoneCounts[c.code] ?? "—"}</span>
            </button>
          );
        })}
      </div>

      {/* Zone types */}
      <p style={S.sectionLabel}>Zonenklassen</p>
      <div style={{ ...S.scrollBox, flex: 1, paddingBottom: 12 }}>
        {Object.entries(ZONE_TYPES).map(([id, zt]) => {
          const on = activeTypes.includes(id);
          return (
            <div
              key={id}
              onClick={() => toggleType(id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                padding: "7px 8px", borderRadius: 6, marginBottom: 3, cursor: "pointer",
                background: on ? "rgba(255,255,255,0.06)" : "transparent",
                border: on ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                opacity: on ? 1 : 0.4,
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: 2, flexShrink: 0, marginTop: 2,
                background: zt.color,
              }} />
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 500, lineHeight: 1.3 }}>
                  {zt.label}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.3, marginTop: 1 }}>
                  {zt.cats.slice(0, 2).join(" · ")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}