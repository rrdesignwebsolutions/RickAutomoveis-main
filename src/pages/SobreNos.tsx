import { Link } from "react-router";

export default function SobreNos() {
  return (
    <main className="pt-32">
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="max-w-3xl">
          <p className="text-xs font-bold tracking-widest mb-4" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>
            SOBRE A RICK AUTOMÓVEIS
          </p>
          <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Experiência para você escolher com confiança.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "#838383" }}>
            Há mais de 20 anos, ajudamos pessoas a encontrarem o carro certo com transparência, cuidado e atendimento próximo.
          </p>
        </div>
      </section>

      <section className="py-20" style={{ background: "#080808" }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <img src="/showroom.png" alt="Showroom Rick Automóveis" className="w-full object-cover" style={{ height: "420px", borderRadius: "4px" }} />
          <div>
            <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Mais do que vender carros
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: "#838383" }}>
              A Rick Automóveis nasceu da paixão por veículos e cresceu construindo relações duradouras. Cada carro do nosso estoque passa por uma avaliação cuidadosa para que você compre com tranquilidade.
            </p>
            <p className="leading-relaxed mb-8" style={{ color: "#838383" }}>
              Nossa equipe está pronta para entender o que você precisa e acompanhar cada etapa da sua escolha.
            </p>
            <Link to="/estoque" className="inline-flex px-6 py-3 text-sm font-bold tracking-wider transition-opacity hover:opacity-90" style={{ background: "#ccdd8f", color: "#000", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}>
              CONHEÇA NOSSO ESTOQUE
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}