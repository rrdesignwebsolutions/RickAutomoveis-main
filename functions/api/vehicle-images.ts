import { jsonResponse, type PagesContext } from "../_shared";

export async function onRequestGet({ env }: PagesContext): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT vehicle_id, images_json FROM vehicle_images").all<{
    vehicle_id: string;
    images_json: string;
  }>();

  const imagesByVehicleId: Record<string, string[]> = {};
  for (const row of results) {
    const images: unknown = JSON.parse(row.images_json);
    if (Array.isArray(images) && images.every((image) => typeof image === "string")) {
      imagesByVehicleId[row.vehicle_id] = images;
    }
  }

  return jsonResponse(imagesByVehicleId, 200, { "Cache-Control": "no-store" });
}
