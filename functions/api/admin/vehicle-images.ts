import { hasAdminSession, jsonResponse, type PagesContext } from "../../_shared";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES_PER_VEHICLE = 30;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

interface SaveImagesRequest {
  vehicleId?: unknown;
  images?: unknown;
}

function base64ToArrayBuffer(value: string): ArrayBuffer {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  if (!env.SESSION_SECRET || !(await hasAdminSession(request, env.SESSION_SECRET))) {
    return jsonResponse({ error: "Sessão administrativa inválida ou expirada." }, 401);
  }

  let payload: SaveImagesRequest;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Dados das fotos inválidos." }, 400);
  }

  if (
    typeof payload.vehicleId !== "string" ||
    !/^[a-zA-Z0-9_-]{1,100}$/.test(payload.vehicleId) ||
    !Array.isArray(payload.images) ||
    payload.images.length < 1 ||
    payload.images.length > MAX_IMAGES_PER_VEHICLE ||
    !payload.images.every((image) => typeof image === "string")
  ) {
    return jsonResponse({ error: "Veículo ou lista de fotos inválidos." }, 400);
  }

  const images: string[] = [];
  for (const image of payload.images as string[]) {
    if (!image.startsWith("data:")) {
      images.push(image);
      continue;
    }

    const match = /^data:(image\/(?:jpeg|png|webp));base64,([a-zA-Z0-9+/]+=*)$/.exec(image);
    if (!match) return jsonResponse({ error: "Formato de imagem inválido. Use JPG, PNG ou WebP." }, 400);

    const contentType = match[1];
    const extension = ALLOWED_TYPES.get(contentType);
    const body = base64ToArrayBuffer(match[2]);
    if (!extension || body.byteLength > MAX_IMAGE_SIZE_BYTES) {
      return jsonResponse({ error: "Cada foto deve ter até 5 MB e estar em JPG, PNG ou WebP." }, 400);
    }

    const key = `vehicles/${payload.vehicleId}/${crypto.randomUUID()}.${extension}`;
    await env.VEHICLE_IMAGES.put(key, body, { httpMetadata: { contentType } });
    images.push(`/api/image?key=${encodeURIComponent(key)}`);
  }

  await env.DB.prepare(
    `INSERT INTO vehicle_images (vehicle_id, images_json, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(vehicle_id) DO UPDATE SET
       images_json = excluded.images_json,
       updated_at = CURRENT_TIMESTAMP`,
  ).bind(payload.vehicleId, JSON.stringify(images)).run();

  return jsonResponse({ images }, 200, { "Cache-Control": "no-store" });
}
