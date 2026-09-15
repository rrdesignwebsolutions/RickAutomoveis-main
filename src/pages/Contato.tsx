import { whatsappLink, PHONE_DISPLAY, CONTACT_EMAIL, ADDRESS_LINE1, ADDRESS_LINE2, GOOGLE_MAPS_EMBED_SRC, getDirectionsLink } from "../data/contact";

export default function Contato() {
  return (
    <main className="pt-32">
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="max-w-3xl">
          <p className="text-xs font-bold tracking-widest mb-4" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>
            FALE COM A RICK
          </p>
          <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Estamos aqui para ajudar você.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "#838383" }}>
            Tire suas dúvidas, agende uma visita ou encontre seu próximo carro com a nossa equipe.
          </p>
        </div>
      </section>

      <section className="py-20" style={{ background: "#080808" }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 border" style={{ borderColor: "#222", background: "#0d0d0d", borderRadius: "4px" }}>
            <h2 className="text-2xl font-black mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>Canais de atendimento</h2>
            <div className="space-y-5 text-sm" style={{ color: "#838383" }}>
              <p>
                <strong className="block mb-1" style={{ color: "#fff" }}>Telefone</strong>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">{PHONE_DISPLAY}</a>
              </p>
              <p><strong className="block mb-1" style={{ color: "#fff" }}>E-mail</strong>{CONTACT_EMAIL}</p>
              <p>
                <strong className="block mb-1" style={{ color: "#fff" }}>Endereço</strong>
                <a href={getDirectionsLink()} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                  {ADDRESS_LINE1}<br />{ADDRESS_LINE2}
                </a>
              </p>
            </div>

            <div className="relative mt-6" style={{ borderRadius: "4px", overflow: "hidden", height: "220px", border: "1px solid #222" }}>
              <iframe
                src={GOOGLE_MAPS_EMBED_SRC}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Rick Automóveis no Google Maps"
              />
              <a
                href={getDirectionsLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0"
                aria-label="Abrir rota até a Rick Automóveis no Google Maps, Waze ou Apple Maps"
                title="Como chegar"
              />
            </div>
          </div>
          <div className="p-8 border" style={{ borderColor: "#222", background: "#0d0d0d", borderRadius: "4px" }}>
            <h2 className="text-2xl font-black mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>Horário de atendimento</h2>
            <p className="text-sm leading-8 mb-8" style={{ color: "#838383" }}>
              Segunda a sexta: 8h às 18h<br />
              Sábado: 8h às 13h
            </p>
            <a href={whatsappLink("Olá! Gostaria de falar com a Rick Automóveis.")} target="_blank" rel="noopener noreferrer" className="inline-flex px-6 py-3 text-sm font-bold tracking-wider transition-opacity hover:opacity-90" style={{ background: "#25D366", color: "#fff", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}>
              CHAMAR NO WHATSAPP
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}