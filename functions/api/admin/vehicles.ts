import { hasAdminSession, jsonResponse, type PagesContext } from "../../_shared";
import type { Vehicle } from "../../../src/data/vehicles";

interface SaveVehiclesRequest {
  vehicles?: unknown;
  initializeOnly?: unknown;
}

function isVehicle(value: unknown): value is Vehicle {
  if (!value || typeof value !== "object") return false;
  const vehicle = value as Record<string, unknown>;
  return typeof vehicle.id === "string" && vehicle.id.length > 0 && vehicle.id.length <= 100 &&
    typeof vehicle.brand === "string" &&
    typeof vehicle.model === "string" &&
    typeof vehicle.version === "string" &&
    typeof vehicle.slug === "string" &&
    Array.isArray(vehicle.images) && vehicle.images.every((image) => typeof image === "string") &&
    Array.isArray(vehicle.features) && vehicle.features.every((feature) => typeof feature === "string") &&
    ["available", "reserved", "sold", "inactive"].includes(String(vehicle.status));
}

export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  if (!env.SESSION_SECRET || !(await hasAdminSession(request, env.SESSION_SECRET))) {
    return jsonResponse({ error: "Sessão administrativa inválida ou expirada." }, 401);
  }

  let payload: SaveVehiclesRequest;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Dados do estoque inválidos." }, 400);
  }

  if (
    !Array.isArray(payload.vehicles) ||
    payload.vehicles.length > 500 ||
    !payload.vehicles.every(isVehicle) ||
    typeof payload.initializeOnly !== "boolean"
  ) {
    return jsonResponse({ error: "Lista de veículos inválida." }, 400);
  }

  const vehicles = payload.vehicles as Vehicle[];
  const vehiclesJson = JSON.stringify(vehicles);

  if (payload.initializeOnly) {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO vehicle_catalog (id, vehicles_json, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)",
    ).bind(vehiclesJson).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO vehicle_catalog (id, vehicles_json, updated_at)
       VALUES (1, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         vehicles_json = excluded.vehicles_json,
         updated_at = CURRENT_TIMESTAMP`,
    ).bind(vehiclesJson).run();
  }

  const catalog = await env.DB.prepare("SELECT vehicles_json FROM vehicle_catalog WHERE id = 1")
    .first<{ vehicles_json: string }>();
  if (!catalog) return jsonResponse({ error: "Não foi possível carregar o estoque compartilhado." }, 500);

  return jsonResponse({ vehicles: JSON.parse(catalog.vehicles_json) as Vehicle[] }, 200, { "Cache-Control": "no-store" });
}
