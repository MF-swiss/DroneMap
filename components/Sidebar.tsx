"use client";

import { useState } from "react";

const COUNTRIES = ["CH", "DE", "AT", "FR", "IT"] as const;

export function Sidebar() {
  const [selected, setSelected] = useState<string>("CH");

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-200 mb-2">
          Länder
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelected(c)}
              className={`text-xs px-2 py-1 rounded border ${
                selected === c
                  ? "bg-emerald-500 text-slate-900 border-emerald-400"
                  : "border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-200 mb-2">
          Kategorien
        </h2>
        <ul className="space-y-1 text-xs text-slate-300">
          <li><span className="inline-block w-3 h-3 rounded bg-green-500 mr-2" />A1 – Nahe an Menschen</li>
          <li><span className="inline-block w-3 h-3 rounded bg-yellow-400 mr-2" />A2 – Abstand nötig</li>
          <li><span className="inline-block w-3 h-3 rounded bg-orange-500 mr-2" />A3 – Weit weg</li>
          <li><span className="inline-block w-3 h-3 rounded bg-red-500 mr-2" />SPECIFIC – Bewilligung</li>
          <li><span className="inline-block w-3 h-3 rounded bg-purple-500 mr-2" />CERTIFIED – Hochrisiko</li>
        </ul>
      </div>

      <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
        Daten: Offizielle Quellen + Normalisierung<br />
        Ansicht: Nur informativ, keine Rechtsberatung.
      </div>
    </div>
  );
}
