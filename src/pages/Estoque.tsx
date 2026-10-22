import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import VehicleCard from "../components/VehicleCard";
import type { BodyType, FuelType, TransmissionType } from "../data/vehicles";
import { useVehicles } from "../data/vehicleStore";

const SORT_OPTIONS = [
  { value: "recent", label: "Mais recentes" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
  { value: "km_asc", label: "Menor quilometragem" },
  { value: "km_desc", label: "Maior quilometragem" },
  { value: "year_desc", label: "Ano mais novo" },
  { value: "year_asc", label: "Ano mais antigo" },
];

export default function Estoque() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const vehicles = useVehicles();
  const allVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === "available" || vehicle.status === "reserved"),
    [vehicles],
  );

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("recent");
  const [bodyTypeFilter, setBodyTypeFilter] = useState<string>(searchParams.get("bodyType") || "");
  const [transmissionFilter, setTransmissionFilter] = useState<string>(searchParams.get("transmission") || "");
  const [fuelFilter, setFuelFilter] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [minKm, setMinKm] = useState("");
  const [maxKm, setMaxKm] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
    const bt = searchParams.get("bodyType");
    if (bt) setBodyTypeFilter(bt);
    const tr = searchParams.get("transmission");
    if (tr) setTransmissionFilter(tr);
  }, [searchParams]);

  const brands = useMemo(() => [...new Set(allVehicles.map((v) => v.brand))].sort(), [allVehicles]);

  const filtered = useMemo(() => {
    let result = [...allVehicles];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.version.toLowerCase().includes(q) ||
          v.color.toLowerCase().includes(q)
      );
    }
    if (bodyTypeFilter) result = result.filter((v) => v.bodyType === bodyTypeFilter);
    if (transmissionFilter) result = result.filter((v) => v.transmission === transmissionFilter);
    if (fuelFilter) result = result.filter((v) => v.fuel === fuelFilter);
    if (brandFilter) result = result.filter((v) => v.brand === brandFilter);
    if (minPrice) result = result.filter((v) => (v.promotionalPrice || v.price) >= Number(minPrice));
    if (maxPrice) result = result.filter((v) => (v.promotionalPrice || v.price) <= Number(maxPrice));
    if (minYear) result = result.filter((v) => v.year >= Number(minYear));
    if (maxYear) result = result.filter((v) => v.year <= Number(maxYear));
    if (minKm) result = result.filter((v) => v.mileage >= Number(minKm));
    if (maxKm) result = result.filter((v) => v.mileage <= Number(maxKm));

    result.sort((a, b) => {
      const pa = a.promotionalPrice || a.price;
      const pb = b.promotionalPrice || b.price;
      switch (sort) {
        case "price_asc": return pa - pb;
        case "price_desc": return pb - pa;
        case "km_asc": return a.mileage - b.mileage;
        case "km_desc": return b.mileage - a.mileage;
        case "year_desc": return b.year - a.year;
        case "year_asc": return a.year - b.year;
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return result;
  }, [search, sort, bodyTypeFilter, transmissionFilter, fuelFilter, brandFilter, minPrice, maxPrice, minYear, maxYear, minKm, maxKm]);

  const hasActiveFilters = bodyTypeFilter || transmissionFilter || fuelFilter || brandFilter || minPrice || maxPrice || minYear || maxYear || minKm || maxKm;

  const clearFilters = () => {
    setBodyTypeFilter(""); setTransmissionFilter(""); setFuelFilter(""); setBrandFilter("");
    setMinPrice(""); setMaxPrice(""); setMinYear(""); setMaxYear(""); setMinKm(""); setMaxKm("");
    setSearchParams({});
  };

  const FilterSelect = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div>
      <label className="block text-xs font-semibold mb-2 tracking-wider" style={{ color: "#838383", fontFamily: "Montserrat, sans-serif" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm outline-none appearance-none cursor-pointer"
        style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: value ? "#fff" : "#555", borderRadius: "4px" }}
      >
        <option value="">Todos</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const PriceInput = ({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) => (
    <input
      type="number"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm outline-none"
      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", borderRadius: "4px" }}
    />
  );

  const FiltersPanel = () => (
    <div className="space-y-5">
      <FilterSelect label="MARCA" value={brandFilter} onChange={setBrandFilter} options={brands} />
      <FilterSelect label="CARROCERIA" value={bodyTypeFilter} onChange={setBodyTypeFilter} options={["Hatch", "Sedan", "SUV", "Pickup", "Coupe", "Minivan", "Moto"]} />
      <FilterSelect label="CÂMBIO" value={transmissionFilter} onChange={setTransmissionFilter} options={["Automático", "Manual", "CVT", "Automatizado"]} />
      <FilterSelect label="COMBUSTÍVEL" value={fuelFilter} onChange={setFuelFilter} options={["Flex", "Gasolina", "Diesel", "Híbrido", "Elétrico"]} />

      <div>
        <label className="block text-xs font-semibold mb-2 tracking-wider" style={{ color: "#838383", fontFamily: "Montserrat, sans-serif" }}>PREÇO</label>
        <div className="flex gap-2">
          <PriceInput placeholder="Mín" value={minPrice} onChange={setMinPrice} />
          <PriceInput placeholder="Máx" value={maxPrice} onChange={setMaxPrice} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-2 tracking-wider" style={{ color: "#838383", fontFamily: "Montserrat, sans-serif" }}>ANO</label>
        <div className="flex gap-2">
          <PriceInput placeholder="De" value={minYear} onChange={setMinYear} />
          <PriceInput placeholder="Até" value={maxYear} onChange={setMaxYear} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-2 tracking-wider" style={{ color: "#838383", fontFamily: "Montserrat, sans-serif" }}>QUILOMETRAGEM</label>
        <div className="flex gap-2">
          <PriceInput placeholder="Mín km" value={minKm} onChange={setMinKm} />
          <PriceInput placeholder="Máx km" value={maxKm} onChange={setMaxKm} />
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="w-full py-2.5 text-sm font-semibold transition-colors" style={{ color: "#e30613", border: "1px solid #330a0a", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}>
          Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-24" style={{ background: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>ESTOQUE</p>
          <h1 className="text-3xl sm:text-4xl font-black mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>Encontre seu próximo carro</h1>
          <p className="text-sm" style={{ color: "#838383" }}><span className="font-semibold text-white">{filtered.length}</span> veículos disponíveis</p>
        </div>

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Busque por marca, modelo, versão, cor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 text-sm outline-none"
              style={{ background: "#111", border: "1px solid #222", color: "#fff", borderRadius: "4px" }}
              onFocus={(e) => { e.target.style.borderColor = "#ccdd8f"; }}
              onBlur={(e) => { e.target.style.borderColor = "#222"; }}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3.5 text-sm outline-none cursor-pointer"
            style={{ background: "#111", border: "1px solid #222", color: "#fff", borderRadius: "4px", minWidth: "180px" }}
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {/* Mobile filter toggle */}
          <button
            className="lg:hidden flex items-center gap-2 px-4 py-3.5 text-sm font-semibold"
            onClick={() => setFiltersOpen(!filtersOpen)}
            style={{ background: "#111", border: "1px solid #222", color: "#fff", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
            Filtros {hasActiveFilters && <span className="w-2 h-2 rounded-full" style={{ background: "#ccdd8f" }} />}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters - desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 p-5" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
              <p className="text-xs font-bold tracking-widest mb-5" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>FILTROS</p>
              <FiltersPanel />
            </div>
          </aside>

          {/* Mobile filter drawer */}
          {filtersOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="flex-1" onClick={() => setFiltersOpen(false)} style={{ background: "rgba(0,0,0,0.7)" }} />
              <div className="w-72 h-full overflow-y-auto p-6" style={{ background: "#111", borderLeft: "1px solid #222" }}>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs font-bold tracking-widest" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>FILTROS</p>
                  <button onClick={() => setFiltersOpen(false)} className="text-sm" style={{ color: "#838383" }}>✕</button>
                </div>
                <FiltersPanel />
              </div>
            </div>
          )}

          {/* Grid */}
          <main className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-semibold mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>Nenhum veículo encontrado</p>
                <p className="text-sm mb-6" style={{ color: "#838383" }}>Tente ajustar os filtros ou a busca</p>
                <button onClick={clearFilters} className="px-5 py-2.5 text-sm font-semibold" style={{ background: "#ccdd8f", color: "#000", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}>
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
