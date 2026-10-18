import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function steadfastDevPlugin(): Plugin {
  return {
    name: 'steadfast-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/steadfast')) {
          try {
            let bodyText = '';
            if (req.method === 'POST') {
              for await (const chunk of req) {
                bodyText += chunk;
              }
            }

            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const host = req.headers.host || 'localhost:3000';
            const fullUrl = `${protocol}://${host}${req.url}`;

            const webReq = new Request(fullUrl, {
              method: req.method,
              headers: req.headers as any,
              body: req.method === 'POST' ? bodyText : undefined,
            });

            const { handleSteadfastRequest } = await import('./src/server/steadfastHandler');
            const webRes = await handleSteadfastRequest(webReq, {
              STEADFAST_API_KEY: process.env.STEADFAST_API_KEY,
              STEADFAST_SECRET_KEY: process.env.STEADFAST_SECRET_KEY,
              STEADFAST_BASE_URL: process.env.STEADFAST_BASE_URL,
            });

            res.statusCode = webRes.status;
            webRes.headers.forEach((val, key) => {
              res.setHeader(key, val);
            });

            const resText = await webRes.text();
            res.end(resText);
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Dev server error' }));
          }
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), steadfastDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});