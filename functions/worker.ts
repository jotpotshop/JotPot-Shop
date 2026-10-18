import { handleSteadfastRequest, SteadfastEnv } from '../src/server/steadfastHandler';

export default {
  async fetch(request: Request, env: SteadfastEnv & { ASSETS?: { fetch: (req: Request) => Promise<Response> } }, _ctx: any) {
    const url = new URL(request.url);

    // Route Steadfast server-side API requests
    if (url.pathname.startsWith('/api/steadfast')) {
      return handleSteadfastRequest(request, env);
    }

    // Fall back to Cloudflare Static Assets (dist)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
