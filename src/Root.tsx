import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { whatsappLink } from "./data/contact";
import { syncSharedVehicleImages, syncSharedVehicles } from "./data/vehicleStore";

const WHATSAPP_MESSAGE = "Olá, Rick! Estava olhando os carros do site e gostaria de ajuda para encontrar a melhor opção para mim. 🚗";

export default function Root() {
  const location = useLocation();
  const [showExitOffer, setShowExitOffer] = useState(false);
  const noFooter = location.pathname.startsWith("/admin");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (noFooter) return;

    const refreshSharedData = async () => {
      try {
        await syncSharedVehicles();
      } catch (error) {
        console.error("Não foi possível atualizar o estoque compartilhado.", error);
      }
      try {
        await syncSharedVehicleImages();
      } catch (error) {
        console.error("Não foi possível atualizar a ordem compartilhada das fotos.", error);
      }
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshSharedData();
    };

    refreshSharedData();
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("pageshow", refreshSharedData);

    return () => {
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("pageshow", refreshSharedData);
    };
  }, [noFooter]);

  useEffect(() => {
    if (noFooter) return;

    const isDesktop = window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;
    let hasShownOffer = false;

    const handleMouseLeave = (event: MouseEvent) => {
      if (isDesktop && event.clientY <= 0 && !hasShownOffer && !showExitOffer) {
        hasShownOffer = true;
        setShowExitOffer(true);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sessionStorage.setItem("rickExitOfferPending", "true");
      } else if (document.visibilityState === "visible" && sessionStorage.getItem("rickExitOfferPending") === "true") {
        sessionStorage.removeItem("rickExitOfferPending");
        if (!hasShownOffer) {
          hasShownOffer = true;
          setShowExitOffer(true);
        }
      }
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    document.addEventListener("mouseout", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("mouseout", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [noFooter, showExitOffer]);

  const openWhatsApp = () => {
    window.open(whatsappLink(WHATSAPP_MESSAGE), "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ffffff" }}>
      <Header />
      <Outlet />
      {!noFooter && <Footer />}

      {showExitOffer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-offer-title"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0, 0, 0, 0.82)" }}
          onClick={() => setShowExitOffer(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden text-center"
            style={{
              background: "linear-gradient(145deg, #141414 0%, #080808 72%)",
              border: "1px solid #2d2d2d",
              borderRadius: "8px",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.72)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-1.5" style={{ background: "#ccdd8f" }} />
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setShowExitOffer(false)}
              className="absolute right-3 top-5 flex h-9 w-9 items-center justify-center text-xl transition-colors"
              style={{ color: "#838383", borderRadius: "4px" }}
            >
              ×
            </button>

            <div className="px-5 py-8 sm:px-12 sm:py-10">
              <div
                className="mx-auto mb-5 flex h-12 w-12 items-center justify-center text-2xl"
                style={{ background: "#ccdd8f", color: "#101010", borderRadius: "50%" }}
              >
                !
              </div>
              <h2
                id="exit-offer-title"
                className="mb-5 text-2xl font-black sm:text-4xl"
                style={{ fontFamily: "Montserrat, sans-serif", color: "#ffffff" }}
              >
                Ainda não encontrou o carro ideal?
              </h2>
              <div className="mx-auto mb-5 h-px max-w-md" style={{ background: "#2b2b2b" }} />
              <p className="mb-2 text-base leading-relaxed sm:text-lg" style={{ color: "#ccdd8f" }}>
                Comprar um carro sem saber qual opção vale mais a pena pode trazer muita dor de cabeça. 🚙
              </p>
              <p className="mb-7 text-base leading-relaxed sm:text-lg" style={{ color: "#c6c6c6" }}>
                Na Rick Automóveis, você recebe atendimento personalizado para encontrar um carro que combine
                <br className="hidden sm:block" /> com suas necessidades e seu orçamento.
              </p>
              <button
                type="button"
                onClick={openWhatsApp}
                className="w-full px-5 py-4 text-base font-bold transition-transform duration-200 hover:-translate-y-0.5 sm:text-lg"
                style={{
                  background: "#07874c",
                  color: "#ffffff",
                  borderRadius: "6px",
                  boxShadow: "0 12px 28px rgba(7, 135, 76, 0.28)",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                ◯  Falar com o Rick no WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setShowExitOffer(false)}
                className="mt-6 text-sm font-medium transition-colors hover:text-white"
                style={{ color: "#9f9f9f", fontFamily: "Raleway, sans-serif" }}
              >
                Continuar navegando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
