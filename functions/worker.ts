import { handleSteadfastRequest, SteadfastEnv } from '../src/server/steadfastHandler';
import { handleAiChatRequest, AiChatEnv } from '../src/server/aiChatHandler';

export default {
  async fetch(
    request: Request,
    env: SteadfastEnv & AiChatEnv & { ASSETS?: { fetch: (req: Request) => Promise<Response> } },
    _ctx: any
  ) {
    const url = new URL(request.url);

    // Route AI Chat API requests
    if (url.pathname.startsWith('/api/ai-chat') || url.pathname.startsWith('/api/chat')) {
      return handleAiChatRequest(request, env);
    }

    // Route Steadfast server-side API requests
    if (url.pathname.startsWith('/api/steadfast')) {
      return handleSteadfastRequest(request, env);
    }

    // Fall back to Cloudflare Static Assets (dist)
    if (env.ASSETS) {
      const response = await env.ASSETS.fetch(request);
      // SPA Fallback: If asset not found on a page navigation route (e.g. /bondhame), serve index.html with 200
      if (
        response.status === 404 &&
        request.method === 'GET' &&
        !url.pathname.startsWith('/api') &&
        !url.pathname.includes('.')
      ) {
        const indexUrl = new URL('/', request.url);
        return env.ASSETS.fetch(new Request(indexUrl.toString(), request));
      }
      return response;
    }

    return new Response('Not Found', { status: 404 });
  },
};
