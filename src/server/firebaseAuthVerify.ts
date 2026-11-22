/**
 * Cryptographic Firebase Auth ID Token & Server-Side RBAC Verification
 * Compatible with both Cloudflare Workers runtime and Node 20+ (Web Crypto API only).
 *
 * Security Invariants:
 * - Verifies RS256 signature directly against Google Identity Toolkit JWK endpoint.
 * - Verifies `aud`, `iss`, `sub`, `exp`, and `iat`.
 * - NEVER trusts client-supplied UID or role headers/fields.
 * - Resolves staff role server-side via Firestore `/staff/{uid}` lookup or verified token claims.
 */

export interface FirebaseAuthVerifyEnv {
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_DATABASE_ID?: string;
  [key: string]: any;
}

export interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  signInProvider: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER';
  isStaff: boolean;
  isAdmin: boolean;
}

const DEFAULT_PROJECT_ID = 'jotpotshop';
const DEFAULT_DATABASE_ID = 'ai-studio-jotpotshop-389ae0a3-7bb3-43e0-a886-7d4d77268b7f';
const GOOGLE_JWK_ENDPOINT =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

const STAFF_ALLOWLIST_EMAILS = new Set([
  'mdmahmudulhashan0@gmail.com',
  'jotpotshop.official@gmail.com',
  'admin.nusrat@jotpotshop.com',
  'manager.mahmud@jotpotshop.com',
  'staff.sultana@jotpotshop.com',
]);

const ADMIN_ALLOWLIST_EMAILS = new Set([
  'mdmahmudulhashan0@gmail.com',
  'jotpotshop.official@gmail.com',
  'admin.nusrat@jotpotshop.com',
]);

interface CachedJwkSet {
  keys: Record<string, JsonWebKey>;
  expiresAt: number;
}

let cachedJwks: CachedJwkSet | null = null;

function base64UrlToUint8Array(b64Url: string): Uint8Array {
  const padded = b64Url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64Url.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeBase64UrlJson<T = any>(b64Url: string): T {
  const bytes = base64UrlToUint8Array(b64Url);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text) as T;
}

