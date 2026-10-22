import { hasAdminSession, jsonResponse, type PagesContext } from "../../_shared";

export async function onRequestGet({ request, env }: PagesContext): Promise<Response> {
  if (!env.SESSION_SECRET) return jsonResponse({ authenticated: false }, 503);
  const authenticated = await hasAdminSession(request, env.SESSION_SECRET);
  return jsonResponse({ authenticated }, authenticated ? 200 : 401, { "Cache-Control": "no-store" });
}
