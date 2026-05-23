"use client";

import { ZONE_TYPES } from "./DroneMapClient";

const ALL_COUNTRIES = [
  { code: "CH", name: "Schweiz",      flag: "🇨🇭" },
  { code: "DE", name: "Deutschland",  flag: "🇩🇪" },
  { code: "AT", name: "Österreich",   flag: "🇦🇹" },
  { code: "FR", name: "Frankreich",   flag: "🇫🇷" },
  { code: "IT", name: "Italien",       flag: "🇮🇹" },
  { code: "ES", name: "Spanien",       flag: "🇪🇸" },
  { code: "NL", name: "Niederlande",  flag: "🇳🇱" },
  { code: "BE", name: "Belgien",       flag: "🇧🇪" },
  { code: "DK", name: "Dänemark",     flag: "🇩🇰" },
  { code: "NO", name: "Norwegen",     flag: "🇳🇴" },
  { code: "SE", name: "Schweden",     flag: "🇸🇪" },
  { code: "FI", name: "Finnland",     flag: "🇫🇮" },
];

type Props = {
  activeCountries: string[];
  setActiveCountries: React.Dispatch<React.SetStateAction<string[]>>;
  activeTypes: string[];
  setActiveTypes: React.Dispatch<React.SetStateAction<string[]>>;
  zoneCounts: Record<string, number>;
};

export default function Sidebar({
  activeCountries,
  setActiveCountries,
  activeTypes,
  setActiveTypes,
  zoneCounts,
}: Props) {

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
    <div className="w-[230px] min-w-[230px] bg-[#0d1220] border-r border-white/[0.07] flex flex-col h-screen z-50">

      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-[26px] h-[26px] bg-blue-600 rounded-[5px] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-white tracking-wide">DroneMap EU</span>
        </div>
        <p className="text-[9px] text-white/30 tracking-[0.08em] uppercase">EU 2019/947 Luftraumklassen</p>
      </div>

      {/* Countries */}
      <div className="text-[9px] font-semibold tracking-[0.1em] uppercase text-white/25 px-4 pt-3 pb-1.5">
        Länder
      </div>
      <div className="px-2.5 overflow-y-auto max-h-[190px] scrollbar-thin">
        {ALL_COUNTRIES.map((c) => {
          const on = activeCountries.includes(c.code);
          return (
            <button
              key={c.code}
              onClick={() => toggleCountry(c.code)}
              className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md mb-0.5 transition-colors ${
                on ? "bg-blue-600/16" : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-[3px] border flex items-center justify-center flex-shrink-0 ${
                  on ? "bg-blue-600 border-blue-600" : "border-white/15"
                }`}>
                  {on && (
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
                      <polyline points="1.5,6 5,9.5 10.5,2.5"/>
                    </svg>
                  )}
                </div>
                <span className="text-base leading-none">{c.flag}</span>
                <span className={`text-[12px] ${on ? "text-blue-300 font-medium" : "text-white/65"}`}>
                  {c.name}
                </span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-[3px] ${
                on ? "bg-blue-600/30 text-blue-300" : "bg-white/5 text-white/28"
              }`}>
                {zoneCounts[c.code] ?? "—"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Zone types */}
      <div className="text-[9px] font-semibold tracking-[0.1em] uppercase text-white/25 px-4 pt-3 pb-1.5">
        Zonenklassen
      </div>
      <div className="px-2.5 flex-1 overflow-y-auto scrollbar-thin pb-4">
        {Object.entries(ZONE_TYPES).map(([id, zt]) => {
          const on = activeTypes.includes(id);
          return (
            <div
              key={id}
              onClick={() => toggleType(id)}
              className={`flex items-start gap-2 px-2 py-2 rounded-md mb-1 cursor-pointer border transition-all ${
                on
                  ? "bg-white/[0.06] border-white/[0.08]"
                  : "border-transparent opacity-40 hover:opacity-60"
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-[2px] flex-shrink-0 mt-[3px]"
                style={{ background: zt.color }}
              />
              <div>
                <div className="text-[11px] text-white/75 font-medium leading-tight">{zt.label}</div>
                <div className="text-[10px] text-white/35 leading-tight mt-0.5">
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