async function fetchGoogleJwks(forceRefresh = false): Promise<Record<string, JsonWebKey>> {
  const now = Date.now();
  if (!forceRefresh && cachedJwks && cachedJwks.expiresAt > now) {
    return cachedJwks.keys;
  }

  const res = await fetch(GOOGLE_JWK_ENDPOINT, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Google JWKS (${res.status})`);
  }

  const data = (await res.json()) as { keys?: (JsonWebKey & { kid?: string })[] };
  const keyMap: Record<string, JsonWebKey> = {};
  for (const jwk of data.keys || []) {
    if (jwk.kid) {
      keyMap[jwk.kid] = jwk;
    }
  }

  // Respect Cache-Control max-age if provided, default to 1 hour
  let ttlMs = 3600 * 1000;
  const cacheControl = res.headers.get('cache-control') || '';
  const match = cacheControl.match(/max-age=(\d+)/i);
  if (match) {
    const parsedSec = Number(match[1]);
    if (Number.isFinite(parsedSec) && parsedSec > 60) {
      ttlMs = Math.min(parsedSec * 1000, 6 * 3600 * 1000);
    }
  }

  cachedJwks = {
    keys: keyMap,
    expiresAt: now + ttlMs,
  };
  return keyMap;
}

export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+([A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+)$/i);
  return match ? match[1] : null;
}

export async function verifyFirebaseIdToken(
  idToken: string,
  env: FirebaseAuthVerifyEnv = {}
): Promise<{
  uid: string;
  email: string;
  emailVerified: boolean;
  signInProvider: string;
}> {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed Firebase ID token');
  }

  const [headerB64, payloadB64, sigB64] = parts;
  const header = decodeBase64UrlJson<{ alg?: string; kid?: string; typ?: string }>(headerB64);
  const payload = decodeBase64UrlJson<{
    iss?: string;
    aud?: string;
    sub?: string;
    user_id?: string;
    exp?: number;
    iat?: number;
    auth_time?: number;
    email?: string;
    email_verified?: boolean;
    firebase?: { sign_in_provider?: string };
  }>(payloadB64);

  const projectId = (
    env.FIREBASE_PROJECT_ID ||
    (typeof process !== 'undefined' ? process.env?.FIREBASE_PROJECT_ID : '') ||
    DEFAULT_PROJECT_ID
  ).trim();

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported JWT algorithm or missing kid');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= nowSec - 30) {
    throw new Error('Firebase ID token expired');
  }
  if (!payload.iat || payload.iat > nowSec + 120) {
    throw new Error('Firebase ID token issued in the future');
  }
  if (payload.aud !== projectId) {
    throw new Error('Firebase ID token audience mismatch');
  }
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error('Firebase ID token issuer mismatch');
  }

  const uid = payload.sub || payload.user_id || '';
  if (!uid || typeof uid !== 'string' || uid.length > 128) {
    throw new Error('Firebase ID token missing valid subject');
  }

  let jwks = await fetchGoogleJwks(false);
  let jwk = jwks[header.kid];
  if (!jwk) {
    jwks = await fetchGoogleJwks(true);
    jwk = jwks[header.kid];
  }
  if (!jwk) {
    throw new Error('Signing key not found in Google JWKS');
  }

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signatureBytes = base64UrlToUint8Array(sigB64);

  const verified = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    signatureBytes as unknown as BufferSource,
    signingInput as unknown as BufferSource
  );

  if (!verified) {
    throw new Error('Firebase ID token signature verification failed');
  }

  return {
    uid,
    email: String(payload.email || '').toLowerCase().trim(),
    emailVerified: Boolean(payload.email_verified),
    signInProvider: String(payload.firebase?.sign_in_provider || ''),
  };
}

/**
 * Queries Firestore `/staff/{uid}` server-side using the caller's verified Firebase ID token
 * to resolve authoritative RBAC roles without trusting client-sent role fields.
 */
async function lookupStaffRoleInFirestore(
  uid: string,
  idToken: string,
  env: FirebaseAuthVerifyEnv = {}
): Promise<{ isActive: boolean; role?: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' } | null> {
  const projectId = (
    env.FIREBASE_PROJECT_ID ||
    (typeof process !== 'undefined' ? process.env?.FIREBASE_PROJECT_ID : '') ||
    DEFAULT_PROJECT_ID
  ).trim();
  const databaseId = (
    env.FIREBASE_DATABASE_ID ||
    (typeof process !== 'undefined' ? process.env?.FIREBASE_DATABASE_ID : '') ||
    DEFAULT_DATABASE_ID
  ).trim();

  const endpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/${encodeURIComponent(databaseId)}/documents/staff/${encodeURIComponent(uid)}`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${idToken}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) return null;
    const doc = (await res.json()) as {
      fields?: {
        role?: { stringValue?: string };
        isActive?: { booleanValue?: boolean };
      };
    };
    const roleVal = doc?.fields?.role?.stringValue;
    const isActiveVal = doc?.fields?.isActive?.booleanValue;
    if (
      isActiveVal !== false &&
      (roleVal === 'SUPER_ADMIN' ||
        roleVal === 'ADMIN' ||
        roleVal === 'MANAGER' ||
        roleVal === 'STAFF')
    ) {
      return { isActive: true, role: roleVal };
    }
    return { isActive: false };
  } catch {
    return null;
  }
}

export async function authenticateAndAuthorizeRequest(
  request: Request,
  env: FirebaseAuthVerifyEnv = {}
): Promise<VerifiedFirebaseUser | null> {
  const token = extractBearerToken(request);
  if (!token) return null;

  const claims = await verifyFirebaseIdToken(token, env);

  // Reject anonymous users
  if (claims.signInProvider === 'anonymous') {
    throw new Error('Anonymous authentication is not permitted');
  }

  // 1. Authoritative server-side Firestore /staff/{uid} role lookup
  const staffRecord = await lookupStaffRoleInFirestore(claims.uid, token, env);
  if (staffRecord?.isActive && staffRecord.role) {
    return {
      ...claims,
      role: staffRecord.role,
      isStaff: true,
      isAdmin: staffRecord.role === 'SUPER_ADMIN' || staffRecord.role === 'ADMIN',
    };
  }

  // 2. Fallback to verified allowlist matching firestore.rules (cryptographically verified Firebase Auth user)
  if (claims.email && STAFF_ALLOWLIST_EMAILS.has(claims.email)) {
    const isTrustedAuthProvider =
      claims.emailVerified || claims.signInProvider === 'password';
    if (isTrustedAuthProvider) {
      const inferredRole: VerifiedFirebaseUser['role'] =
        claims.email === 'mdmahmudulhashan0@gmail.com' ||
        claims.email === 'jotpotshop.official@gmail.com'
          ? 'SUPER_ADMIN'
          : ADMIN_ALLOWLIST_EMAILS.has(claims.email)
          ? 'ADMIN'
          : claims.email.startsWith('manager.')
          ? 'MANAGER'
          : 'STAFF';

      return {
        ...claims,
        role: inferredRole,
        isStaff: true,
        isAdmin: inferredRole === 'SUPER_ADMIN' || inferredRole === 'ADMIN',
      };
    }
  }

  return {
    ...claims,
    role: 'CUSTOMER',
    isStaff: false,
    isAdmin: false,
  };
}
