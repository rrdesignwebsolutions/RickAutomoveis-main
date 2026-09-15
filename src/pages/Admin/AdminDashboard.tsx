import { Link } from "react-router";
import { formatPrice } from "../../data/vehicles";
import { getVehicles } from "../../data/vehicleStore";

export default function AdminDashboard() {
  const vehicles = getVehicles();
  const total = vehicles.length;
  const available = vehicles.filter((v) => v.status === "available").length;
  const reserved = vehicles.filter((v) => v.status === "reserved").length;
  const sold = vehicles.filter((v) => v.status === "sold").length;
  const stockValue = vehicles.filter((v) => v.status === "available").reduce((acc, v) => acc + (v.promotionalPrice || v.price), 0);
  const recent = [...vehicles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const stats = [
    { label: "Total de veículos", value: total, color: "#ccdd8f", icon: "🚗" },
    { label: "Disponíveis", value: available, color: "#25D366", icon: "✅" },
    { label: "Reservados", value: reserved, color: "#f59e0b", icon: "🔒" },
    { label: "Vendidos", value: sold, color: "#e30613", icon: "✓" },
    { label: "Valor do estoque", value: formatPrice(stockValue), color: "#ccdd8f", icon: "💰", wide: true },
  ];

  const statusLabel: Record<string, string> = {
    available: "Disponível",
    reserved: "Reservado",
    sold: "Vendido",
    inactive: "Inativo",
  };
  const statusColor: Record<string, string> = {
    available: "#25D366",
    reserved: "#f59e0b",
    sold: "#e30613",
    inactive: "#555",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>Dashboard</h1>
          <p className="text-sm" style={{ color: "#838383" }}>Visão geral do estoque</p>
        </div>
        <Link
          to="/admin/veiculos/novo"
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold tracking-wider transition-opacity hover:opacity-90"
          style={{ background: "#ccdd8f", color: "#000", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
        >
          + ADICIONAR VEÍCULO
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.slice(0, 4).map((stat) => (
          <div key={stat.label} className="p-5" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-black mb-1" style={{ fontFamily: "Montserrat, sans-serif", color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: "#838383" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stock value */}
      <div className="p-5 mb-8 flex items-center justify-between" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "#838383", fontFamily: "Montserrat, sans-serif" }}>VALOR TOTAL DO ESTOQUE</p>
          <p className="text-3xl font-black" style={{ fontFamily: "Montserrat, sans-serif", color: "#ccdd8f" }}>{formatPrice(stockValue)}</p>
        </div>
        <span className="text-4xl">💰</span>
      </div>

      {/* Recent vehicles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ fontFamily: "Montserrat, sans-serif" }}>Últimos cadastrados</h2>
          <Link to="/admin/veiculos" className="text-xs font-semibold" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>
            Ver todos →
          </Link>
        </div>

        <div className="overflow-x-auto" style={{ borderRadius: "4px", border: "1px solid #1e1e1e" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#111", borderBottom: "1px solid #1e1e1e" }}>
                {["Veículo", "Ano", "Preço", "Status", "Cadastro"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold tracking-wider" style={{ color: "#555", fontFamily: "Montserrat, sans-serif" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((v) => (
                <tr key={v.id} className="transition-colors" style={{ borderBottom: "1px solid #161616", background: "#0d0d0d" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={v.images[0]} alt="" className="w-10 h-7 object-cover" style={{ borderRadius: "2px" }} />
                      <div>
                        <p className="font-semibold text-xs">{v.brand} {v.model}</p>
                        <p className="text-xs" style={{ color: "#555" }}>{v.version}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#838383" }}>{v.year}</td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: "#ccdd8f" }}>{formatPrice(v.promotionalPrice || v.price)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 font-semibold" style={{ color: statusColor[v.status], background: statusColor[v.status] + "22", borderRadius: "2px" }}>
                      {statusLabel[v.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#555" }}>
                    {new Date(v.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
