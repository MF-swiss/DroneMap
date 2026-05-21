import { Sidebar } from "@/components/Sidebar";
import { DroneMapClient } from "@/components/DroneMapClient";

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">DroneMap</span>
          <span className="text-xs text-slate-400">
            Global Drone Regulation Viewer
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Beta</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900/70 backdrop-blur overflow-y-auto">
          <Sidebar />
        </aside>

        {/* Map */}
        <section className="flex-1 relative">
          <DroneMapClient />
        </section>
      </main>
    </div>
  );
}
