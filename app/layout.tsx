export const metadata = {
  title: "DroneMap Global Drone Regulation Viewer",
  description: "Live Drone Regulation Map",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full">
      <body className="bg-slate-900 text-white h-full">{children}</body>
    </html>
  );
}
