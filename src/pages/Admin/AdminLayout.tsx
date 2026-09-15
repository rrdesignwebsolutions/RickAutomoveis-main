import { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router";
import Logo from "../../components/Logo";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!localStorage.getItem("rick_admin")) {
      navigate("/admin");
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("rick_admin");
    navigate("/admin");
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
        <Outlet />
      </main>
    </div>
  );
}
