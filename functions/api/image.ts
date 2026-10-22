import { jsonResponse, type PagesContext } from "../_shared";

export async function onRequestGet({ request, env }: PagesContext): Promise<Response> {
  const key = new URL(request.url).searchParams.get("key");
  if (!key || !key.startsWith("vehicles/")) return jsonResponse({ error: "Imagem não encontrada." }, 404);

  const object = await env.VEHICLE_IMAGES.get(key);
  if (!object) return jsonResponse({ error: "Imagem não encontrada." }, 404);

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
