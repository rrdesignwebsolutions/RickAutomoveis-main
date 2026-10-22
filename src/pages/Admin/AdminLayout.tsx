import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router";
import Logo from "../../components/Logo";
import { syncSharedVehicles } from "../../data/vehicleStore";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const validateSessionAndSyncCatalog = async () => {
      try {
        const response = await fetch("/api/admin/session");
        if (!response.ok) {
          navigate("/admin");
          return;
        }

        const hasSharedCatalog = await syncSharedVehicles();
        if (!hasSharedCatalog) {
          throw new Error("O catálogo não foi encontrado no D1 do Cloudflare. O estoque local não foi enviado para evitar substituir os dados da nuvem.");
        }
      } catch (error) {
        console.error("Não foi possível validar a sessão ou sincronizar o estoque.", error);
        if (active) setSessionError(error instanceof Error ? error.message : "Não foi possível sincronizar o estoque compartilhado.");
      } finally {
        if (active) setCheckingSession(false);
      }
    };
    void validateSessionAndSyncCatalog();
    return () => { active = false; };
  }, [navigate]);

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (error) {
      console.error("Não foi possível encerrar a sessão administrativa.", error);
    } finally {
      navigate("/admin");
    }
  };

  const navItems = [
    { label: "Dashboard", to: "/admin/dashboard", icon: "📊" },
    { label: "Veículos", to: "/admin/veiculos", icon: "🚗" },
    { label: "Adicionar", to: "/admin/veiculos/novo", icon: "➕" },
  ];

  const isActive = (to: string) => location.pathname === to;

  return (
    <div className="min-h-screen flex" style={{ background: "#0a0a0a" }}>
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col" style={{ background: "#080808", borderRight: "1px solid #1a1a1a" }}>
        <div className="p-6 border-b" style={{ borderColor: "#1a1a1a" }}>
          <Logo size="sm" linkTo="/" />
          <p className="mt-2 text-xs tracking-widest" style={{ color: "#333", fontFamily: "Montserrat, sans-serif" }}>PAINEL ADMIN</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-150"
              style={{
                background: isActive(item.to) ? "#1a1a1a" : "transparent",
                color: isActive(item.to) ? "#ccdd8f" : "#838383",
                borderRadius: "4px",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "#1a1a1a" }}>
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 text-xs mb-2 transition-colors" style={{ color: "#555", fontFamily: "Montserrat, sans-serif" }}>
            ← Ver site público
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-xs transition-colors text-left hover:text-white"
            style={{ color: "#555", fontFamily: "Montserrat, sans-serif" }}
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {checkingSession ? null : sessionError ? (
          <div className="p-8 text-sm" style={{ color: "#fca5a5" }}>
            Não foi possível carregar o estoque compartilhado: {sessionError}
          </div>
        ) : <Outlet />}
      </main>
    </div>
  );
}
