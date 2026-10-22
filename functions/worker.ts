import type { Env, PagesContext } from "./_shared";
import { onRequestPost as login } from "./api/admin/login";
import { onRequestPost as logout } from "./api/admin/logout";
import { onRequestGet as session } from "./api/admin/session";
import { onRequestPost as saveVehicleImages } from "./api/admin/vehicle-images";
import { onRequestGet as getImage } from "./api/image";
import { onRequestGet as getVehicleImages } from "./api/vehicle-images";

interface WorkerEnv extends Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

type ApiHandler = (context: PagesContext) => Promise<Response>;

const apiRoutes: Record<string, { method: string; handler: ApiHandler }> = {
  "/api/vehicle-images": { method: "GET", handler: getVehicleImages },
  "/api/image": { method: "GET", handler: getImage },
  "/api/admin/login": { method: "POST", handler: login },
  "/api/admin/session": { method: "GET", handler: session },
  "/api/admin/logout": { method: "POST", handler: logout },
  "/api/admin/vehicle-images": { method: "POST", handler: saveVehicleImages },
};

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const { pathname } = new URL(request.url);
    const route = apiRoutes[pathname];

    if (route) {
      if (request.method !== route.method) {
        return Response.json({ error: "Método não permitido." }, {
          status: 405,
          headers: { Allow: route.method, "Cache-Control": "no-store" },
        });
      }

      return route.handler({ request, env });
    }

    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Rota não encontrada." }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
};
