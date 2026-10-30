var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// functions/_shared.ts
var SESSION_COOKIE = "rick_admin_session";
var SESSION_DURATION_SECONDS = 8 * 60 * 60;
function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(bytesToHex, "bytesToHex");
async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToHex(signature);
}
__name(sign, "sign");
async function createSessionCookie(secret) {
  const expiresAt = Math.floor(Date.now() / 1e3) + SESSION_DURATION_SECONDS;
  const value = `${expiresAt}.${await sign(String(expiresAt), secret)}`;
  return `${SESSION_COOKIE}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`;
}
__name(createSessionCookie, "createSessionCookie");
async function hasAdminSession(request, secret) {
  const cookie = request.headers.get("Cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const value = cookie?.slice(SESSION_COOKIE.length + 1);
  if (!value) return false;
  const [expiresAt, signature] = value.split(".");
  const expires = Number(expiresAt);
  if (!Number.isSafeInteger(expires) || expires <= Math.floor(Date.now() / 1e3) || !signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signatureBytes = new Uint8Array(signature.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
  return crypto.subtle.verify("HMAC", key, signatureBytes, new TextEncoder().encode(expiresAt));
}
__name(hasAdminSession, "hasAdminSession");
async function hashText(value) {
  return bytesToHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}
__name(hashText, "hashText");
function jsonResponse(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers });
}
__name(jsonResponse, "jsonResponse");

// functions/api/admin/login.ts
async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return jsonResponse({ error: "Configure ADMIN_PASSWORD e SESSION_SECRET no Cloudflare." }, 503);
  }
  let credentials;
  try {
    credentials = await request.json();
  } catch {
    return jsonResponse({ error: "Dados de acesso inv\xE1lidos." }, 400);
  }
  const expectedEmail = env.ADMIN_EMAIL || "admin@rickautomoveis.com.br";
  if (typeof credentials.email !== "string" || typeof credentials.password !== "string" || await hashText(credentials.email) !== await hashText(expectedEmail) || await hashText(credentials.password) !== await hashText(env.ADMIN_PASSWORD)) {
    return jsonResponse({ error: "E-mail ou senha incorretos." }, 401);
  }
  return jsonResponse({ authenticated: true }, 200, {
    "Set-Cookie": await createSessionCookie(env.SESSION_SECRET),
    "Cache-Control": "no-store"
  });
}
__name(onRequestPost, "onRequestPost");

// functions/api/admin/logout.ts
async function onRequestPost2(_context) {
  return jsonResponse({ authenticated: false }, 200, {
    "Set-Cookie": "rick_admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
    "Cache-Control": "no-store"
  });
}
__name(onRequestPost2, "onRequestPost");

// functions/api/admin/session.ts
async function onRequestGet({ request, env }) {
  if (!env.SESSION_SECRET) return jsonResponse({ authenticated: false }, 503);
  const authenticated = await hasAdminSession(request, env.SESSION_SECRET);
  return jsonResponse({ authenticated }, authenticated ? 200 : 401, { "Cache-Control": "no-store" });
}
__name(onRequestGet, "onRequestGet");

