type SidebarProps = {
  activeCountries: string[];
  setActiveCountries: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function Sidebar({ activeCountries, setActiveCountries }: SidebarProps) {
  const countries = ["CH", "DE", "AT", "FR", "IT", "ES", "NL", "BE", "DK", "NO", "SE", "FI"];

  function toggleCountry(code: string) {
    setActiveCountries((prev: string[]) =>
      prev.includes(code)
        ? prev.filter((c: string) => c !== code)
        : [...prev, code]
    );
  }

  return (
    <div className="p-4 w-64 bg-white shadow-lg z-50 h-screen overflow-y-auto">
      <h2 className="font-bold mb-4">Länder</h2>

      {countries.map((code) => (
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
