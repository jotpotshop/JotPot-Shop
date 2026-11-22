/**
 * Production Cloudflare R2 Storage Worker Handler
 *
 * Security & Architecture Guarantees:
 * - Zero R2 access keys or secrets exposed to frontend or env vars in client bundle.
 * - Uses native Cloudflare R2 binding (`env.R2`) in Cloudflare Workers production.
 * - Every mutating route (`upload`, `delete`, `migrate-legacy`) and private file read
 *   enforces cryptographic Firebase Auth verification + server-side RBAC.
 * - Strict CORS (never Access-Control-Allow-Origin: * on authenticated routes).
 * - Magic-byte + MIME + extension + size + SVG script sanitization validation.
 * - Unique non-overwriting object keys inside allowlisted folder prefixes.
 */

import {
  authenticateAndAuthorizeRequest,
  FirebaseAuthVerifyEnv,
  VerifiedFirebaseUser,
} from './firebaseAuthVerify';

export interface R2ObjectLike {
  key: string;
  size: number;
  etag?: string;
  httpEtag?: string;
  uploaded?: Date;
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
  };
  customMetadata?: Record<string, string>;
}

export interface R2ObjectBodyLike extends R2ObjectLike {
  arrayBuffer(): Promise<ArrayBuffer>;
  body: ReadableStream<Uint8Array> | null;
}

export interface R2PutOptionsLike {
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
  };
  customMetadata?: Record<string, string>;
}

export interface R2ListResultLike {
  objects: R2ObjectLike[];
  truncated: boolean;
  cursor?: string;
}

export interface R2BucketLike {
  put(key: string, value: ArrayBuffer | Uint8Array | string | ReadableStream, options?: R2PutOptionsLike): Promise<R2ObjectLike | null>;
  get(key: string): Promise<R2ObjectBodyLike | null>;
  head(key: string): Promise<R2ObjectLike | null>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<R2ListResultLike>;
}

export interface StorageEnv extends FirebaseAuthVerifyEnv {
  R2?: R2BucketLike;
  R2_PUBLIC_BASE_URL?: string;
  ALLOWED_ORIGINS?: string;
  STORAGE_BACKEND_MODE?: string;
}

export type AllowedStorageFolder =
  | 'products'
  | 'categories'
  | 'branding'
  | 'banners'
  | 'support'
  | 'documents';

const ALLOWED_FOLDERS = new Set<AllowedStorageFolder>([
  'products',
  'categories',
  'branding',
  'banners',
  'support',
  'documents',
]);

const STAFF_ONLY_FOLDERS = new Set<AllowedStorageFolder>([
  'products',
  'categories',
  'branding',
  'banners',
  'documents',
]);

const PRIVATE_FOLDERS = new Set<AllowedStorageFolder>(['documents', 'support']);

const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const DOC_MAX_BYTES = 10 * 1024 * 1024; // 10MB

const MIME_BY_EXT: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  pdf: 'application/pdf',
};

