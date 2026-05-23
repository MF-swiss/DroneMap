// components/DroneMap.tsx
"use client";
import DroneMapClient from "./DroneMapClient";

export default function DroneMap() {
  return (
    <div className="h-full w-full overflow-hidden">
      <DroneMapClient />
    </div>
  );
}


// ─── app/page.tsx ────────────────────────────────────────────────────────────
// "use client";
// import DroneMap from "@/components/DroneMap";
// export default function Page() {
//   return (
//     <div className="h-screen w-screen overflow-hidden">
//       <DroneMap />
//     </div>
//   );
// }


// ─── app/layout.tsx ──────────────────────────────────────────────────────────
// export const metadata = {
//   title: "DroneMap – EU Luftraumrestriktionen",
//   description: "Live Drone Regulation Map basierend auf EU 2019/947",
// };
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="de">
//       <body className="bg-slate-900 text-white h-screen">{children}</body>
//     </html>
//   );
// }