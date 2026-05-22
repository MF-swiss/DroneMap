export const metadata = {
  title: "DroneMap Global Drone Regulation Viewer",
  description: "Live Drone Regulation Map",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-slate-900 text-white min-h-screen">{children}</body>
    </html>
  );
}