// functions/api/admin/vehicle-images.ts
var MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
var MAX_IMAGES_PER_VEHICLE = 30;
var ALLOWED_TYPES = /* @__PURE__ */ new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);
function base64ToArrayBuffer(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}
__name(base64ToArrayBuffer, "base64ToArrayBuffer");
async function onRequestPost3({ request, env }) {
  if (!env.SESSION_SECRET || !await hasAdminSession(request, env.SESSION_SECRET)) {
    return jsonResponse({ error: "Sess\xE3o administrativa inv\xE1lida ou expirada." }, 401);
  }
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Dados das fotos inv\xE1lidos." }, 400);
  }
  if (typeof payload.vehicleId !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(payload.vehicleId) || !Array.isArray(payload.images) || payload.images.length < 1 || payload.images.length > MAX_IMAGES_PER_VEHICLE || !payload.images.every((image) => typeof image === "string")) {
    return jsonResponse({ error: "Ve\xEDculo ou lista de fotos inv\xE1lidos." }, 400);
  }
  const images = [];
  for (const image of payload.images) {
    if (!image.startsWith("data:")) {
      images.push(image);
      continue;
    }
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([a-zA-Z0-9+/]+=*)$/.exec(image);
    if (!match) return jsonResponse({ error: "Formato de imagem inv\xE1lido. Use JPG, PNG ou WebP." }, 400);
    const contentType = match[1];
    const extension = ALLOWED_TYPES.get(contentType);
    const body = base64ToArrayBuffer(match[2]);
    if (!extension || body.byteLength > MAX_IMAGE_SIZE_BYTES) {
      return jsonResponse({ error: "Cada foto deve ter at\xE9 5 MB e estar em JPG, PNG ou WebP." }, 400);
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
       updated_at = CURRENT_TIMESTAMP`
  ).bind(payload.vehicleId, JSON.stringify(images)).run();
  return jsonResponse({ images }, 200, { "Cache-Control": "no-store" });
}
__name(onRequestPost3, "onRequestPost");

// functions/api/admin/vehicles.ts
function isVehicle(value) {
  if (!value || typeof value !== "object") return false;
  const vehicle = value;
  return typeof vehicle.id === "string" && vehicle.id.length > 0 && vehicle.id.length <= 100 && typeof vehicle.brand === "string" && typeof vehicle.model === "string" && typeof vehicle.version === "string" && typeof vehicle.slug === "string" && Array.isArray(vehicle.images) && vehicle.images.every((image) => typeof image === "string") && Array.isArray(vehicle.features) && vehicle.features.every((feature) => typeof feature === "string") && ["available", "reserved", "sold", "inactive"].includes(String(vehicle.status));
}
__name(isVehicle, "isVehicle");
async function onRequestPost4({ request, env }) {
  if (!env.SESSION_SECRET || !await hasAdminSession(request, env.SESSION_SECRET)) {
    return jsonResponse({ error: "Sess\xE3o administrativa inv\xE1lida ou expirada." }, 401);
  }
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Dados do estoque inv\xE1lidos." }, 400);
  }
  if (!Array.isArray(payload.vehicles) || payload.vehicles.length > 500 || !payload.vehicles.every(isVehicle) || typeof payload.initializeOnly !== "boolean") {
    return jsonResponse({ error: "Lista de ve\xEDculos inv\xE1lida." }, 400);
  }
  const vehicles = payload.vehicles;
  const vehiclesJson = JSON.stringify(vehicles);
  if (payload.initializeOnly) {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO vehicle_catalog (id, vehicles_json, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)"
    ).bind(vehiclesJson).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO vehicle_catalog (id, vehicles_json, updated_at)
       VALUES (1, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         vehicles_json = excluded.vehicles_json,
         updated_at = CURRENT_TIMESTAMP`
    ).bind(vehiclesJson).run();
  }
  const catalog = await env.DB.prepare("SELECT vehicles_json FROM vehicle_catalog WHERE id = 1").first();
  if (!catalog) return jsonResponse({ error: "N\xE3o foi poss\xEDvel carregar o estoque compartilhado." }, 500);
  return jsonResponse({ vehicles: JSON.parse(catalog.vehicles_json) }, 200, { "Cache-Control": "no-store" });
}
__name(onRequestPost4, "onRequestPost");

// functions/api/image.ts
async function onRequestGet2({ request, env }) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key || !key.startsWith("vehicles/")) return jsonResponse({ error: "Imagem n\xE3o encontrada." }, 404);
  const object = await env.VEHICLE_IMAGES.get(key);
  if (!object) return jsonResponse({ error: "Imagem n\xE3o encontrada." }, 404);
  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
__name(onRequestGet2, "onRequestGet");

// functions/api/vehicle-images.ts
async function onRequestGet3({ env }) {
  const { results } = await env.DB.prepare("SELECT vehicle_id, images_json FROM vehicle_images").all();
  const imagesByVehicleId = {};
  for (const row of results) {
    const images = JSON.parse(row.images_json);
    if (Array.isArray(images) && images.every((image) => typeof image === "string")) {
      imagesByVehicleId[row.vehicle_id] = images;
    }
  }
  return jsonResponse(imagesByVehicleId, 200, { "Cache-Control": "no-store" });
}
__name(onRequestGet3, "onRequestGet");

// functions/api/vehicles.ts
async function onRequestGet4({ env }) {
  const catalog = await env.DB.prepare("SELECT vehicles_json FROM vehicle_catalog WHERE id = 1").first();
  const vehicles = catalog ? JSON.parse(catalog.vehicles_json) : null;
  return jsonResponse({ vehicles }, 200, { "Cache-Control": "no-store" });
}
__name(onRequestGet4, "onRequestGet");

// functions/worker.ts
var apiRoutes = {
  "/api/vehicle-images": { method: "GET", handler: onRequestGet3 },
  "/api/vehicles": { method: "GET", handler: onRequestGet4 },
  "/api/image": { method: "GET", handler: onRequestGet2 },
  "/api/admin/login": { method: "POST", handler: onRequestPost },
  "/api/admin/session": { method: "GET", handler: onRequestGet },
  "/api/admin/logout": { method: "POST", handler: onRequestPost2 },
  "/api/admin/vehicle-images": { method: "POST", handler: onRequestPost3 },
  "/api/admin/vehicles": { method: "POST", handler: onRequestPost4 }
};
var worker_default = {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const route = apiRoutes[pathname];
    if (route) {
      if (request.method !== route.method) {
        return Response.json({ error: "M\xE9todo n\xE3o permitido." }, {
          status: 405,
          headers: { Allow: route.method, "Cache-Control": "no-store" }
        });
      }
      return route.handler({ request, env });
    }
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Rota n\xE3o encontrada." }, { status: 404 });
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
