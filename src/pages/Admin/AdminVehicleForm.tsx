import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { Vehicle, VehicleStatus } from "../../data/vehicles";
import { buildSlug, getVehicleById, getVehicles, nextVehicleId, saveSharedVehicles } from "../../data/vehicleStore";

const MAX_IMAGE_SIZE_MB = 5;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const FUEL_OPTIONS = ["Flex", "Gasolina", "Diesel", "Híbrido", "Elétrico"];
const TRANS_OPTIONS = ["Automático", "Manual", "CVT", "Automatizado"];
const BODY_OPTIONS = ["Hatch", "Sedan", "SUV", "Pickup", "Coupe", "Minivan", "Moto"];
const FEATURE_OPTIONS = [
  "Alarme",
  "Ar-condicionado", "Ar-condicionado bi-zona", "Ar-condicionado digital",
  "Bancos de couro", "Câmbio borboleta", "Câmera 360°", "Câmera de ré",
  "Carregador wireless", "Chave presencial", "Chave reserva",
  "Controle de estabilidade", "Controle de tração",
  "Direção elétrica", "Direção hidráulica",
  "Faróis LED", "Frenagem automática de emergência",
  "Laudo cautelar aprovado", "Manual", "Multimídia",
  "Piloto automático", "Piloto automático adaptativo", "Rodas de liga leve",
  "Sensor de estacionamento", "Som", "Start Stop",
  "Teto panorâmico", "Teto solar", "Travas elétricas", "Vidros elétricos",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-2 tracking-wider" style={{ color: "#838383", fontFamily: "Montserrat, sans-serif" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm outline-none"
      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", borderRadius: "4px" }}
      onFocus={(e) => { e.target.style.borderColor = "#ccdd8f"; }}
      onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
    />
  );
}

function Select({ value, onChange, options, labels }: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm outline-none cursor-pointer appearance-none"
      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", borderRadius: "4px" }}
    >
      {options.map((o) => <option key={o} value={o}>{labels?.[o] || o}</option>)}
    </select>
  );
}

