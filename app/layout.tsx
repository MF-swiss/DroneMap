import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DroneMap EU – Luftraumrestriktionen",
  description: "Live Drohnen-Regulierungskarte basierend auf EU 2019/947",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" style={{ height: "100%" }}>
      <body style={{ height: "100%", margin: 0, padding: 0, background: "#0a0e1a", color: "#fff" }}>
        {children}
      </body>
    </html>
  );
}