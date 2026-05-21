import "./globals.css";

export const metadata = {
  title: "DroneMap",
  description: "Global Drone Regulation Map",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}

