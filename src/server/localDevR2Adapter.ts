/**
 * Local Node.js Development R2-Compatible Bucket Adapter
 * Imported ONLY by vite.config.ts dev middleware (NEVER by Cloudflare Worker bundle).
 * Stores local dev uploads in `.r2-local-dev/` so full end-to-end R2 storage API testing works locally.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  R2BucketLike,
  R2ListResultLike,
  R2ObjectBodyLike,
  R2ObjectLike,
  R2PutOptionsLike,
} from './storageHandler';

interface StoredMeta {
  size: number;
  etag: string;
  uploaded: string;
  httpMetadata?: R2PutOptionsLike['httpMetadata'];
  customMetadata?: R2PutOptionsLike['customMetadata'];
}

export function createLocalDevR2Adapter(rootDir: string): R2BucketLike {
  const baseDir = path.resolve(rootDir);

  const resolveSafe = (key: string) => {
    const clean = key.replace(/^\/+/, '');
    const dataPath = path.resolve(baseDir, clean);
    const metaPath = path.resolve(baseDir, `${clean}.meta.json`);
    if (!dataPath.startsWith(baseDir + path.sep) || !metaPath.startsWith(baseDir + path.sep)) {
      throw new Error('Unsafe local R2 path');
    }
    return { dataPath, metaPath, key: clean };
  };

  return {
    async put(key, value, options) {
      const { dataPath, metaPath, key: cleanKey } = resolveSafe(key);
      await fs.mkdir(path.dirname(dataPath), { recursive: true });

      let buffer: Buffer;
      if (typeof value === 'string') {
        buffer = Buffer.from(value, 'utf-8');
      } else if (value instanceof ArrayBuffer) {
        buffer = Buffer.from(value);
      } else if (ArrayBuffer.isView(value)) {
        buffer = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
      } else {
        const chunks: Uint8Array[] = [];
        const reader = value.getReader();
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;
          if (chunk) chunks.push(chunk);
        }
        buffer = Buffer.concat(chunks);
      }

      const meta: StoredMeta = {
        size: buffer.byteLength,
        etag: `"${Date.now().toString(16)}-${buffer.byteLength}"`,
        uploaded: new Date().toISOString(),
        httpMetadata: options?.httpMetadata,
        customMetadata: options?.customMetadata,
      };

      await fs.writeFile(dataPath, buffer);
      await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');

      return {
        key: cleanKey,
        size: meta.size,
        etag: meta.etag,
        httpEtag: meta.etag,
        uploaded: new Date(meta.uploaded),
        httpMetadata: meta.httpMetadata,
        customMetadata: meta.customMetadata,
      };
    },

    async get(key): Promise<R2ObjectBodyLike | null> {
      const { dataPath, metaPath, key: cleanKey } = resolveSafe(key);
      try {
        const [data, metaRaw] = await Promise.all([
          fs.readFile(dataPath),
          fs.readFile(metaPath, 'utf-8').catch(() => '{}'),
        ]);
        const meta = JSON.parse(metaRaw) as Partial<StoredMeta>;
        return {
          key: cleanKey,
          size: data.byteLength,
          etag: meta.etag || `"${data.byteLength}"`,
          httpEtag: meta.etag || `"${data.byteLength}"`,
          uploaded: meta.uploaded ? new Date(meta.uploaded) : new Date(),
          httpMetadata: meta.httpMetadata,
          customMetadata: meta.customMetadata,
          body: null,
          async arrayBuffer() {
            return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          },
        };
      } catch {
        return null;
      }
    },

    async head(key): Promise<R2ObjectLike | null> {
      const { dataPath, metaPath, key: cleanKey } = resolveSafe(key);
      try {
        const [stat, metaRaw] = await Promise.all([
          fs.stat(dataPath),
          fs.readFile(metaPath, 'utf-8').catch(() => '{}'),
        ]);
        const meta = JSON.parse(metaRaw) as Partial<StoredMeta>;
        return {
          key: cleanKey,
          size: stat.size,
          etag: meta.etag || `"${stat.size}"`,
          httpEtag: meta.etag || `"${stat.size}"`,
          uploaded: meta.uploaded ? new Date(meta.uploaded) : stat.mtime,
          httpMetadata: meta.httpMetadata,
          customMetadata: meta.customMetadata,
        };
      } catch {
        return null;
      }
    },

    async delete(keys) {
      const list = Array.isArray(keys) ? keys : [keys];
      for (const k of list) {
        const { dataPath, metaPath } = resolveSafe(k);
        await fs.unlink(dataPath).catch(() => {});
        await fs.unlink(metaPath).catch(() => {});
      }
    },

    async list(options): Promise<R2ListResultLike> {
      const limit = options?.limit ?? 100;
      const prefix = (options?.prefix || '').replace(/^\/+/, '');
      const collected: R2ObjectLike[] = [];

      async function walk(dir: string) {
        if (collected.length >= limit) return;
        const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
        for (const entry of entries) {
          if (collected.length >= limit) break;
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(full);
          } else if (!entry.name.endsWith('.meta.json')) {
            const rel = path.relative(baseDir, full).split(path.sep).join('/');
            if (!prefix || rel.startsWith(prefix)) {
              const stat = await fs.stat(full).catch(() => null);
              if (stat) {
                collected.push({
                  key: rel,
                  size: stat.size,
                  uploaded: stat.mtime,
                });
              }
            }
          }
        }
      }

      await walk(baseDir);
      return { objects: collected, truncated: false };
    },
  };
}
