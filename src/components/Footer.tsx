import { Link } from "react-router";
import Logo from "./Logo";
import { whatsappLink, PHONE_DISPLAY, CONTACT_EMAIL, ADDRESS_LINE1, ADDRESS_LINE2, getDirectionsLink } from "../data/contact";

export default function Footer() {
  return (
    <footer className="border-t mt-24" style={{ borderColor: "#1a1a1a", background: "#070707" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color: "#838383" }}>
              Há mais de 20 anos colocando você no carro certo. Tradição, confiança e atendimento que fazem a diferença.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: "#25D366", color: "#fff", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.529 5.845L0 24l6.335-1.51A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.822 9.822 0 01-5.011-1.375l-.36-.213-3.732.889.939-3.634-.234-.374A9.807 9.807 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
                Fale conosco
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-4 tracking-widest uppercase" style={{ fontFamily: "Montserrat, sans-serif", color: "#ccdd8f" }}>
              Navegação
            </h4>
            <ul className="space-y-3">
              {[["Início", "/"], ["Estoque", "/estoque"], ["Sobre nós", "/sobre"], ["Contato", "/contato"]].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-sm transition-colors hover:text-white" style={{ color: "#838383" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-4 tracking-widest uppercase" style={{ fontFamily: "Montserrat, sans-serif", color: "#ccdd8f" }}>
              Contato
            </h4>
            <ul className="space-y-3 text-sm" style={{ color: "#838383" }}>
              <li>
                <a href={getDirectionsLink()} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                  📍 {ADDRESS_LINE1}<br />{ADDRESS_LINE2}
                </a>
              </li>
              <li className="mt-2">
                📞 <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">{PHONE_DISPLAY}</a>
              </li>
              <li>✉️ {CONTACT_EMAIL}</li>
              <li className="mt-2">
                <span className="font-medium" style={{ color: "#ffffff" }}>Horário:</span>
                <br />
                Seg–Sex: 8h às 18h
                <br />
                Sábado: 8h às 13h
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3" style={{ borderColor: "#1a1a1a" }}>
          <p className="text-xs" style={{ color: "#444" }}>
            © {new Date().getFullYear()} Rick Automóveis. Todos os direitos reservados.
          </p>
          <Link to="/admin" className="text-xs transition-colors hover:text-white" style={{ color: "#333" }}>
            Área administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
