import { useState } from "react";
import { useParams, Link } from "react-router";
import VehicleCard from "../components/VehicleCard";
import { formatPrice, formatMileage } from "../data/vehicles";
import { getVehicleBySlug, getRelatedVehicles } from "../data/vehicleStore";
import { whatsappLink } from "../data/contact";

export default function VehiclePage() {
  const { slug } = useParams<{ slug: string }>();
  const vehicle = getVehicleBySlug(slug || "");
  const [activeImg, setActiveImg] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-5xl mb-4">🚗</p>
          <h1 className="text-2xl font-black mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>Veículo não encontrado</h1>
          <p className="mb-6" style={{ color: "#838383" }}>Este anúncio pode ter sido removido ou vendido.</p>
          <Link to="/estoque" className="px-6 py-3 text-sm font-bold" style={{ background: "#ccdd8f", color: "#000", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}>
            Ver estoque →
          </Link>
        </div>
      </div>
    );
  }

  const orderedImages = vehicle.images;

  const related = getRelatedVehicles(vehicle);
  const displayPrice = vehicle.promotionalPrice || vehicle.price;

  const waMessage = `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.version}, ano ${vehicle.year}, anunciado por ${formatPrice(displayPrice)}. Gostaria de mais informações.`;
  const waLink = whatsappLink(waMessage);

  const details = [
    { label: "Ano", value: `${vehicle.year}/${vehicle.modelYear}` },
    { label: "Quilometragem", value: formatMileage(vehicle.mileage) },
    { label: "Câmbio", value: vehicle.transmission },
    { label: "Combustível", value: vehicle.fuel },
    { label: "Cor", value: vehicle.color },
    { label: "Motor", value: vehicle.engine },
    { label: "Final de placa", value: vehicle.plateFinal },
    { label: "Carroceria", value: vehicle.bodyType },
    { label: "Tração", value: vehicle.traction },
    { label: "Portas", value: `${vehicle.doors} portas` },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ background: "#0a0a0a" }}>
      {/* Fullscreen gallery */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.97)" }}>
          <button onClick={() => setFullscreen(false)} className="absolute top-6 right-6 text-white text-2xl" aria-label="Fechar">✕</button>
          <button onClick={() => setActiveImg((i) => (i - 1 + vehicle.images.length) % vehicle.images.length)} className="absolute left-6 p-3 text-white" aria-label="Anterior">‹</button>
          <img src={orderedImages[activeImg]} alt="" className="max-h-screen max-w-5xl w-full object-contain px-16" />
          <button onClick={() => setActiveImg((i) => (i + 1) % vehicle.images.length)} className="absolute right-6 p-3 text-white" aria-label="Próxima">›</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: "#555", fontFamily: "Montserrat, sans-serif" }}>
          <Link to="/" className="hover:text-white transition-colors">Início</Link>
          <span>›</span>
          <Link to="/estoque" className="hover:text-white transition-colors">Estoque</Link>
          <span>›</span>
          <span style={{ color: "#838383" }}>{vehicle.brand} {vehicle.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div
              className="relative overflow-hidden cursor-pointer mb-3"
              style={{ height: "400px", background: "#0d0d0d", borderRadius: "4px" }}
              onClick={() => setFullscreen(true)}
            >
              <img
                src={orderedImages[activeImg]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {vehicle.isNew && (
                <span className="absolute top-4 left-4 text-xs font-bold px-2.5 py-1 tracking-wider" style={{ background: "#ccdd8f", color: "#000", fontFamily: "Montserrat, sans-serif", borderRadius: "2px" }}>
                  NOVO NO ESTOQUE
                </span>
              )}
              <div className="absolute bottom-4 right-4 px-2 py-1 text-xs" style={{ background: "rgba(0,0,0,0.7)", color: "#fff", borderRadius: "2px" }}>
                🔍 Toque para ampliar
              </div>
              {orderedImages.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + vehicle.images.length) % vehicle.images.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-lg font-bold transition-opacity hover:opacity-100 opacity-70" style={{ background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: "2px" }}>‹</button>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % vehicle.images.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-lg font-bold transition-opacity hover:opacity-100 opacity-70" style={{ background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: "2px" }}>›</button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {orderedImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className="shrink-0 overflow-hidden transition-all duration-200"
                  style={{
                    width: "80px", height: "56px", borderRadius: "2px",
                    border: i === activeImg ? "2px solid #ccdd8f" : "2px solid transparent",
                    opacity: i === activeImg ? 1 : 0.5,
                  }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle info */}
          <div>
            <p className="text-xs font-bold tracking-wider mb-1" style={{ color: "#838383", fontFamily: "Montserrat, sans-serif" }}>
              {vehicle.brand.toUpperCase()}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
              {vehicle.model}
            </h1>
            <p className="text-base mb-4" style={{ color: "#838383" }}>{vehicle.version}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {[`${vehicle.year}`, formatMileage(vehicle.mileage), vehicle.transmission, vehicle.fuel].map((tag) => (
                <span key={tag} className="text-xs px-3 py-1.5 font-medium" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#aaa", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="mb-6 p-5" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
              {vehicle.promotionalPrice && (
                <p className="text-sm line-through mb-1" style={{ color: "#555" }}>{formatPrice(vehicle.price)}</p>
              )}
              <p className="text-4xl font-black" style={{ fontFamily: "Montserrat, sans-serif", color: "#ccdd8f" }}>
                {formatPrice(displayPrice)}
              </p>
              {vehicle.promotionalPrice && (
                <p className="text-xs mt-1" style={{ color: "#25D366" }}>
                  Economia de {formatPrice(vehicle.price - vehicle.promotionalPrice)}
                </p>
              )}
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 text-base font-black tracking-wider mb-3 transition-opacity hover:opacity-90"
              style={{ background: "#e30613", color: "#fff", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.529 5.845L0 24l6.335-1.51A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.822 9.822 0 01-5.011-1.375l-.36-.213-3.732.889.939-3.634-.234-.374A9.807 9.807 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
              TENHO INTERESSE
            </a>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold transition-all hover:border-white"
              style={{ border: "1px solid #2a2a2a", color: "#aaa", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
            >
              Falar com um consultor →
            </a>
          </div>
        </div>

        {/* Description, Details, Features */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="text-xl font-black mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Sobre este veículo</h2>
              <div className="h-px mb-5" style={{ background: "#1e1e1e" }} />
              <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>{vehicle.description}</p>
            </section>

            {/* Details grid */}
            <section>
              <h2 className="text-xl font-black mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Detalhes</h2>
              <div className="h-px mb-5" style={{ background: "#1e1e1e" }} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {details.map(({ label, value }) => (
                  <div key={label} className="p-4" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
                    <p className="text-xs mb-1 font-medium" style={{ color: "#555", fontFamily: "Montserrat, sans-serif" }}>{label}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Features */}
            {vehicle.features.length > 0 && (
              <section>
                <h2 className="text-xl font-black mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>Opcionais</h2>
                <div className="h-px mb-5" style={{ background: "#1e1e1e" }} />
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((f) => (
                    <span key={f} className="text-sm px-4 py-2" style={{ background: "#111", border: "1px solid #1e1e1e", color: "#ccdd8f", borderRadius: "4px" }}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar CTA sticky */}
          <div>
            <div className="sticky top-24 p-5" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
              <p className="text-xs font-bold tracking-widest mb-4" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>INFORMAÇÕES RÁPIDAS</p>
              <ul className="space-y-3 mb-5">
                {[
                  ["Ano", `${vehicle.year}`],
                  ["Km", formatMileage(vehicle.mileage)],
                  ["Câmbio", vehicle.transmission],
                  ["Cor", vehicle.color],
                ].map(([k, v]) => (
                  <li key={k} className="flex justify-between text-sm">
                    <span style={{ color: "#555" }}>{k}</span>
                    <span className="font-semibold text-white">{v}</span>
                  </li>
                ))}
              </ul>
              <div className="h-px mb-5" style={{ background: "#1e1e1e" }} />
              <p className="text-xl font-black mb-4" style={{ fontFamily: "Montserrat, sans-serif", color: "#ccdd8f" }}>{formatPrice(displayPrice)}</p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3.5 text-sm font-black tracking-wider text-center transition-opacity hover:opacity-90"
                style={{ background: "#e30613", color: "#fff", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
              >
                TENHO INTERESSE
              </a>
            </div>
          </div>
        </div>

        {/* Related vehicles */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>Você também pode gostar</h2>
            <p className="text-sm mb-8" style={{ color: "#838383" }}>Veículos similares disponíveis no estoque</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
