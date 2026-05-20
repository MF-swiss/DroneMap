// app/page.tsx  (Server Component)
import DroneMapClient from "../components/DroneMapClient";

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>DroneMap</h1>
      <DroneMapClient />
    </main>
  );
}
