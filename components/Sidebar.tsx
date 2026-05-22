type SidebarProps = {
  activeCountries: string[];
  setActiveCountries: React.Dispatch<React.SetStateAction<string[]>>;
};

const ALL_COUNTRIES = ["CH", "DE", "AT", "FR", "IT", "ES", "NL", "BE", "DK", "NO", "SE", "FI"];

export default function Sidebar({ activeCountries, setActiveCountries }: SidebarProps) {

  function toggleCountry(code: string) {
    setActiveCountries((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  }

  return (
    <div className="p-4 w-64 bg-white text-black shadow-lg z-50 h-screen overflow-y-auto">
      <h2 className="font-bold mb-4">Länder</h2>

      {ALL_COUNTRIES.map((code) => (
        <button
          key={code}
          onClick={() => toggleCountry(code)}
          className={`w-full text-left px-3 py-2 mb-2 rounded ${
            activeCountries.includes(code)
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