const ALLOWED_EXT_BY_FOLDER: Record<AllowedStorageFolder, Set<string>> = {
  products: new Set(['webp', 'png', 'jpg', 'jpeg', 'gif']),
  categories: new Set(['webp', 'png', 'jpg', 'jpeg', 'gif', 'svg']),
  branding: new Set(['webp', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico']),
  banners: new Set(['webp', 'png', 'jpg', 'jpeg', 'gif']),
  support: new Set(['webp', 'png', 'jpg', 'jpeg', 'gif', 'pdf']),
  documents: new Set(['pdf', 'webp', 'png', 'jpg', 'jpeg']),
};

const DEFAULT_ALLOWED_ORIGINS = [
  'https://jotpotshop.com',
  'https://www.jotpotshop.com',
  'https://assets.jotpotshop.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function isOriginAllowed(origin: string | null, requestUrl: URL, env: StorageEnv): string | null {
  if (!origin) return null;

  // Allow exact same origin
  if (origin === requestUrl.origin) return origin;

  // Check explicit configured origins
  const configured = (
    env.ALLOWED_ORIGINS ||
    (typeof process !== 'undefined' ? process.env?.ALLOWED_ORIGINS : '') ||
    ''
  )
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (DEFAULT_ALLOWED_ORIGINS.includes(origin) || configured.includes(origin)) {
    return origin;
  }

  // Allow Cloudflare Workers / Pages previews & Google AI Studio run.app preview origins over HTTPS
  try {
    const parsed = new URL(origin);
    if (
      parsed.protocol === 'https:' &&
      (parsed.hostname.endsWith('.workers.dev') ||
        parsed.hostname.endsWith('.pages.dev') ||
        parsed.hostname.endsWith('.run.app') ||
        parsed.hostname === 'jotpotshop.com' ||
        parsed.hostname.endsWith('.jotpotshop.com'))
    ) {
      return origin;
    }
    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    ) {
      return origin;
    }
  } catch {
    return null;
  }

  return null;
}

function buildCorsHeaders(
  request: Request,
  env: StorageEnv,
  allowPublicAssetRead = false
): Record<string, string> {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('Origin');
  const validatedOrigin = isOriginAllowed(origin, requestUrl, env);

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Origin',
  };

  if (validatedOrigin) {
    headers['Access-Control-Allow-Origin'] = validatedOrigin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (allowPublicAssetRead && !origin) {
    headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
  }

  if (allowPublicAssetRead) {
    headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
  }

  return headers;
}

function jsonResponse(
  body: Record<string, any>,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function sanitizePrefix(prefix: string): string {
  const cleaned = (prefix || 'asset')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
  return cleaned || 'asset';
}

export function sanitizeObjectKey(rawKey: string): {
  valid: boolean;
  key: string;
  folder?: AllowedStorageFolder;
  reason?: string;
} {
  if (!rawKey || typeof rawKey !== 'string') {
    return { valid: false, key: '', reason: 'Missing object key' };
  }

  let decoded = rawKey;
  try {
    decoded = decodeURIComponent(rawKey);
  } catch {
    return { valid: false, key: '', reason: 'Invalid URL encoding in object key' };
  }

  const normalized = decoded.replace(/^\/+/, '');
  if (
    !normalized ||
    normalized.length > 256 ||
    normalized.includes('..') ||
    normalized.includes('\\') ||
    normalized.includes('\0') ||
    /[\x00-\x1f\x7f]/.test(normalized)
  ) {
    return { valid: false, key: '', reason: 'Unsafe characters or path traversal in key' };
  }

  const segments = normalized.split('/');
  if (segments.length < 2 || segments.length > 3) {
    return { valid: false, key: '', reason: 'Invalid folder depth' };
  }

  const folder = segments[0] as AllowedStorageFolder;
  if (!ALLOWED_FOLDERS.has(folder)) {
    return { valid: false, key: '', reason: 'Storage folder not allowed' };
  }

  // Optional thumbs sub-folder: {folder}/thumbs/{filename}
  if (segments.length === 3 && segments[1] !== 'thumbs') {
    return { valid: false, key: '', reason: 'Nested path not allowed' };
  }

  const filename = segments[segments.length - 1];
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return { valid: false, key: '', reason: 'Invalid filename characters' };
  }

  return { valid: true, key: normalized, folder };
}

function generateShortUuid(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function inferExtFromMimeOrName(fileName: string, mimeType: string): string {
  const extFromName = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase().trim() : '';
  if (extFromName && MIME_BY_EXT[extFromName]) {
    return extFromName;
  }
  const lowerMime = (mimeType || '').toLowerCase().split(';')[0].trim();
  for (const [ext, mime] of Object.entries(MIME_BY_EXT)) {
    if (mime === lowerMime) return ext;
  }
  return '';
}

function verifySvgSafety(bytes: Uint8Array): { safe: boolean; reason?: string } {
  const text = new TextDecoder().decode(bytes);
  const lower = text.toLowerCase();
  if (!lower.includes('<svg')) {
    return { safe: false, reason: 'Invalid SVG root element' };
  }
  const dangerousPatterns = [
    '<script',
    'javascript:',
    'vbscript:',
    'data:text/html',
    'onload=',
    'onerror=',
    'onclick=',
    'onmouseover=',
    'onfocus=',
    '<foreignobject',
    '<iframe',
    '<object',
    '<embed',
  ];
  for (const pat of dangerousPatterns) {
    if (lower.includes(pat)) {
      return { safe: false, reason: `Unsafe SVG content detected (${pat})` };
    }
  }
  return { safe: true };
}

function verifyFileMagicBytes(
  bytes: Uint8Array,
  ext: string
): { valid: boolean; reason?: string } {
  if (bytes.length < 4) {
    return { valid: false, reason: 'File is too small or corrupted' };
  }

  switch (ext) {
    case 'webp': {
      // RIFF....WEBP
      const riff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
      const webp =
        bytes.length >= 12 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50;
      return riff && webp
        ? { valid: true }
        : { valid: false, reason: 'File signature does not match WebP format' };
    }
    case 'png': {
      const ok =
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a;
      return ok ? { valid: true } : { valid: false, reason: 'File signature does not match PNG format' };
    }
    case 'jpg':
    case 'jpeg': {
      const ok = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      return ok ? { valid: true } : { valid: false, reason: 'File signature does not match JPEG format' };
    }
    case 'gif': {
      const ok =
        bytes.length >= 6 &&
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38 &&
        (bytes[4] === 0x37 || bytes[4] === 0x39) &&
        bytes[5] === 0x61;
      return ok ? { valid: true } : { valid: false, reason: 'File signature does not match GIF format' };
    }
    case 'pdf': {
      const ok = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
      return ok ? { valid: true } : { valid: false, reason: 'File signature does not match PDF format' };
    }
    case 'ico': {
      const ok = bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00;
      const isPngIco =
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47;
      return ok || isPngIco
        ? { valid: true }
        : { valid: false, reason: 'File signature does not match ICO format' };
    }
    case 'svg': {
      const check = verifySvgSafety(bytes);
      return { valid: check.safe, reason: check.reason };
    }
    default:
      return { valid: false, reason: 'Unsupported file extension' };
  }
}

function buildPublicAssetUrl(
  objectKey: string,
  requestUrl: URL,
  env: StorageEnv,
  isPrivate: boolean
): string {
  const encodedPath = objectKey
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');

  const customBase = (
    env.R2_PUBLIC_BASE_URL ||
    (typeof process !== 'undefined' ? process.env?.R2_PUBLIC_BASE_URL : '') ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');

  if (!isPrivate && customBase) {
    return `${customBase}/${encodedPath}`;
  }

  return `${requestUrl.origin}/api/storage/file/${encodedPath}`;
}

function isAllowedLegacySourceUrl(sourceUrl: string): boolean {
  if (sourceUrl.startsWith('data:image/')) {
    return /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(sourceUrl);
  }
  try {
    const parsed = new URL(sourceUrl);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    // Strict SSRF allowlist: only official Firebase Storage domains for jotpotshop
    const isFirebaseHost =
      host === 'firebasestorage.googleapis.com' ||
      host.endsWith('.firebasestorage.app') ||
      host === 'storage.googleapis.com';
    if (!isFirebaseHost) return false;
    // Also ensure bucket path refers to jotpotshop to prevent cross-tenant abuse
    const lowerUrl = sourceUrl.toLowerCase();
    return lowerUrl.includes('jotpotshop');
  } catch {
    return false;
  }
}

function canReadPrivateObject(
  user: VerifiedFirebaseUser | null,
  objectKey: string,
  obj: R2ObjectLike
): boolean {
  if (!user) return false;
  if (user.isStaff) return true;
  if (objectKey.startsWith('support/') && obj.customMetadata?.ownerUid === user.uid) {
    return true;
  }
  return false;
}

export async function handleStorageRequest(
  request: Request,
  env: StorageEnv = {}
): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const isPublicFileGet =
    request.method === 'GET' &&
    pathname.startsWith('/api/storage/file/') &&
    !pathname.startsWith('/api/storage/file/documents/') &&
    !pathname.startsWith('/api/storage/file/support/');

  const corsHeaders = buildCorsHeaders(request, env, isPublicFileGet);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // -----------------------------------------------------------
  // 1. GET /api/storage/status (Storage Health & Config Diagnostics)
  // -----------------------------------------------------------
  if (request.method === 'GET' && (pathname === '/api/storage/status' || pathname === '/api/storage/health')) {
    const customBase = (
      env.R2_PUBLIC_BASE_URL ||
      (typeof process !== 'undefined' ? process.env?.R2_PUBLIC_BASE_URL : '') ||
      ''
    ).trim();

    let bucketReachable = false;
    let objectSampleCount: number | undefined;
    if (env.R2) {
      try {
        const listed = await env.R2.list({ limit: 5 });
        bucketReachable = true;
        objectSampleCount = listed.objects.length;
      } catch {
        bucketReachable = false;
      }
    }

    return jsonResponse(
      {
        ok: Boolean(env.R2 && bucketReachable),
        backend: 'cloudflare_r2',
        bucketName: 'jotpotshop',
        bindingType: env.STORAGE_BACKEND_MODE || (env.R2 ? 'cloudflare_r2_native' : 'unconfigured'),
        r2Configured: Boolean(env.R2),
        bucketReachable,
        objectSampleCount,
        publicBaseUrl: customBase || `${url.origin}/api/storage/file`,
        customDomainActive: Boolean(customBase),
        timestamp: new Date().toISOString(),
      },
      200,
      corsHeaders
    );
  }

  // Ensure R2 binding exists before handling object operations
  if (!env.R2) {
    return jsonResponse(
      {
        success: false,
        error: 'Cloudflare R2 bucket binding (env.R2) is not configured.',
        errorBn: 'ক্লাউডফ্লেয়ার R2 বাকেট সংযোগ (R2 binding) কনফিগার করা হয়নি।',
      },
      503,
      corsHeaders
    );
  }

  // -----------------------------------------------------------
  // 2. POST /api/storage/upload (Authenticated Upload to R2)
  // -----------------------------------------------------------
  if (request.method === 'POST' && pathname === '/api/storage/upload') {
    let user: VerifiedFirebaseUser | null = null;
    try {
      user = await authenticateAndAuthorizeRequest(request, env);
    } catch (authErr: any) {
      return jsonResponse(
        {
          success: false,
          error: authErr?.message || 'Invalid Firebase authentication token',
          errorBn: 'নিরাপত্তা যাচাই ব্যর্থ হয়েছে: পুনরায় সাইন-ইন করে চেষ্টা করুন।',
        },
        401,
        corsHeaders
      );
    }

    if (!user) {
      return jsonResponse(
        {
          success: false,
          error: 'Authentication required for R2 upload',
          errorBn: 'ফাইল আপলোড করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।',
        },
        401,
        corsHeaders
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return jsonResponse(
        {
          success: false,
          error: 'Expected multipart/form-data payload',
          errorBn: 'অকার্যকর আপলোড অনুরোধ ফরম্যাট।',
        },
        400,
        corsHeaders
      );
    }

    const folderRaw = String(formData.get('folder') || 'products').trim().toLowerCase();
    if (!ALLOWED_FOLDERS.has(folderRaw as AllowedStorageFolder)) {
      return jsonResponse(
        {
          success: false,
          error: 'Invalid storage folder',
          errorBn: 'অননুমোদিত স্টোরেজ ফোল্ডার।',
        },
        400,
        corsHeaders
      );
    }
    const folder = folderRaw as AllowedStorageFolder;

    // Role Enforcement
    if (STAFF_ONLY_FOLDERS.has(folder) && !user.isStaff) {
      return jsonResponse(
        {
          success: false,
          error: 'Forbidden: Staff or Admin privilege required',
          errorBn: 'অনুমতি নেই: শুধুমাত্র অনুমোদিত এডমিন বা স্টাফ এই ফোল্ডারে ফাইল আপলোড করতে পারবেন।',
        },
        403,
        corsHeaders
      );
    }

    if (folder === 'branding' && !user.isAdmin) {
      return jsonResponse(
        {
          success: false,
          error: 'Forbidden: Admin privilege required for branding assets',
          errorBn: 'অনুমতি নেই: শুধুমাত্র Admin / Super Admin ব্র্যান্ডিং ও লোগো পরিবর্তন করতে পারবেন।',
        },
        403,
        corsHeaders
      );
    }

    const fileEntry = formData.get('file');
    if (!fileEntry || typeof fileEntry === 'string') {
      return jsonResponse(
        {
          success: false,
          error: 'Missing uploaded file field',
          errorBn: 'আপলোডের জন্য কোনো ফাইল পাওয়া যায়নি।',
        },
        400,
        corsHeaders
      );
    }

    const uploadedFile = fileEntry as File;
    const maxBytes = folder === 'documents' ? DOC_MAX_BYTES : IMAGE_MAX_BYTES;
    if (uploadedFile.size <= 0 || uploadedFile.size > maxBytes) {
      return jsonResponse(
        {
          success: false,
          error: `File size must be between 1 byte and ${Math.round(maxBytes / (1024 * 1024))}MB`,
          errorBn: `ফাইলের আকার সর্বোচ্চ ${Math.round(maxBytes / (1024 * 1024))} মেগাবাইট হতে পারবে।`,
        },
        413,
        corsHeaders
      );
    }

    const ext = inferExtFromMimeOrName(uploadedFile.name || 'upload.webp', uploadedFile.type);
    const allowedExts = ALLOWED_EXT_BY_FOLDER[folder];
    if (!ext || !allowedExts.has(ext)) {
      return jsonResponse(
        {
          success: false,
          error: `File extension ".${ext || 'unknown'}" not permitted in ${folder}`,
          errorBn: `এই ফাইল ফরম্যাট (${ext || 'অজানা'}) অনুমোদিত নয়। অনুগ্রহ করে WebP, PNG বা JPG দিন।`,
        },
        400,
        corsHeaders
      );
    }

    const arrayBuffer = await uploadedFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const magicCheck = verifyFileMagicBytes(bytes, ext);
    if (!magicCheck.valid) {
      return jsonResponse(
        {
          success: false,
          error: magicCheck.reason || 'File signature validation failed',
          errorBn: 'নিরাপত্তা যাচাই: ফাইলটি প্রকৃত ছবি বা নথির ফরম্যাটে নেই।',
        },
        400,
        corsHeaders
      );
    }

    const prefix = sanitizePrefix(String(formData.get('prefix') || 'asset'));
    const entityId = sanitizePrefix(String(formData.get('entityId') || 'general'));
    const requestedPrivate =
      String(formData.get('isPrivate') || '').toLowerCase() === 'true' ||
      PRIVATE_FOLDERS.has(folder);

    const timestamp = Date.now();
    const uniqueSuffix = generateShortUuid();
    const fileId = `${folder}_${timestamp}_${uniqueSuffix}`;
    const fileName = `${prefix}_${timestamp}_${uniqueSuffix}.${ext}`;
    const objectKey = `${folder}/${fileName}`;
    const contentType = MIME_BY_EXT[ext] || 'application/octet-stream';
    const createdAt = new Date().toISOString();

    await env.R2.put(objectKey, arrayBuffer, {
      httpMetadata: {
        contentType,
        cacheControl: requestedPrivate
          ? 'private, no-store, max-age=0'
          : 'public, max-age=31536000, immutable',
      },
      customMetadata: {
        fileId,
        folder,
        entityId,
        visibility: requestedPrivate ? 'private' : 'public',
        ownerUid: user.uid,
        uploadedByEmail: user.email || '',
        uploadedByRole: user.role,
        originalName: (uploadedFile.name || fileName).slice(0, 120),
        createdAt,
      },
    });

    // Optional paired thumbnail stored cleanly under {folder}/thumbs/
    let thumbnailKey: string | undefined;
    let thumbnailUrl: string | undefined;
    const thumbEntry = formData.get('thumbnail');
    if (thumbEntry && typeof thumbEntry !== 'string') {
      const thumbFile = thumbEntry as File;
      if (thumbFile.size > 0 && thumbFile.size <= 512 * 1024) {
        const thumbExt = inferExtFromMimeOrName(thumbFile.name || 'thumb.webp', thumbFile.type);
        if (thumbExt === 'webp' || thumbExt === 'jpeg' || thumbExt === 'jpg' || thumbExt === 'png') {
          const thumbBuf = await thumbFile.arrayBuffer();
          const thumbCheck = verifyFileMagicBytes(new Uint8Array(thumbBuf), thumbExt);
          if (thumbCheck.valid) {
            thumbnailKey = `${folder}/thumbs/${prefix}_${timestamp}_${uniqueSuffix}_thumb.${thumbExt}`;
            await env.R2.put(thumbnailKey, thumbBuf, {
              httpMetadata: {
                contentType: MIME_BY_EXT[thumbExt],
                cacheControl: requestedPrivate
                  ? 'private, no-store, max-age=0'
                  : 'public, max-age=31536000, immutable',
              },
              customMetadata: {
                fileId: `${fileId}_thumb`,
                folder,
                entityId,
                visibility: requestedPrivate ? 'private' : 'public',
                ownerUid: user.uid,
                createdAt,
              },
            });
            thumbnailUrl = buildPublicAssetUrl(thumbnailKey, url, env, requestedPrivate);
          }
        }
      }
    }

    const publicUrl = buildPublicAssetUrl(objectKey, url, env, requestedPrivate);

    return jsonResponse(
      {
        success: true,
        fileId,
        objectKey,
        fileName,
        folder,
        entityId,
        contentType,
        fileSize: bytes.byteLength,
        publicUrl,
        thumbnailKey,
        thumbnailUrl,
        visibility: requestedPrivate ? 'private' : 'public',
        storageBackend: 'cloudflare_r2',
        uploadedByUid: user.uid,
        uploadedByEmail: user.email,
        createdAt,
      },
      201,
      corsHeaders
    );
  }

  // -----------------------------------------------------------
  // 3. POST /api/storage/migrate-legacy (SSRF-safe Admin Legacy URL -> R2)
  // -----------------------------------------------------------
  if (request.method === 'POST' && pathname === '/api/storage/migrate-legacy') {
    let user: VerifiedFirebaseUser | null = null;
    try {
      user = await authenticateAndAuthorizeRequest(request, env);
    } catch {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401, corsHeaders);
    }
    if (!user || !user.isAdmin) {
      return jsonResponse(
        {
          success: false,
          error: 'Forbidden: Only Admin / Super Admin can migrate legacy storage assets',
          errorBn: 'অনুমতি নেই: শুধুমাত্র Admin বা Super Admin লিগ্যাসি ছবি R2-তে মাইগ্রেট করতে পারবেন।',
        },
        403,
        corsHeaders
      );
    }

    let body: {
      sourceUrl?: string;
      folder?: AllowedStorageFolder;
      prefix?: string;
      entityId?: string;
    };
    try {
      body = (await request.json()) as any;
    } catch {
      return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400, corsHeaders);
    }

    const sourceUrl = String(body.sourceUrl || '').trim();
    const folder = (body.folder || 'products') as AllowedStorageFolder;
    if (!ALLOWED_FOLDERS.has(folder)) {
      return jsonResponse({ success: false, error: 'Invalid target folder' }, 400, corsHeaders);
    }

    if (!sourceUrl || !isAllowedLegacySourceUrl(sourceUrl)) {
      return jsonResponse(
        {
          success: false,
          error: 'Source URL rejected by legacy migration allowlist',
          errorBn: 'নিরাপত্তা নীতি: শুধুমাত্র অনুমোদিত Firebase Storage বা বৈধ Base64 ইমেজ মাইগ্রেট করা যাবে।',
        },
        400,
        corsHeaders
      );
    }

    let bytes: Uint8Array;
    let contentType = 'image/webp';
    let ext = 'webp';

    if (sourceUrl.startsWith('data:image/')) {
      const m = sourceUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!m) {
        return jsonResponse({ success: false, error: 'Invalid base64 image data URL' }, 400, corsHeaders);
      }
      contentType = m[1].toLowerCase();
      ext = inferExtFromMimeOrName('', contentType) || 'webp';
      const bin = atob(m[2]);
      bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    } else {
      const upstream = await fetch(sourceUrl, { method: 'GET' });
      if (!upstream.ok) {
        return jsonResponse(
          {
            success: false,
            error: `Could not download legacy asset (${upstream.status})`,
            errorBn: `পুরনো ফাইলটি ডাউনলোড করা যায়নি (Status: ${upstream.status})।`,
          },
          502,
          corsHeaders
        );
      }
      contentType = (upstream.headers.get('content-type') || 'image/jpeg').split(';')[0].trim().toLowerCase();
      ext = inferExtFromMimeOrName(sourceUrl.split('?')[0], contentType) || 'jpg';
      const buf = await upstream.arrayBuffer();
      bytes = new Uint8Array(buf);
    }

    if (bytes.byteLength <= 0 || bytes.byteLength > IMAGE_MAX_BYTES) {
      return jsonResponse(
        { success: false, error: 'Migrated asset exceeds 5MB limit or is empty' },
        413,
        corsHeaders
      );
    }

    if (!ALLOWED_EXT_BY_FOLDER[folder].has(ext)) {
      return jsonResponse({ success: false, error: `Disallowed extension: ${ext}` }, 400, corsHeaders);
    }

    const magic = verifyFileMagicBytes(bytes, ext);
    if (!magic.valid) {
      return jsonResponse({ success: false, error: magic.reason || 'Invalid file signature' }, 400, corsHeaders);
    }

    const prefix = sanitizePrefix(body.prefix || 'migrated');
    const entityId = sanitizePrefix(body.entityId || 'legacy');
    const timestamp = Date.now();
    const uniqueSuffix = generateShortUuid();
    const fileId = `${folder}_${timestamp}_${uniqueSuffix}`;
    const fileName = `${prefix}_${timestamp}_${uniqueSuffix}.${ext}`;
    const objectKey = `${folder}/${fileName}`;
    const createdAt = new Date().toISOString();

    await env.R2.put(objectKey, bytes.buffer as ArrayBuffer, {
      httpMetadata: {
        contentType: MIME_BY_EXT[ext] || contentType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
      customMetadata: {
        fileId,
        folder,
        entityId,
        visibility: 'public',
        ownerUid: user.uid,
        uploadedByEmail: user.email || '',
        migratedFrom: sourceUrl.startsWith('data:') ? 'base64_legacy' : 'firebase_storage',
        createdAt,
      },
    });

    return jsonResponse(
      {
        success: true,
        fileId,
        objectKey,
        fileName,
        folder,
        entityId,
        contentType: MIME_BY_EXT[ext] || contentType,
        fileSize: bytes.byteLength,
        publicUrl: buildPublicAssetUrl(objectKey, url, env, false),
        storageBackend: 'cloudflare_r2',
        createdAt,
      },
      201,
      corsHeaders
    );
  }

  // -----------------------------------------------------------
  // 4. GET /api/storage/file/* (Serve Asset from R2 with Access Control)
  // -----------------------------------------------------------
  if (request.method === 'GET' && pathname.startsWith('/api/storage/file/')) {
    const rawKey = pathname.slice('/api/storage/file/'.length);
    const keyCheck = sanitizeObjectKey(rawKey);
    if (!keyCheck.valid || !keyCheck.folder) {
      return jsonResponse(
        { success: false, error: keyCheck.reason || 'Invalid storage key' },
        400,
        corsHeaders
      );
    }

    const obj = await env.R2.get(keyCheck.key);
    if (!obj) {
      return jsonResponse({ success: false, error: 'File not found in R2' }, 404, corsHeaders);
    }

    const isPrivate =
      PRIVATE_FOLDERS.has(keyCheck.folder) || obj.customMetadata?.visibility === 'private';

    if (isPrivate) {
      let user: VerifiedFirebaseUser | null = null;
      try {
        user = await authenticateAndAuthorizeRequest(request, env);
      } catch {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401, corsHeaders);
      }
      if (!user) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401, corsHeaders);
      }
      if (!canReadPrivateObject(user, keyCheck.key, obj)) {
        return jsonResponse({ success: false, error: 'Forbidden' }, 403, corsHeaders);
      }
    }

    const etag = obj.httpEtag || obj.etag;
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (!isPrivate && etag && ifNoneMatch && ifNoneMatch === etag) {
      return new Response(null, { status: 304, headers: corsHeaders });
    }

    const contentType = obj.httpMetadata?.contentType || 'application/octet-stream';
    const headers: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': contentType,
      'Content-Length': String(obj.size),
      'Cache-Control': isPrivate
        ? 'private, no-store, max-age=0'
        : obj.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable',
    };

    if (etag) headers['ETag'] = etag;
    if (contentType === 'image/svg+xml') {
      headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
    }

    const payload = await obj.arrayBuffer();
    return new Response(payload, { status: 200, headers });
  }

  // -----------------------------------------------------------
  // 5. GET /api/storage/metadata/* (Inspect Object Metadata)
  // -----------------------------------------------------------
  if (request.method === 'GET' && pathname.startsWith('/api/storage/metadata/')) {
    const rawKey = pathname.slice('/api/storage/metadata/'.length);
    const keyCheck = sanitizeObjectKey(rawKey);
    if (!keyCheck.valid || !keyCheck.folder) {
      return jsonResponse({ success: false, error: keyCheck.reason || 'Invalid key' }, 400, corsHeaders);
    }

    let user: VerifiedFirebaseUser | null = null;
    try {
      user = await authenticateAndAuthorizeRequest(request, env);
    } catch {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401, corsHeaders);
    }
    if (!user) {
      return jsonResponse({ success: false, error: 'Authentication required' }, 401, corsHeaders);
    }

    const obj = await env.R2.head(keyCheck.key);
    if (!obj) {
      return jsonResponse({ success: false, error: 'Object not found' }, 404, corsHeaders);
    }

    if (!canReadPrivateObject(user, keyCheck.key, obj) && !user.isStaff) {
      return jsonResponse({ success: false, error: 'Forbidden' }, 403, corsHeaders);
    }

    return jsonResponse(
      {
        success: true,
        objectKey: obj.key,
        size: obj.size,
        etag: obj.httpEtag || obj.etag,
        contentType: obj.httpMetadata?.contentType,
        uploaded: obj.uploaded instanceof Date ? obj.uploaded.toISOString() : obj.uploaded,
        customMetadata: obj.customMetadata || {},
      },
      200,
      corsHeaders
    );
  }

  // -----------------------------------------------------------
  // 6. DELETE /api/storage/file/* (Authorized Delete in R2)
  // -----------------------------------------------------------
  if (request.method === 'DELETE' && pathname.startsWith('/api/storage/file/')) {
    const rawKey = pathname.slice('/api/storage/file/'.length);
    const keyCheck = sanitizeObjectKey(rawKey);
    if (!keyCheck.valid || !keyCheck.folder) {
      return jsonResponse({ success: false, error: keyCheck.reason || 'Invalid key' }, 400, corsHeaders);
    }

    let user: VerifiedFirebaseUser | null = null;
    try {
      user = await authenticateAndAuthorizeRequest(request, env);
    } catch {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401, corsHeaders);
    }
    if (!user) {
      return jsonResponse({ success: false, error: 'Authentication required' }, 401, corsHeaders);
    }

    const existing = await env.R2.head(keyCheck.key);
    if (existing) {
      const canDelete =
        user.isStaff ||
        (keyCheck.folder === 'support' && existing.customMetadata?.ownerUid === user.uid);
      if (!canDelete) {
        return jsonResponse({ success: false, error: 'Forbidden' }, 403, corsHeaders);
      }
      if (keyCheck.folder === 'branding' && !user.isAdmin) {
        return jsonResponse({ success: false, error: 'Admin required for branding deletion' }, 403, corsHeaders);
      }
    } else if (!user.isStaff) {
      return jsonResponse({ success: false, error: 'Forbidden' }, 403, corsHeaders);
    }

    await env.R2.delete(keyCheck.key);
    return jsonResponse(
      {
        success: true,
        deletedKey: keyCheck.key,
        storageBackend: 'cloudflare_r2',
      },
      200,
      corsHeaders
    );
  }

  return jsonResponse({ success: false, error: 'Storage route not found' }, 404, corsHeaders);
}