export default function AdminVehicleForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id && id !== "novo";
  const existing = isEditing ? getVehicleById(id) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    brand: existing?.brand || "",
    model: existing?.model || "",
    version: existing?.version || "",
    year: existing?.year?.toString() || "",
    modelYear: existing?.modelYear?.toString() || "",
    mileage: existing?.mileage?.toString() || "",
    price: existing?.price?.toString() || "",
    promotionalPrice: existing?.promotionalPrice?.toString() || "",
    color: existing?.color || "",
    plateFinal: existing?.plateFinal || "",
    engine: existing?.engine || "",
    fuel: existing?.fuel || "Flex",
    transmission: existing?.transmission || "Automático",
    traction: existing?.traction || "FWD",
    bodyType: existing?.bodyType || "Sedan",
    doors: existing?.doors?.toString() || "4",
    seats: existing?.seats?.toString() || "5",
    description: existing?.description || "",
    status: existing?.status || "available",
    featured: existing?.featured || false,
    isNew: existing?.isNew || false,
  });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(existing?.features || []);
  const [images, setImages] = useState<string[]>(existing?.images || []);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [sharedImagesError, setSharedImagesError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSharedImages, setLoadingSharedImages] = useState(!!existing);

  useEffect(() => {
    if (!id || id === "novo") {
      setLoadingSharedImages(false);
      return;
    }
    let active = true;
    setLoadingSharedImages(true);
    setSharedImagesError(null);
    fetch("/api/vehicle-images", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Falha ao buscar as fotos compartilhadas (${response.status}).`);
        return response.json() as Promise<Record<string, string[]>>;
      })
      .then((imagesByVehicleId) => {
        const sharedImages = imagesByVehicleId[id];
        if (active && Array.isArray(sharedImages) && sharedImages.length > 0) setImages(sharedImages);
      })
      .catch((error: unknown) => {
        console.error("Não foi possível carregar a ordem compartilhada das fotos.", error);
        if (active) setSharedImagesError(error instanceof Error ? error.message : "Não foi possível carregar as fotos compartilhadas.");
      })
      .finally(() => {
        if (active) setLoadingSharedImages(false);
      });
    return () => { active = false; };
  }, [id]);

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const toggleFeature = (f: string) => {
    setSelectedFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setImageError(null);
    const files = Array.from(fileList);
    const invalid = files.find((f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > MAX_IMAGE_SIZE_MB * 1024 * 1024);
    if (invalid) {
      setImageError(`Envie apenas imagens de até ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }
    const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
    setImages((prev) => [...prev, ...dataUrls]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length || fromIndex === toIndex) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleImageDrop = (targetIndex: number) => {
    if (draggedImageIndex === null) return;
    moveImage(draggedImageIndex, targetIndex);
    setDraggedImageIndex(null);
  };

  const setAsCover = (index: number) => {
    setImages((prev) => {
      if (index === 0) return prev;
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setImageError("Adicione pelo menos uma foto do veículo.");
      return;
    }
    setSaving(true);
    setImageError(null);

    const vehicle: Vehicle = {
      id: existing?.id || nextVehicleId(),
      brand: form.brand,
      model: form.model,
      version: form.version,
      year: Number(form.year) || 0,
      modelYear: Number(form.modelYear) || 0,
      mileage: Number(form.mileage) || 0,
      price: Number(form.price) || 0,
      promotionalPrice: form.promotionalPrice ? Number(form.promotionalPrice) : undefined,
      color: form.color,
      fuel: form.fuel as Vehicle["fuel"],
      transmission: form.transmission as Vehicle["transmission"],
      engine: form.engine,
      traction: form.traction,
      bodyType: form.bodyType as Vehicle["bodyType"],
      doors: Number(form.doors) || 4,
      seats: Number(form.seats) || 5,
      plateFinal: form.plateFinal,
      description: form.description,
      status: form.status as VehicleStatus,
      featured: form.featured,
      isNew: form.isNew,
      slug: existing?.slug || buildSlug({ brand: form.brand, model: form.model, version: form.version, year: Number(form.year) || 0 }),
      images,
      features: selectedFeatures,
      createdAt: existing?.createdAt || new Date().toISOString().slice(0, 10),
    };

    try {
      const response = await fetch("/api/admin/vehicle-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: vehicle.id, images }),
      });
      const result = await response.json() as { images?: string[]; error?: string };
      if (!response.ok || !Array.isArray(result.images)) {
        throw new Error(result.error || "Não foi possível salvar as fotos compartilhadas.");
      }

      const savedVehicle = { ...vehicle, images: result.images };
      const vehicles = getVehicles();
      const index = vehicles.findIndex((item) => item.id === savedVehicle.id);
      const updatedVehicles = index >= 0
        ? vehicles.map((item) => item.id === savedVehicle.id ? savedVehicle : item)
        : [...vehicles, savedVehicle];
      await saveSharedVehicles(updatedVehicles);
      setSaved(true);
      setTimeout(() => navigate("/admin/veiculos"), 1200);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Não foi possível salvar as fotos compartilhadas.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      {saved && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 text-sm font-semibold" style={{ background: "#1a2a1a", color: "#25D366", border: "1px solid #25D36644", borderRadius: "4px" }}>
          ✓ Veículo salvo com sucesso!
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/admin/veiculos")} className="text-sm" style={{ color: "#555" }}>← Voltar</button>
        <div>
          <h1 className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {isEditing ? "Editar Veículo" : "Adicionar Veículo"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações básicas */}
        <section className="p-6" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
          <h2 className="text-sm font-bold tracking-widest mb-5" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>INFORMAÇÕES BÁSICAS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="MARCA"><Input value={form.brand} onChange={(value) => set("brand", value)} placeholder="Toyota" /></Field>
            <Field label="MODELO"><Input value={form.model} onChange={(value) => set("model", value)} placeholder="Corolla" /></Field>
            <Field label="VERSÃO"><Input value={form.version} onChange={(value) => set("version", value)} placeholder="XEi 2.0" /></Field>
            <Field label="ANO"><Input value={form.year} onChange={(value) => set("year", value)} type="number" placeholder="2023" /></Field>
            <Field label="ANO/MODELO"><Input value={form.modelYear} onChange={(value) => set("modelYear", value)} type="number" placeholder="2023" /></Field>
            <Field label="QUILOMETRAGEM"><Input value={form.mileage} onChange={(value) => set("mileage", value)} type="number" placeholder="0" /></Field>
            <Field label="PREÇO (R$)"><Input value={form.price} onChange={(value) => set("price", value)} type="number" placeholder="100000" /></Field>
            <Field label="PREÇO PROMOCIONAL (R$)"><Input value={form.promotionalPrice} onChange={(value) => set("promotionalPrice", value)} type="number" placeholder="Opcional" /></Field>
            <Field label="COR"><Input value={form.color} onChange={(value) => set("color", value)} placeholder="Branco Pérola" /></Field>
            <Field label="FINAL DA PLACA"><Input value={form.plateFinal} onChange={(value) => set("plateFinal", value)} placeholder="7" /></Field>
          </div>
        </section>

        {/* Mecânica */}
        <section className="p-6" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
          <h2 className="text-sm font-bold tracking-widest mb-5" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>MECÂNICA</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="MOTOR"><Input value={form.engine} onChange={(value) => set("engine", value)} placeholder="2.0 Flex 177cv" /></Field>
            <Field label="TRAÇÃO"><Input value={form.traction} onChange={(value) => set("traction", value)} placeholder="FWD" /></Field>
            <Field label="CÂMBIO"><Select value={form.transmission} onChange={(value) => set("transmission", value)} options={TRANS_OPTIONS} /></Field>
            <Field label="COMBUSTÍVEL"><Select value={form.fuel} onChange={(value) => set("fuel", value)} options={FUEL_OPTIONS} /></Field>
          </div>
        </section>

        {/* Características */}
        <section className="p-6" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
          <h2 className="text-sm font-bold tracking-widest mb-5" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>CARACTERÍSTICAS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="CARROCERIA"><Select value={form.bodyType} onChange={(value) => set("bodyType", value)} options={BODY_OPTIONS} /></Field>
            <Field label="PORTAS"><Select value={form.doors} onChange={(value) => set("doors", value)} options={["2", "3", "4", "5"]} /></Field>
            <Field label="LUGARES"><Select value={form.seats} onChange={(value) => set("seats", value)} options={["2", "4", "5", "6", "7"]} /></Field>
          </div>
        </section>

        {/* Fotos */}
        <section className="p-6" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
          <h2 className="text-sm font-bold tracking-widest mb-5" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>FOTOS DO VEÍCULO</h2>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ""; }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 mb-4 flex flex-col items-center justify-center gap-2 transition-colors"
            style={{ border: "1px dashed #2a2a2a", borderRadius: "4px", color: "#838383" }}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => { e.preventDefault(); handleFilesSelected(e.dataTransfer.files); }}
          >
            <span className="text-2xl">📷</span>
            <span className="text-sm font-semibold" style={{ color: "#ccdd8f" }}>Clique ou arraste as fotos aqui</span>
            <span className="text-xs">PNG ou JPG, até {MAX_IMAGE_SIZE_MB}MB cada</span>
          </button>

          {imageError && (
            <p className="text-xs font-semibold mb-4" style={{ color: "#e30613" }}>{imageError}</p>
          )}
          {sharedImagesError && (
            <p className="text-xs font-semibold mb-4" style={{ color: "#e30613" }}>{sharedImagesError}</p>
          )}

          {images.length > 0 && (
            <>
              <p className="text-xs mb-3" style={{ color: "#838383" }}>Arraste as fotos para reorganizar. A primeira será usada como capa.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div
                  key={`${img}-${i}`}
                  draggable
                  onDragStart={() => setDraggedImageIndex(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleImageDrop(i)}
                  onDragEnd={() => setDraggedImageIndex(null)}
                  className={`relative group cursor-grab active:cursor-grabbing transition-opacity ${draggedImageIndex === i ? "opacity-40" : ""}`}
                  style={{ borderRadius: "4px", overflow: "hidden", border: "1px solid #2a2a2a" }}
                >
                  <img src={img} alt={`Foto ${i + 1}`} className="w-full h-24 object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "#ccdd8f", color: "#000", borderRadius: "2px" }}>CAPA</span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.6)" }}>
                    <button
                      type="button"
                      onClick={() => moveImage(i, i - 1)}
                      disabled={i === 0}
                      className="w-7 h-7 text-sm font-bold disabled:opacity-30"
                      style={{ background: "#1a1a1a", color: "#fff", borderRadius: "2px" }}
                      title="Mover para a esquerda"
                      aria-label="Mover foto para a esquerda"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(i, i + 1)}
                      disabled={i === images.length - 1}
                      className="w-7 h-7 text-sm font-bold disabled:opacity-30"
                      style={{ background: "#1a1a1a", color: "#fff", borderRadius: "2px" }}
                      title="Mover para a direita"
                      aria-label="Mover foto para a direita"
                    >
                      →
                    </button>
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => setAsCover(i)}
                        className="px-2 py-1 text-[10px] font-semibold"
                        style={{ background: "#1a1a1a", color: "#ccdd8f", borderRadius: "2px" }}
                        title="Definir como capa"
                      >
                        Capa
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="px-2 py-1 text-[10px] font-semibold"
                      style={{ background: "#e30613", color: "#fff", borderRadius: "2px" }}
                      title="Remover"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </>
          )}
        </section>

        {/* Descrição */}
        <section className="p-6" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
          <h2 className="text-sm font-bold tracking-widest mb-5" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>DESCRIÇÃO</h2>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            placeholder="Descreva o veículo detalhadamente..."
            className="w-full px-4 py-3 text-sm outline-none resize-none"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", borderRadius: "4px" }}
            onFocus={(e) => { e.target.style.borderColor = "#ccdd8f"; }}
            onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
          />
        </section>

        {/* Opcionais */}
        <section className="p-6" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
          <h2 className="text-sm font-bold tracking-widest mb-5" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>OPCIONAIS</h2>
          <div className="flex flex-wrap gap-2">
            {FEATURE_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFeature(f)}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: selectedFeatures.includes(f) ? "#ccdd8f22" : "#1a1a1a",
                  border: `1px solid ${selectedFeatures.includes(f) ? "#ccdd8f" : "#2a2a2a"}`,
                  color: selectedFeatures.includes(f) ? "#ccdd8f" : "#555",
                  borderRadius: "4px",
                }}
              >
                {selectedFeatures.includes(f) ? "✓ " : ""}{f}
              </button>
            ))}
          </div>
        </section>

        {/* Status e configurações */}
        <section className="p-6" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
          <h2 className="text-sm font-bold tracking-widest mb-5" style={{ color: "#ccdd8f", fontFamily: "Montserrat, sans-serif" }}>CONFIGURAÇÕES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="STATUS">
              <Select
                value={form.status}
                onChange={(value) => set("status", value)}
                options={["available", "reserved", "sold", "inactive"]}
                labels={{ available: "Disponível", reserved: "Reservado", sold: "Vendido", inactive: "Inativo" }}
              />
            </Field>
            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-end">
              {[
                { key: "featured", label: "Veículo em destaque" },
                { key: "isNew", label: "Novo no estoque" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer mt-auto pb-2.5">
                  <div
                    onClick={() => set(key, !(form as unknown as Record<string, boolean>)[key])}
                    className="w-10 h-5 relative transition-colors cursor-pointer"
                    style={{ background: (form as unknown as Record<string, boolean>)[key] ? "#ccdd8f" : "#2a2a2a", borderRadius: "10px" }}
                  >
                    <div className="absolute top-0.5 w-4 h-4 bg-white transition-all" style={{ borderRadius: "50%", left: (form as unknown as Record<string, boolean>)[key] ? "22px" : "2px" }} />
                  </div>
                  <span className="text-sm" style={{ color: "#aaa" }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving || loadingSharedImages || !!sharedImagesError}
            className="px-8 py-3.5 text-sm font-black tracking-wider transition-opacity hover:opacity-90"
            style={{ background: "#ccdd8f", color: "#000", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
          >
            {loadingSharedImages ? "CARREGANDO FOTOS..." : saving ? "SALVANDO..." : isEditing ? "SALVAR ALTERAÇÕES" : "PUBLICAR VEÍCULO"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/veiculos")}
            className="px-6 py-3.5 text-sm font-semibold"
            style={{ border: "1px solid #2a2a2a", color: "#838383", borderRadius: "4px" }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
