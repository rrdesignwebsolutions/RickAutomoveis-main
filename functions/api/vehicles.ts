import { jsonResponse, type PagesContext } from "../_shared";
import type { Vehicle } from "../../src/data/vehicles";

export async function onRequestGet({ env }: PagesContext): Promise<Response> {
  const catalog = await env.DB.prepare("SELECT vehicles_json FROM vehicle_catalog WHERE id = 1")
    .first<{ vehicles_json: string }>();

  const vehicles: Vehicle[] | null = catalog ? JSON.parse(catalog.vehicles_json) as Vehicle[] : null;
  return jsonResponse({ vehicles }, 200, { "Cache-Control": "no-store" });
}
