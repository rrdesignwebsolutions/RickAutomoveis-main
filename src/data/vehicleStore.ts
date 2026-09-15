import { vehicles as seedVehicles, type Vehicle } from "./vehicles";

const STORAGE_KEY = "rick-automoveis:vehicles";
const STORAGE_VERSION_KEY = "rick-automoveis:catalog-version";
const CATALOG_VERSION = "2026-09-14-verified-catalog-v11";

function readStore(): Vehicle[] {
  if (typeof window === "undefined") return seedVehicles;
  if (window.localStorage.getItem(STORAGE_VERSION_KEY) !== CATALOG_VERSION) {
    writeStore(seedVehicles);
    window.localStorage.setItem(STORAGE_VERSION_KEY, CATALOG_VERSION);
    return seedVehicles;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Vehicle[];
      const seedIds = new Set(seedVehicles.map((seed) => seed.id));
      const catalogVehicles = stored.filter((vehicle) => seedIds.has(vehicle.id));
      const missingFromSeed = seedVehicles.filter((seed) => !catalogVehicles.some((v) => v.id === seed.id));
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
}

export function getVehicles(): Vehicle[] {
  return readStore();
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

export function saveVehicle(vehicle: Vehicle): Vehicle[] {
  const list = readStore();
  const idx = list.findIndex((v) => v.id === vehicle.id);
  const next = idx >= 0 ? list.map((v) => (v.id === vehicle.id ? vehicle : v)) : [...list, vehicle];
  writeStore(next);
  return next;
}

export function deleteVehicle(id: string): Vehicle[] {
  const next = readStore().filter((v) => v.id !== id);
  writeStore(next);
  return next;
}
