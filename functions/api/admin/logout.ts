import { jsonResponse, type PagesContext } from "../../_shared";

export async function onRequestPost(_context: PagesContext): Promise<Response> {
  return jsonResponse({ authenticated: false }, 200, {
    "Set-Cookie": "rick_admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
    "Cache-Control": "no-store",
  });
}
