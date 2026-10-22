import { vehicles as seedVehicles, type Vehicle } from "./vehicles";
import { useEffect, useState } from "react";

const STORAGE_KEY = "rick-automoveis:vehicles";
const STORAGE_VERSION_KEY = "rick-automoveis:catalog-version";
const DELETED_IDS_KEY = "rick-automoveis:deleted-vehicle-ids";
const SHARED_CATALOG_KEY = "rick-automoveis:shared-catalog";
const CATALOG_VERSION = "2026-09-14-verified-catalog-v11";

function readDeletedIds(): Set<string> {
  const raw = window.localStorage.getItem(DELETED_IDS_KEY);
  if (!raw) return new Set();

  try {
    const ids: unknown = JSON.parse(raw);
    return new Set(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

function readStore(): Vehicle[] {
  if (typeof window === "undefined") return seedVehicles;
  if (window.localStorage.getItem(SHARED_CATALOG_KEY) === "true") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: unknown = JSON.parse(raw);
        if (Array.isArray(stored)) return stored as Vehicle[];
      }
    } catch {
      // corrupted shared cache, fall back to reseeding below
    }
  }
  if (window.localStorage.getItem(STORAGE_VERSION_KEY) !== CATALOG_VERSION) {
    window.localStorage.removeItem(DELETED_IDS_KEY);
    writeStore(seedVehicles);
    window.localStorage.setItem(STORAGE_VERSION_KEY, CATALOG_VERSION);
    return seedVehicles;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Vehicle[];
      const seedIds = new Set(seedVehicles.map((seed) => seed.id));
      const deletedIds = readDeletedIds();
      const catalogVehicles = stored.filter((vehicle) => !seedIds.has(vehicle.id) || !deletedIds.has(vehicle.id));
      const storedIds = new Set(catalogVehicles.map((vehicle) => vehicle.id));
      const missingFromSeed = seedVehicles.filter((seed) => !deletedIds.has(seed.id) && !storedIds.has(seed.id));
      const merged = missingFromSeed.length > 0 ? [...catalogVehicles, ...missingFromSeed] : catalogVehicles;
      if (merged.length !== stored.length || missingFromSeed.length > 0) writeStore(merged);
      return merged;
    }
  } catch {
    // corrupted storage, fall back to reseeding below
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedVehicles));
  window.localStorage.setItem(STORAGE_VERSION_KEY, CATALOG_VERSION);
  return seedVehicles;
}

function writeStore(list: Vehicle[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("rick-vehicles-updated"));
}

function replaceStore(list: Vehicle[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SHARED_CATALOG_KEY, "true");
    window.localStorage.removeItem(DELETED_IDS_KEY);
  }
  writeStore(list);
}

export function getVehicles(): Vehicle[] {
  return readStore();
}

export async function syncSharedVehicles(): Promise<boolean> {
  const response = await fetch("/api/vehicles", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Falha ao carregar o estoque compartilhado (${response.status}).`);
  }

  const result = await response.json() as { vehicles?: Vehicle[] | null };
  if (!Array.isArray(result.vehicles)) return false;

  replaceStore(result.vehicles);
  return true;
}

export async function saveSharedVehicles(vehicles: Vehicle[], initializeOnly = false): Promise<Vehicle[]> {
  const response = await fetch("/api/admin/vehicles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vehicles, initializeOnly }),
  });
  const result = await response.json() as { vehicles?: Vehicle[]; error?: string };
  if (!response.ok || !Array.isArray(result.vehicles)) {
    throw new Error(result.error || "Não foi possível salvar o estoque compartilhado.");
  }

  replaceStore(result.vehicles);
  return result.vehicles;
}

export function useVehicles(): Vehicle[] {
  const [vehicles, setVehicles] = useState(getVehicles);

  useEffect(() => {
    const update = () => setVehicles(getVehicles());
    window.addEventListener("rick-vehicles-updated", update);
    return () => window.removeEventListener("rick-vehicles-updated", update);
  }, []);

  return vehicles;
}

export async function syncSharedVehicleImages(): Promise<void> {
  const response = await fetch("/api/vehicle-images", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Falha ao carregar as fotos compartilhadas (${response.status}).`);
  }

  const imagesByVehicleId = await response.json() as Record<string, string[]>;
  const current = readStore();
  let changed = false;
  const updated = current.map((vehicle) => {
    const images = imagesByVehicleId[vehicle.id];
    if (!Array.isArray(images) || images.length === 0) return vehicle;
    if (images.length === vehicle.images.length && images.every((image, index) => image === vehicle.images[index])) return vehicle;
    changed = true;
    return { ...vehicle, images };
  });

  if (changed) writeStore(updated);
}

export function getVehicleById(id: string): Vehicle | undefined {
  return readStore().find((v) => v.id === id);
}

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return readStore().find((v) => v.slug === slug);
}

export function getAvailableVehicles(): Vehicle[] {
  return readStore().filter((v) => v.status === "available" || v.status === "reserved");
}

export function getFeaturedVehicles(): Vehicle[] {
  return readStore().filter((v) => v.featured && v.status === "available");
}

export function getNewVehicles(): Vehicle[] {
  return readStore().filter((v) => v.isNew && v.status === "available");
}

export function getRelatedVehicles(vehicle: Vehicle, limit = 3): Vehicle[] {
  return readStore()
    .filter((v) => v.id !== vehicle.id && v.status === "available")
    .sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (a.brand === vehicle.brand) scoreA += 3;
      if (b.brand === vehicle.brand) scoreB += 3;
      if (a.bodyType === vehicle.bodyType) scoreA += 2;
      if (b.bodyType === vehicle.bodyType) scoreB += 2;
      if (a.fuel === vehicle.fuel) scoreA += 1;
      if (b.fuel === vehicle.fuel) scoreB += 1;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildSlug(v: Pick<Vehicle, "brand" | "model" | "version" | "year">): string {
  return slugify(`${v.brand}-${v.model}-${v.version}-${v.year}`);
}

export function nextVehicleId(): string {
  const list = readStore();
  const max = list.reduce((acc, v) => Math.max(acc, Number(v.id) || 0), 0);
  return String(max + 1);
}
