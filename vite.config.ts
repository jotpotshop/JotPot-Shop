import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiDevPlugin(): Plugin {
  let devR2Adapter: any = null;

  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/storage')) {
          try {
            const chunks: Buffer[] = [];
            if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
              for await (const chunk of req) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              }
            }
            const rawBody = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const host = req.headers.host || 'localhost:3000';
            const fullUrl = `${protocol}://${host}${req.url}`;

            const webReq = new Request(fullUrl, {
              method: req.method,
              headers: req.headers as any,
              body: rawBody ? new Uint8Array(rawBody) : undefined,
            });

            if (!devR2Adapter) {
              const { createLocalDevR2Adapter } = await import('./src/server/localDevR2Adapter.ts');
              devR2Adapter = createLocalDevR2Adapter(path.resolve(import.meta.dirname || '.', '.r2-local-dev'));
            }

            const { handleStorageRequest } = await import('./src/server/storageHandler.ts');
            const webRes = await handleStorageRequest(webReq, {
              R2: devR2Adapter,
              R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
              ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
              FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'jotpotshop',
              FIREBASE_DATABASE_ID:
                process.env.FIREBASE_DATABASE_ID ||
                'ai-studio-jotpotshop-389ae0a3-7bb3-43e0-a886-7d4d77268b7f',
              STORAGE_BACKEND_MODE: 'local_dev_fs_adapter',
            });

            res.statusCode = webRes.status;
            webRes.headers.forEach((val, key) => {
              res.setHeader(key, val);
            });

            if (webRes.status === 204 || webRes.status === 304) {
              res.end();
              return;
            }

            const resBuf = Buffer.from(await webRes.arrayBuffer());
            res.end(resBuf);
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Dev storage server error' }));
          }
        } else if (req.url && (req.url.startsWith('/api/ai-chat') || req.url.startsWith('/api/chat'))) {
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

            const { handleAiChatRequest } = await import('./src/server/aiChatHandler.ts');
            const webRes = await handleAiChatRequest(webReq, {
              GEMINI_API_KEY: process.env.GEMINI_API_KEY,
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
            res.end(JSON.stringify({ error: err?.message || 'Dev server AI Chat error' }));
          }
        } else if (req.url && req.url.startsWith('/api/steadfast')) {
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

            const { handleSteadfastRequest } = await import('./src/server/steadfastHandler.ts');
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
    plugins: [react(), tailwindcss(), apiDevPlugin()],
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