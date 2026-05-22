import { topoLayer } from "@/utils/leafletTopo";

useEffect(() => {
  if (!mapRef.current) return;

  activeCountries.forEach(async (country) => {
    if (layersRef.current[country]) return;

    const res = await fetch(`/data/zones_compressed/${country}.topo.json`);
    const topo = await res.json();
    const [selectedZone, setSelectedZone] = useState<any>(null);


    const layer = topoLayer(topo, {
      style: {
        color: "#ff6600",
        weight: 1,
        fillOpacity: 0.25,
      },
    });

    layer.addTo(mapRef.current);
    layersRef.current[country] = layer;
  });

  {selectedZone && (
  <div className="absolute bottom-4 right-4 bg-white shadow-xl p-4 rounded-lg w-64 z-[9999]">
    <h3 className="font-bold text-lg mb-2">{selectedZone.name}</h3>

    <p><strong>Typ:</strong> {selectedZone.type}</p>
    <p><strong>Land:</strong> {selectedZone.country}</p>
    <p><strong>Quelle:</strong> {selectedZone.source}</p>

    <button
      className="mt-3 px-3 py-1 bg-gray-300 rounded"
      onClick={() => setSelectedZone(null)}
    >
      Schließen
    </button>
  </div>
)}


  Object.keys(layersRef.current).forEach((country) => {
    if (!activeCountries.includes(country)) {
      mapRef.current!.removeLayer(layersRef.current[country]);
      delete layersRef.current[country];
    }
  });
}, [activeCountries]);
