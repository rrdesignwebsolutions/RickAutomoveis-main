import { createSessionCookie, hashText, jsonResponse, type PagesContext } from "../../_shared";

export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return jsonResponse({ error: "Configure ADMIN_PASSWORD e SESSION_SECRET no Cloudflare." }, 503);
  }

  let credentials: { email?: unknown; password?: unknown };
  try {
    credentials = await request.json();
  } catch {
    return jsonResponse({ error: "Dados de acesso inválidos." }, 400);
  }

  const expectedEmail = env.ADMIN_EMAIL || "admin@rickautomoveis.com.br";
  if (
    typeof credentials.email !== "string" ||
    typeof credentials.password !== "string" ||
    await hashText(credentials.email) !== await hashText(expectedEmail) ||
    await hashText(credentials.password) !== await hashText(env.ADMIN_PASSWORD)
  ) {
    return jsonResponse({ error: "E-mail ou senha incorretos." }, 401);
  }

  return jsonResponse({ authenticated: true }, 200, {
    "Set-Cookie": await createSessionCookie(env.SESSION_SECRET),
    "Cache-Control": "no-store",
  });
}
