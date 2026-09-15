import { useState } from "react";
import { useNavigate, Link } from "react-router";
import VehicleCard from "../components/VehicleCard";
import { getFeaturedVehicles, getNewVehicles, getAvailableVehicles } from "../data/vehicleStore";
import { whatsappLink } from "../data/contact";
import rickFrente from "../imports/rick frente.png";

export default function Home() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const featured = getFeaturedVehicles();
  const newVehicles = getNewVehicles();
  const total = getAvailableVehicles().length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/estoque?q=${encodeURIComponent(search)}`);
  };

  const categories = [
    { label: "SUVs", icon: "🚙", filter: "SUV" },
    { label: "Sedãs", icon: "🚗", filter: "Sedan" },
    { label: "Hatches", icon: "🚘", filter: "Hatch" },
    { label: "Picapes", icon: "🛻", filter: "Pickup" },
    { label: "Automáticos", icon: "⚙️", filter: "auto" },
    { label: "Motos", icon: "🏍️", filter: "Moto" },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "#0a0a0a" }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&h=1080&fit=crop&auto=format')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.25,
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,10,1) 40%, rgba(10,10,10,0.2) 100%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-24 pb-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest mb-4" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>
              RICK AUTOMÓVEIS · +20 ANOS DE HISTÓRIA
            </p>
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-6"
              style={{ fontFamily: "Montserrat, sans-serif", color: "#ffffff" }}
            >
              Mais de 20 anos
              <br />
              <span style={{ color: "#ccdd8f" }}>colocando você</span>
              <br />
              no carro certo.
            </h1>
            <p className="text-lg mb-10" style={{ color: "#838383" }}>
              Encontre o seu próximo carro com quem entende do assunto.
              <br />
              Qualidade, confiança e atendimento que fazem a diferença.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <input
                type="text"
                placeholder="Busque por marca, modelo ou versão"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-5 py-4 text-sm outline-none transition-all duration-200"
                style={{
                  background: "#111",
                  border: "1px solid #333",
                  color: "#fff",
                  borderRadius: "4px",
                  fontFamily: "Raleway, sans-serif",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#ccdd8f"; }}
                onBlur={(e) => { e.target.style.borderColor = "#333"; }}
              />
              <button
                type="submit"
                className="px-6 py-4 text-sm font-bold tracking-wider transition-all duration-200 hover:opacity-90 whitespace-nowrap"
                style={{ background: "#ccdd8f", color: "#000", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
              >
                ENCONTRAR MEU CARRO
              </button>
            </form>

            {/* Quick filters */}
            <div className="mt-8 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.label}
                  to={`/estoque${cat.filter === "auto" ? "?transmission=Automático" : cat.filter ? `?bodyType=${cat.filter}` : ""}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200"
                  style={{ background: "#151515", border: "1px solid #222", color: "#aaa", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
                  onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = "#ccdd8f"; el.style.color = "#ccdd8f"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = "#222"; el.style.color = "#aaa"; }}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: "#444" }}>
          <span className="text-xs tracking-widest" style={{ fontFamily: "Montserrat, sans-serif" }}>SCROLL</span>
          <div className="w-px h-12" style={{ background: "linear-gradient(to bottom, #444, transparent)" }} />
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>
              SELEÇÃO ESPECIAL
            </p>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Os queridinhos da Rick
            </h2>
          </div>
          <Link
            to="/estoque"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold transition-colors hover:text-white"
            style={{ color: "#838383", fontFamily: "Montserrat, sans-serif" }}
          >
            Ver todos os {total} veículos →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.slice(0, 4).map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>

      {/* NOVIDADES */}
      {newVehicles.length > 0 && (
        <section className="py-20" style={{ background: "#080808" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>
                  ACABARAM DE CHEGAR
                </p>
                <h2 className="text-3xl sm:text-4xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Novidades no estoque
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {newVehicles.slice(0, 3).map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIAS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>
          EXPLORE POR CATEGORIA
        </p>
        <h2 className="text-3xl sm:text-4xl font-black mb-10" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Encontre o tipo certo para você
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "SUVs", icon: "🚙", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=260&fit=crop&auto=format", filter: "SUV" },
            { label: "Sedãs", icon: "🚗", img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=260&fit=crop&auto=format", filter: "Sedan" },
            { label: "Hatches", icon: "🚘", img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=260&fit=crop&auto=format", filter: "Hatch" },
            { label: "Picapes", icon: "🛻", img: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400&h=260&fit=crop&auto=format", filter: "Pickup" },
            { label: "Automáticos", icon: "⚙️", img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=260&fit=crop&auto=format", filter: "auto" },
          ].map((cat) => (
            <Link
              key={cat.label}
              to={`/estoque${cat.filter === "auto" ? "?transmission=Automático" : `?bodyType=${cat.filter}`}`}
              className="relative overflow-hidden group"
              style={{ borderRadius: "4px", height: "130px" }}
            >
              <img
                src={cat.img}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)" }} />
              <div className="absolute bottom-3 left-3">
                <p className="text-sm font-bold text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>{cat.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SOBRE A RICK */}
      <section className="py-20" style={{ background: "#080808" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>
                NOSSA HISTÓRIA
              </p>
              <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Mais de 20 anos
                <br />
                de experiência
              </h2>
              <p className="text-base leading-relaxed mb-4" style={{ color: "#838383" }}>
                A Rick Automóveis nasceu da paixão por veículos e do compromisso com o atendimento de excelência. Ao longo de duas décadas, construímos uma reputação sólida baseada na confiança, transparência e no cuidado com cada cliente.
              </p>
              <p className="text-base leading-relaxed mb-8" style={{ color: "#838383" }}>
                Cada veículo do nosso estoque passa por uma rigorosa inspeção técnica para garantir que você leve para casa não apenas um carro, mas a tranquilidade que você merece.
              </p>

              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { num: "+20", label: "Anos de mercado" },
                  { num: "+1.200", label: "Carros vendidos" },
                  { num: "4.9★", label: "Avaliação média" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-black mb-1" style={{ fontFamily: "Montserrat, sans-serif", color: "#ccdd8f" }}>{stat.num}</p>
                    <p className="text-xs" style={{ color: "#838383" }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              <a
                href={whatsappLink("Olá! Gostaria de mais informações.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-wider transition-opacity hover:opacity-90"
                style={{ background: "#ccdd8f", color: "#000", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
              >
                FALE COM UM CONSULTOR
              </a>
            </div>

            <div className="relative">
              <img
                src={rickFrente}
                alt="Showroom Rick Automóveis"
                className="w-full object-cover"
                style={{ height: "400px", borderRadius: "4px" }}
              />
              <div
                className="absolute -bottom-4 -left-4 px-6 py-4"
                style={{ background: "#ccdd8f", borderRadius: "4px" }}
              >
                <p className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif", color: "#000" }}>+20</p>
                <p className="text-xs font-semibold" style={{ fontFamily: "Montserrat, sans-serif", color: "#333" }}>Anos de tradição</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24" style={{ background: "#0a0a0a" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Seu próximo carro
            <br />
            <span style={{ color: "#ccdd8f" }}>está aqui.</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: "#838383" }}>
            Explore nosso estoque completo e encontre o veículo dos seus sonhos com a confiança de quem tem mais de 20 anos no mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/estoque"
              className="px-8 py-4 text-sm font-bold tracking-wider transition-opacity hover:opacity-90"
              style={{ background: "#ccdd8f", color: "#000", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
            >
              VER ESTOQUE COMPLETO
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-sm font-bold tracking-wider transition-all duration-200 hover:border-white"
              style={{ border: "1px solid #333", color: "#fff", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
            >
              FALAR COM CONSULTOR
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
