import { useState } from "react";
import { Link } from "react-router";
import { type VehicleStatus, formatPrice, formatMileage } from "../../data/vehicles";
import { saveSharedVehicles, useVehicles } from "../../data/vehicleStore";

const statusLabel: Record<VehicleStatus, string> = {
  available: "Disponível",
  reserved: "Reservado",
  sold: "Vendido",
  inactive: "Inativo",
};
const statusColor: Record<VehicleStatus, string> = {
  available: "#25D366",
  reserved: "#f59e0b",
  sold: "#e30613",
  inactive: "#555",
};

export default function AdminVehicleList() {
  const list = useVehicles();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; error: boolean } | null>(null);

  const showToast = (message: string, error = false) => {
    setToast({ message, error });
    setTimeout(() => setToast(null), 2500);
  };

  const handleStatusChange = async (id: string, status: VehicleStatus) => {
    const target = list.find((v) => v.id === id);
    if (!target) return;
    try {
      await saveSharedVehicles(list.map((vehicle) => vehicle.id === id ? { ...vehicle, status } : vehicle));
      showToast("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Não foi possível atualizar o status compartilhado do veículo.", error);
      showToast(error instanceof Error ? error.message : "Não foi possível atualizar o estoque compartilhado.", true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await saveSharedVehicles(list.filter((vehicle) => vehicle.id !== id));
      setDeleteId(null);
      showToast("Veículo removido do estoque.");
    } catch (error) {
      console.error("Não foi possível remover o veículo do estoque compartilhado.", error);
      showToast(error instanceof Error ? error.message : "Não foi possível atualizar o estoque compartilhado.", true);
    }
  };

  const filtered = list.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch = !search || v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.version.toLowerCase().includes(q);
    const matchStatus = !statusFilter || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 text-sm font-semibold" style={{ background: toast.error ? "#2a1111" : "#1a2a1a", color: toast.error ? "#fca5a5" : "#25D366", border: `1px solid ${toast.error ? "#fca5a544" : "#25D36644"}`, borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}>
          {toast.error ? "! " : "✓ "}{toast.message}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="p-8 text-center" style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "4px", maxWidth: "360px" }}>
            <p className="text-2xl mb-3">⚠️</p>
            <h3 className="text-base font-black mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>Confirmar exclusão</h3>
            <p className="text-sm mb-6" style={{ color: "#838383" }}>Esta ação removerá o veículo do sistema. Deseja continuar?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm font-semibold" style={{ border: "1px solid #2a2a2a", color: "#fff", borderRadius: "4px" }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 text-sm font-bold" style={{ background: "#e30613", color: "#fff", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>Gerenciar Estoque</h1>
          <p className="text-sm" style={{ color: "#838383" }}>{filtered.length} veículo(s) encontrado(s)</p>
        </div>
        <Link
          to="/admin/veiculos/novo"
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold tracking-wider transition-opacity hover:opacity-90"
          style={{ background: "#ccdd8f", color: "#000", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
        >
          + ADICIONAR VEÍCULO
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Buscar por marca, modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm outline-none"
            style={{ background: "#111", border: "1px solid #1e1e1e", color: "#fff", borderRadius: "4px" }}
          />
        </div>
        <div className="flex gap-2">
          {["", "available", "reserved", "sold", "inactive"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-2.5 text-xs font-semibold transition-all"
              style={{
                background: statusFilter === s ? "#ccdd8f" : "#111",
                color: statusFilter === s ? "#000" : "#838383",
                border: "1px solid " + (statusFilter === s ? "#ccdd8f" : "#1e1e1e"),
                borderRadius: "4px",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              {s === "" ? "Todos" : statusLabel[s as VehicleStatus]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ border: "1px solid #1e1e1e", borderRadius: "4px" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#111", borderBottom: "1px solid #1e1e1e" }}>
              {["Veículo", "Ano", "Km", "Preço", "Status", "Cadastro", "Ações"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold tracking-wider whitespace-nowrap" style={{ color: "#555", fontFamily: "Montserrat, sans-serif" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} style={{ borderBottom: "1px solid #161616", background: "#0d0d0d" }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={v.images[0]} alt="" className="w-12 h-8 object-cover shrink-0" style={{ borderRadius: "2px" }} />
                    <div>
                      <p className="font-semibold text-xs whitespace-nowrap">{v.brand} {v.model}</p>
                      <p className="text-xs" style={{ color: "#555" }}>{v.version}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#838383" }}>{v.year}</td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#838383" }}>{formatMileage(v.mileage)}</td>
                <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: "#ccdd8f" }}>
                  {formatPrice(v.promotionalPrice || v.price)}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={v.status}
                    onChange={(e) => handleStatusChange(v.id, e.target.value as VehicleStatus)}
                    className="text-xs px-2 py-1 outline-none cursor-pointer"
                    style={{
                      background: statusColor[v.status] + "22",
                      color: statusColor[v.status],
                      border: "1px solid " + statusColor[v.status] + "44",
                      borderRadius: "2px",
                    }}
                  >
                    {(Object.keys(statusLabel) as VehicleStatus[]).map((s) => (
                      <option key={s} value={s} style={{ background: "#1a1a1a", color: "#fff" }}>{statusLabel[s]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#555" }}>
                  {new Date(v.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/veiculos/${v.slug}`}
                      target="_blank"
                      className="text-xs px-2.5 py-1 transition-colors hover:text-white"
                      style={{ color: "#555", border: "1px solid #222", borderRadius: "2px" }}
                      title="Visualizar"
                    >
                      👁
                    </Link>
                    <Link
                      to={`/admin/veiculos/${v.id}`}
                      className="text-xs px-2.5 py-1 transition-colors"
                      style={{ color: "#ccdd8f", border: "1px solid #ccdd8f44", borderRadius: "2px" }}
                      title="Editar"
                    >
                      ✎
                    </Link>
                    <button
                      onClick={() => setDeleteId(v.id)}
                      className="text-xs px-2.5 py-1 transition-colors hover:opacity-100 opacity-70"
                      style={{ color: "#e30613", border: "1px solid #e3061344", borderRadius: "2px" }}
                      title="Excluir"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color: "#555" }}>
            <p className="text-3xl mb-2">🚗</p>
            <p className="text-sm">Nenhum veículo encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
