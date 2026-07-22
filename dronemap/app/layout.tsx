import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "DroneMap – Drohnenflugzonen",
  description:
    "Karte zur Orientierung über Drohnenflugzonen und Luftraumbeschränkungen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
