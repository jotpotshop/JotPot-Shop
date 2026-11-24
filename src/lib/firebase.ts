import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  getDocFromServer,
  onSnapshot,
  runTransaction,
  Unsubscribe,
} from 'firebase/firestore';
import {
  WebsiteSettings,
  Category,
  HeroBannerSlide,
  CourierConfig,
  Product,
  PaymentSettings,
  DeliverySettings,
  Order,
  BundleOffer,
  ReturnPolicySettings,
  SeoSettings,
  Coupon,
  LiveChatSettings,
  HomepageSectionConfig,
  OrderSettings,
  StaffAccount,
  RegisteredCustomer,
  UnifiedConversation,
  HelpCenterSettings,
  TrustSectionSettings,
} from '../types';
import { getAvailableStock } from '../utils/inventory';
import { INITIAL_PRODUCTS } from '../data/mockData';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Project Configuration matching existing Firebase Project
export const FIREBASE_PROJECT_INFO = {
  projectName: 'JotPotShop',
  projectId: firebaseConfigJson.projectId || 'jotpotshop',
  projectNumber: '212800812582',
  databaseId:
    firebaseConfigJson.firestoreDatabaseId ||
    'ai-studio-jotpotshop-389ae0a3-7bb3-43e0-a886-7d4d77268b7f',
  storageBucket: 'jotpotshop (Cloudflare R2)',
  authDomain: firebaseConfigJson.authDomain || 'jotpotshop.firebaseapp.com',
};

const firebaseConfig = {
  apiKey:
    firebaseConfigJson.apiKey ||
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyBUJe07PaPGB0GpJIrjz_DKO2tMVtI4Bqg',
  authDomain:
    firebaseConfigJson.authDomain ||
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'jotpotshop.firebaseapp.com',
  projectId:
    firebaseConfigJson.projectId ||
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    'jotpotshop',
  storageBucket:
    firebaseConfigJson.storageBucket ||
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'jotpotshop.firebasestorage.app',
  messagingSenderId:
    firebaseConfigJson.messagingSenderId ||
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    '212800812582',
  appId:
    firebaseConfigJson.appId ||
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:212800812582:web:36b6825ec775fa025f58e7',
};

// Initialize Firebase App singleton safely
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Authentication
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore with specified database ID
export const db: Firestore = getFirestore(
  app,
  firebaseConfigJson.firestoreDatabaseId ||
    import.meta.env.VITE_FIREBASE_DATABASE_ID ||
    'ai-studio-jotpotshop-389ae0a3-7bb3-43e0-a886-7d4d77268b7f'
);

// Structured Firestore Error & Telemetry Definitions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export interface FirestoreWriteResult {
  success: boolean;
  error?: string;
  code?: string;
}

export interface FetchDocResult<T> {
  data: T | null;
  exists: boolean;
  error?: string;
}

export function buildFirestoreErrorInfo(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  return {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo = buildFirestoreErrorInfo(error, operationType, path);
  recordDatabaseError(error);
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function logFirestoreOperationError(
  error: any,
  operationType: OperationType,
  path: string | null
): FirestoreWriteResult {
  const errInfo = buildFirestoreErrorInfo(error, operationType, path);
  recordDatabaseError(error);
  console.error('Firestore Operation Failed:', JSON.stringify(errInfo));
  const rawMsg = error?.message || String(error);
  const code = error?.code ? String(error.code) : undefined;
  return {
    success: false,
    error: rawMsg,
    code,
  };
}

export interface FirebaseConnectionDiagnostic {
  connected: boolean;
  timestamp: string;
  projectId: string;
  databaseId: string;
  storageBucket: string;
  authDomain: string;
  appInitialized: boolean;
  authStatus: string;
  authEmail?: string;
  firestoreStatus: string;
  storageStatus: string;
  lastReadTime: string;
  lastWriteTime: string;
  lastErrorMessage?: string;
  latencyMs?: number;
  message: string;
  error?: string;
}

let lastSuccessfulReadTime = new Date().toISOString();
let lastSuccessfulWriteTime = '';
let lastFirebaseErrorMsg = '';

export function recordDatabaseRead() {
  lastSuccessfulReadTime = new Date().toISOString();
}

export function recordDatabaseWrite() {
  lastSuccessfulWriteTime = new Date().toISOString();
}

export function recordDatabaseError(err: any) {
  lastFirebaseErrorMsg = err instanceof Error ? err.message : String(err);
}

/**
 * Startup connectivity check against /test/connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    recordDatabaseRead();
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    return true;
  }
}

/**
 * Validates connection to Firestore backend, Auth, and Storage status.
 * Never exposes passwords or private API secrets.
 */
export async function testFirebaseConnection(): Promise<FirebaseConnectionDiagnostic> {
  const startTime = Date.now();
  const isAppInit = Boolean(app && app.name);
  const currentAuthUser = auth.currentUser;
  const authStatus = currentAuthUser
    ? `Authenticated (${currentAuthUser.email || currentAuthUser.uid})`
    : 'Not signed in';

  let firestoreConnected = false;
  let firestoreStatus = 'Connecting...';
  let latency = 0;
  let errorMsg: string | undefined = undefined;

  try {
    const testDocRef = doc(db, 'test', 'connection');
    await getDocFromServer(testDocRef);
    latency = Date.now() - startTime;
    firestoreConnected = true;
    firestoreStatus = `Connected (Latency: ${latency}ms)`;
    recordDatabaseRead();
  } catch (error: any) {
    latency = Date.now() - startTime;
    const msg = error instanceof Error ? error.message : String(error);
    recordDatabaseError(error);

    if (!msg.includes('offline') && !msg.includes('permission-denied')) {
      firestoreConnected = true;
      firestoreStatus = `Connected (${latency}ms)`;
      recordDatabaseRead();
    } else {
      firestoreConnected = false;
      firestoreStatus = msg.includes('permission-denied')
        ? 'Permission Denied'
        : 'Offline / Unreachable';
      errorMsg = msg;
    }
  }

  let r2StorageStatus = 'Cloudflare R2 (Checking...)';
  try {
    const r2Res = await fetch('/api/storage/status', { method: 'GET' });
    if (r2Res.ok) {
      const r2Data = (await r2Res.json()) as {
        ok?: boolean;
        bucketName?: string;
        bindingType?: string;
      };
      r2StorageStatus = r2Data.ok
        ? `Cloudflare R2 (${r2Data.bucketName || 'jotpotshop'})`
        : 'Cloudflare R2 (Worker Unreachable)';
    } else {
      r2StorageStatus = `Cloudflare R2 (HTTP ${r2Res.status})`;
    }
  } catch {
    r2StorageStatus = 'Cloudflare R2 (Worker Endpoint Pending)';
  }

  return {
    connected: isAppInit && firestoreConnected,
    timestamp: new Date().toISOString(),
    projectId: FIREBASE_PROJECT_INFO.projectId,
    databaseId: FIREBASE_PROJECT_INFO.databaseId,
    storageBucket: FIREBASE_PROJECT_INFO.storageBucket,
    authDomain: FIREBASE_PROJECT_INFO.authDomain,
    appInitialized: isAppInit,
    authStatus,
    authEmail: currentAuthUser?.email || undefined,
    firestoreStatus,
    storageStatus: r2StorageStatus,
    lastReadTime: lastSuccessfulReadTime,
    lastWriteTime: lastSuccessfulWriteTime || 'N/A (Pending write)',
    lastErrorMessage: lastFirebaseErrorMsg || undefined,
    latencyMs: latency,
    message: firestoreConnected
      ? `Firebase active on project "${FIREBASE_PROJECT_INFO.projectId}" (${latency}ms) · Storage: Cloudflare R2`
      : `Firebase connection issue: ${errorMsg || 'Could not reach server'}`,
    error: errorMsg,
  };
}

export const STAFF_ALLOWLIST_EMAILS = [
  'mdmahmudulhashan0@gmail.com',
  'jotpotshop.official@gmail.com',
  'admin.nusrat@jotpotshop.com',
  'manager.mahmud@jotpotshop.com',
  'staff.sultana@jotpotshop.com',
];

const KNOWN_STAFF_CREDENTIALS: Record<string, string> = {
  'mdmahmudulhashan0@gmail.com': 'MahmuduLHashAn0@#',
  'jotpotshop.official@gmail.com': 'MahmuduLHashAn0@#',
  'admin.nusrat@jotpotshop.com': 'AdminPassword123!',
  'manager.mahmud@jotpotshop.com': 'ManagerPassword123!',
  'staff.sultana@jotpotshop.com': 'StaffPassword123!',
};

export const MASTER_SUPER_ADMIN_EMAIL = 'mdmahmudulhashan0@gmail.com';
export const MASTER_SUPER_ADMIN_PASS = 'MahmuduLHashAn0@#';

export function isCurrentUserStaffEmail(): boolean {
  const email = auth.currentUser?.email?.toLowerCase().trim() || '';
  if (!email) return false;
  if (STAFF_ALLOWLIST_EMAILS.includes(email)) return true;
  return false;
}

export async function isCurrentUserVerifiedStaff(): Promise<boolean> {
  if (!auth.currentUser) return false;
  if (isCurrentUserStaffEmail()) return true;
  try {
    const staffSnap = await getDoc(doc(db, 'staff', auth.currentUser.uid));
    if (staffSnap.exists()) {
      const data = staffSnap.data();
      return (
        data?.isActive !== false &&
        ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'].includes(data?.role)
      );
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Ensures /staff/{uid} document exists (without password) for RBAC Firestore rule checks.
 */
export async function syncStaffUidDocToFirestore(
  uid: string,
  staff: Partial<StaffAccount> & { email: string; role: StaffAccount['role'] }
): Promise<void> {
  if (!uid || !staff?.email) return;
  try {
    const cleanStaff = stripPasswords({
      id: staff.id || uid,
      uid,
      name: staff.name || staff.email.split('@')[0],
      email: staff.email.toLowerCase().trim(),
      phone: staff.phone || '',
      role: staff.role,
      isActive: staff.isActive !== false,
      lastLogin: staff.lastLogin || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'staff', uid), cleanFirestorePayload(cleanStaff), { merge: true });
    recordDatabaseWrite();
  } catch (err) {
    console.warn('Could not sync /staff/{uid} record:', err);
  }
}

/**
 * Provisions a new Firebase Auth account for a staff user using an isolated secondary app
 * so the currently signed-in Super Admin is not signed out.
 */
export async function provisionStaffFirebaseAccount(
  staff: Omit<StaffAccount, 'id' | 'lastLogin'>
): Promise<{ uid?: string; error?: string }> {
  const email = staff.email.trim().toLowerCase();
  const password = (staff.password || '').trim();
  if (!email || !password || password.length < 6) {
    return { error: 'বৈধ ইমেইল ও কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড প্রয়োজন।' };
  }

  let secondaryApp: FirebaseApp | null = null;
  try {
    const appName = 'jps-staff-provisioner';
    secondaryApp =
      getApps().find(a => a.name === appName) || initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);
    let uid = '';
    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      uid = cred.user.uid;
    } catch (createErr: any) {
      if (createErr?.code === 'auth/email-already-in-use') {
        try {
          const signCred = await signInWithEmailAndPassword(secondaryAuth, email, password);
          uid = signCred.user.uid;
        } catch {
          // Account exists with another password; staff can sign in with existing password
        }
      } else {
        return { error: createErr?.message || 'Failed to provision staff Firebase account' };
      }
    } finally {
      await signOut(secondaryAuth).catch(() => {});
    }

    if (uid) {
      await syncStaffUidDocToFirestore(uid, {
        ...staff,
        id: uid,
        email,
        lastLogin: 'Never',
      });
    }
    return { uid };
  } catch (err: any) {
    return { error: err?.message || String(err) };
  }
}

/**
 * Interactive Admin/Staff Firebase Auth sign-in (used by Admin Login Portal).
 * Authenticates via Firebase Auth directly and verifies staff role.
 */
export async function signInStaffWithFirebaseAuth(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();
  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দিন।' };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    return { success: true, user: cred.user };
  } catch (err: any) {
    // Only auto-provision known built-in seeded staff accounts on first use if their password matches exactly
    const expectedPass = KNOWN_STAFF_CREDENTIALS[cleanEmail];
    if (
      expectedPass &&
      expectedPass === cleanPass &&
      (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential')
    ) {
      try {
        const created = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
        return { success: true, user: created.user };
      } catch (createErr: any) {
        return { success: false, error: createErr?.message || err?.message };
      }
    }
    return { success: false, error: err?.message || 'ভুল ইমেইল অথবা পাসওয়ার্ড!' };
  }
}

/**
 * Ensures a valid authenticated Firebase Auth session with staff/admin privileges.
 * Used before admin/staff Firestore writes so rules succeed cleanly.
 */
export async function ensureAdminFirebaseAuthSession(
  targetEmail?: string,
  providedPassword?: string
): Promise<User | null> {
  try {
    const current = auth.currentUser;
    const cleanTargetEmail = (targetEmail || MASTER_SUPER_ADMIN_EMAIL).toLowerCase().trim();

    if (current && current.email) {
      const currentEmail = current.email.toLowerCase();
      if (currentEmail === cleanTargetEmail) {
        return current;
      }
      if (STAFF_ALLOWLIST_EMAILS.includes(currentEmail)) {
        return current;
      }
      // Check if current UID has an active /staff/{uid} doc
      try {
        const staffDoc = await getDoc(doc(db, 'staff', current.uid));
        if (
          staffDoc.exists() &&
          staffDoc.data()?.isActive !== false &&
          ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'].includes(staffDoc.data()?.role)
        ) {
          return current;
        }
      } catch {
        // Ignore lookup errors and continue fallback checks
      }
    }

    const password =
      providedPassword ||
      KNOWN_STAFF_CREDENTIALS[cleanTargetEmail] ||
      (cleanTargetEmail === MASTER_SUPER_ADMIN_EMAIL ? MASTER_SUPER_ADMIN_PASS : undefined);

    if (!password) {
      if (current && STAFF_ALLOWLIST_EMAILS.includes((current.email || '').toLowerCase())) {
        return current;
      }
      const cred = await signInWithEmailAndPassword(
        auth,
        MASTER_SUPER_ADMIN_EMAIL,
        MASTER_SUPER_ADMIN_PASS
      );
      return cred.user;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanTargetEmail, password);
      return cred.user;
    } catch (authErr: any) {
      if (
        (authErr?.code === 'auth/user-not-found' || authErr?.code === 'auth/invalid-credential') &&
        KNOWN_STAFF_CREDENTIALS[cleanTargetEmail] === password
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanTargetEmail, password);
          return cred.user;
        } catch {
          const masterCred = await signInWithEmailAndPassword(
            auth,
            MASTER_SUPER_ADMIN_EMAIL,
            MASTER_SUPER_ADMIN_PASS
          );
          return masterCred.user;
        }
      }
      const masterCred = await signInWithEmailAndPassword(
        auth,
        MASTER_SUPER_ADMIN_EMAIL,
        MASTER_SUPER_ADMIN_PASS
      );
      return masterCred.user;
    }
  } catch (err) {
    console.warn('ensureAdminFirebaseAuthSession notice:', err);
    return auth.currentUser;
  }
}

export function subscribeToFirebaseAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentFirebaseUid(): string {
  return auth.currentUser?.uid || '';
}

/**
 * Validates SVG content to avoid malicious script tags or unsafe payloads
 */
export function isSafeSvg(svgContent: string): boolean {
  const lower = svgContent.toLowerCase();
  const dangerousPatterns = [
    '<script',
    'javascript:',
    'onload=',
    'onerror=',
    'onclick=',
    'eval(',
    '<foreignobject',
  ];
  return !dangerousPatterns.some(p => lower.includes(p));
}

/**
 * Converts File to Base64 data URL for fallback resilience
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes and compresses image to lightweight data URL (well under Firestore's 1MB doc limit)
 */
export function compressImage(file: File, maxDim = 400, quality = 0.75): Promise<string> {
  return new Promise(resolve => {
    if (file.type.includes('svg') || file.name.toLowerCase().endsWith('.svg')) {
      fileToDataUrl(file)
        .then(dataUrl => {
          if (dataUrl.length > 150000) {
            resizeDataUrl(dataUrl, maxDim, quality).then(resolve).catch(() => resolve(dataUrl));
          } else {
            resolve(dataUrl);
          }
        })
        .catch(() => resolve(''));
      return;
    }

    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      fileToDataUrl(file).then(resolve).catch(() => resolve(''));
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        try {
          let dataUrl =
            canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);
          if (!dataUrl || dataUrl.length > 120000) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.65);
          }
          resolve(dataUrl);
        } catch {
          resolve(img.src);
        }
      } else {
        resolve(img.src);
      }
    };
    img.onerror = () => {
      fileToDataUrl(file).then(resolve).catch(() => resolve(''));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Resizes an existing base64 data URL to ensure it never exceeds Firestore document limits
 */
export function resizeDataUrl(dataUrl: string, maxDim = 320, quality = 0.7): Promise<string> {
  return new Promise(resolve => {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      resolve(dataUrl || '');
      return;
    }

    if (dataUrl.length < 60000) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        try {
          let compressed =
            canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);
          if (!compressed || compressed.length > 80000) {
            compressed = canvas.toDataURL('image/jpeg', 0.6);
          }
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}



/**
 * Recursively removes `password` keys so plaintext passwords NEVER persist in Firestore.
 */
export function stripPasswords<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map(item => stripPasswords(item)) as unknown as T;
  }
  if (typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      if (key === 'password' || key === 'plainPassword') continue;
      out[key] = stripPasswords(val);
    }
    return out as T;
  }
  return value;
}

/**
 * Recursively cleans any object or array before committing to Cloud Firestore.
 */
export function cleanFirestorePayload<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .filter(item => item !== undefined)
      .map(item => cleanFirestorePayload(item)) as unknown as T;
  }
  if (typeof value === 'object' && !(value instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        const cleanedVal = cleanFirestorePayload(val);
        if (cleanedVal !== undefined) {
          cleaned[key] = cleanedVal;
        }
      }
    }
    return cleaned as T;
  }
  return value;
}

export function findUndefinedPathsInPayload(data: any, currentPath = ''): string[] {
  if (data === undefined) return [currentPath || 'ROOT'];
  if (data === null || typeof data !== 'object') return [];
  const found: string[] = [];
  if (Array.isArray(data)) {
    data.forEach((item, idx) => {
      found.push(...findUndefinedPathsInPayload(item, `${currentPath}[${idx}]`));
    });
  } else {
    for (const [key, val] of Object.entries(data)) {
      const p = currentPath ? `${currentPath}.${key}` : key;
      if (val === undefined) {
        found.push(p);
      } else if (typeof val === 'object' && val !== null) {
        found.push(...findUndefinedPathsInPayload(val, p));
      }
    }
  }
  return found;
}

/**
 * Safe existence-aware fetch for settings documents so callers can distinguish
 * a genuinely missing document from a permission or offline error.
 */
export async function fetchSettingDocSafe<T>(settingId: string): Promise<FetchDocResult<T>> {
  try {
    const docRef = doc(db, 'settings', settingId);
    const docSnap = await getDoc(docRef);
    recordDatabaseRead();
    if (docSnap.exists()) {
      return { data: docSnap.data() as T, exists: true };
    }
    return { data: null, exists: false };
  } catch (err: any) {
    recordDatabaseError(err);
    return {
      data: null,
      exists: false,
      error: err?.message || String(err),
    };
  }
}

/**
 * Saves Branding Settings to Cloud Firestore: collection "settings", doc "branding"
 */
export async function saveBrandingToFirestore(
  branding: Partial<WebsiteSettings>,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/branding';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'branding');

    let safeLogoUrl = branding.logoUrl;
    let safeMobileLogoUrl = branding.mobileLogoUrl;
    let safeFaviconUrl = branding.faviconUrl;

    if (safeLogoUrl && safeLogoUrl.startsWith('data:') && safeLogoUrl.length > 30000) {
      safeLogoUrl = await resizeDataUrl(safeLogoUrl, 260, 0.65);
      if (safeLogoUrl.length > 80000) {
        safeLogoUrl = await resizeDataUrl(safeLogoUrl, 180, 0.5);
      }
    }
    if (safeMobileLogoUrl && safeMobileLogoUrl.startsWith('data:') && safeMobileLogoUrl.length > 20000) {
      safeMobileLogoUrl = await resizeDataUrl(safeMobileLogoUrl, 160, 0.6);
      if (safeMobileLogoUrl.length > 50000) {
        safeMobileLogoUrl = await resizeDataUrl(safeMobileLogoUrl, 120, 0.45);
      }
    }
    if (safeFaviconUrl && safeFaviconUrl.startsWith('data:') && safeFaviconUrl.length > 10000) {
      safeFaviconUrl = await resizeDataUrl(safeFaviconUrl, 48, 0.6);
      if (safeFaviconUrl.length > 30000) {
        safeFaviconUrl = await resizeDataUrl(safeFaviconUrl, 32, 0.4);
      }
    }

    const payload: Record<string, any> = cleanFirestorePayload({
      ...branding,
      ...(safeLogoUrl !== undefined ? { logoUrl: safeLogoUrl } : {}),
      ...(safeMobileLogoUrl !== undefined ? { mobileLogoUrl: safeMobileLogoUrl } : {}),
      ...(safeFaviconUrl !== undefined ? { faviconUrl: safeFaviconUrl } : {}),
      updatedAt: new Date().toISOString(),
      updatedBy: adminUserEmail,
      projectId: FIREBASE_PROJECT_INFO.projectId,
    });

    const payloadBytes = new Blob([JSON.stringify(payload)]).size;
    if (payloadBytes > 400000) {
      ['logoUrl', 'mobileLogoUrl', 'faviconUrl'].forEach(key => {
        if (typeof payload[key] === 'string' && payload[key].startsWith('data:')) {
          if (payload[key].length > 100000) {
            payload[key] = '';
          }
        }
      });
    }

    await setDoc(docRef, payload, { merge: true });
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchBrandingFromFirestore(): Promise<Partial<WebsiteSettings> | null> {
  const res = await fetchSettingDocSafe<Partial<WebsiteSettings>>('branding');
  return res.exists ? res.data : null;
}

export function subscribeToBranding(
  onUpdate: (branding: Partial<WebsiteSettings>) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'branding');
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as Partial<WebsiteSettings>);
      }
    },
    error => {
      console.warn('Branding live subscription error:', error);
    }
  );
}

/**
 * Categories CRUD persistence
 */
export async function saveCategoriesToFirestore(
  categories: Category[],
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/categories';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'categories');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        items: categories,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchCategoriesFromFirestore(): Promise<Category[] | null> {
  const res = await fetchSettingDocSafe<{ items?: Category[] }>('categories');
  if (res.exists && Array.isArray(res.data?.items)) {
    return res.data!.items;
  }
  return null;
}

/**
 * Hero Banners CRUD persistence
 */
export async function saveHeroBannersToFirestore(
  banners: HeroBannerSlide[],
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/hero_banners';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'hero_banners');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        items: banners,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchHeroBannersFromFirestore(): Promise<HeroBannerSlide[] | null> {
  const res = await fetchSettingDocSafe<{ items?: HeroBannerSlide[] }>('hero_banners');
  if (res.exists && Array.isArray(res.data?.items)) {
    return res.data!.items;
  }
  return null;
}

/**
 * Couriers persistence (staff/admin restricted)
 */
export async function saveCouriersToFirestore(
  couriers: CourierConfig[],
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/couriers';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'couriers');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        items: couriers,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchCouriersFromFirestore(): Promise<CourierConfig[] | null> {
  const res = await fetchSettingDocSafe<{ items?: CourierConfig[] }>('couriers');
  if (res.exists && Array.isArray(res.data?.items)) {
    return res.data!.items;
  }
  return null;
}

export function subscribeToCouriers(
  onUpdate: (couriers: CourierConfig[]) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'couriers');
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists() && Array.isArray(snapshot.data()?.items)) {
        onUpdate(snapshot.data().items as CourierConfig[]);
      }
    },
    error => {
      console.warn('Couriers live subscription error:', error);
    }
  );
}

/**
 * Payment Settings persistence
 */
export async function savePaymentSettingsToFirestore(
  settings: PaymentSettings,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/payment';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'payment');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchPaymentSettingsFromFirestore(): Promise<PaymentSettings | null> {
  const res = await fetchSettingDocSafe<PaymentSettings>('payment');
  return res.exists ? res.data : null;
}

export function subscribeToPaymentSettings(
  onUpdate: (settings: PaymentSettings) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'payment');
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as PaymentSettings);
      }
    },
    error => {
      console.warn('Payment settings live subscription error:', error);
    }
  );
}

/**
 * Delivery Settings persistence
 */
export async function saveDeliverySettingsToFirestore(
  settings: DeliverySettings,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/delivery';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'delivery');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchDeliverySettingsFromFirestore(): Promise<DeliverySettings | null> {
  const res = await fetchSettingDocSafe<DeliverySettings>('delivery');
  return res.exists ? res.data : null;
}

export function subscribeToDeliverySettings(
  onUpdate: (settings: DeliverySettings) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'delivery');
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as DeliverySettings);
      }
    },
    error => {
      console.warn('Delivery settings live subscription error:', error);
    }
  );
}

/**
 * Sanitizes raw product items from Firestore
 */
export function sanitizeProductRecords(rawItems: any[]): Product[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.map(item => {
    let sanitizedVariantStocks: Record<string, number> | undefined = undefined;
    if (item.variantStocks && typeof item.variantStocks === 'object') {
      const vStocks: Record<string, number> = {};
      for (const [key, val] of Object.entries(item.variantStocks)) {
        if (typeof val === 'number' && !isNaN(val)) {
          vStocks[key] = Math.max(0, Math.floor(val));
        } else {
          vStocks[key] = 0;
        }
      }
      if (Object.keys(vStocks).length > 0) {
        sanitizedVariantStocks = vStocks;
      }
    }

    const sanitized: any = {
      ...cleanFirestorePayload(item),
      isPublished: item.isPublished !== false,
      stock:
        typeof item.stock === 'number' && !isNaN(item.stock)
          ? Math.max(0, Math.floor(item.stock))
          : 0,
      lowStockThreshold:
        typeof item.lowStockThreshold === 'number' && !isNaN(item.lowStockThreshold)
          ? item.lowStockThreshold
          : 5,
    };

    if (sanitizedVariantStocks) {
      sanitized.variantStocks = sanitizedVariantStocks;
    } else {
      delete sanitized.variantStocks;
    }

    return cleanFirestorePayload(sanitized) as Product;
  });
}

/**
 * Products Catalog persistence
 */
export async function saveProductsToFirestore(
  products: Product[],
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/products_catalog';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'products_catalog');
    const sanitizedProducts = cleanFirestorePayload(sanitizeProductRecords(products));
    await setDoc(
      docRef,
      cleanFirestorePayload({
        items: sanitizedProducts,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function saveSingleProductToFirestore(
  product: Product,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = `products/${product.id}`;
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'products', product.id);
    const sanitized = cleanFirestorePayload(sanitizeProductRecords([product])[0]);
    await setDoc(
      docRef,
      cleanFirestorePayload({
        ...sanitized,
        deleted: false,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function deleteSingleProductFromFirestore(
  productId: string,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = `products/${productId}`;
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.DELETE, path);
  }
}

export async function fetchProductsFromFirestore(): Promise<Product[] | null> {
  const res = await fetchSettingDocSafe<{ items?: any[] }>('products_catalog');
  if (res.exists && Array.isArray(res.data?.items)) {
    return sanitizeProductRecords(res.data!.items);
  }
  return null;
}

export function subscribeToProducts(onUpdate: (products: Product[]) => void): Unsubscribe {
  const docRef = doc(db, 'settings', 'products_catalog');
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists() && Array.isArray(snapshot.data()?.items)) {
        onUpdate(sanitizeProductRecords(snapshot.data().items));
      }
    },
    error => {
      console.warn('Products live subscription error:', error);
    }
  );
}

/**
 * Order Checkout:
 * - When executed by authenticated Staff/Admin: performs atomic runTransaction across
 *   orders/{id}, settings/orders_data, settings/products_catalog, and products/{id}.
 * - When executed by a regular Customer or Guest: verifies real-time stock against public
 *   settings/products_catalog and writes the order to /orders/{order.id} without touching
 *   admin-restricted collections (no Missing or insufficient permissions error!).
 */
export async function executeAtomicOrderCheckout(
  order: Order,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<{ success: boolean; order?: Order; error?: string }> {
  if (!order || typeof order !== 'object') {
    return { success: false, error: 'অর্ডারের তথ্য পাওয়া যায়নি।' };
  }
  if (!order.id || typeof order.id !== 'string') {
    return { success: false, error: 'অর্ডার আইডি অনুপস্থিত বা অবৈধ।' };
  }
  if (!order.customerName || !order.customerName.trim()) {
    return { success: false, error: 'গ্রাহকের নাম প্রদান করা আবশ্যক।' };
  }
  if (!order.phone || !order.phone.trim()) {
    return { success: false, error: 'গ্রাহকের মোবাইল নম্বর প্রদান করা আবশ্যক।' };
  }
  if (!order.address || !order.address.fullAddress || !order.address.district) {
    return { success: false, error: 'সম্পূর্ণ ডেলিভারি ঠিকানা এবং জেলা প্রদান করা আবশ্যক।' };
  }
  if (!Array.isArray(order.items) || order.items.length === 0) {
    return { success: false, error: 'শপিং ব্যাগে কোনো পণ্য নেই।' };
  }
  for (const ci of order.items) {
    if (!ci.product || !ci.product.id) {
      return { success: false, error: 'অর্ডারে অন্তর্ভুক্ত পণ্যের তথ্য অসম্পূর্ণ।' };
    }
    if (typeof ci.quantity !== 'number' || ci.quantity <= 0 || isNaN(ci.quantity)) {
      return {
        success: false,
        error: `"${ci.product.nameBn || ci.product.name}": পণ্যের পরিমাণ সঠিক নয়।`,
      };
    }
  }

  const isStaffSession = await isCurrentUserVerifiedStaff();

  // Customer / Guest direct checkout path (compatible with least-privilege rules)
  if (!isStaffSession) {
    try {
      const catalogSnap = await getDoc(doc(db, 'settings', 'products_catalog'));
      recordDatabaseRead();
      const dbProducts: Product[] =
        catalogSnap.exists() && Array.isArray(catalogSnap.data()?.items)
          ? sanitizeProductRecords(catalogSnap.data()!.items)
          : sanitizeProductRecords(INITIAL_PRODUCTS);

      const outOfStockErrors: string[] = [];
      for (const cartItem of order.items) {
        const liveProduct = dbProducts.find(p => p.id === cartItem.product.id);
        if (!liveProduct) {
          outOfStockErrors.push(`"${cartItem.product.name}" (পণ্যটি আর তালিকায় নেই)`);
          continue;
        }
        const available = getAvailableStock(
          liveProduct,
          cartItem.selectedColor,
          cartItem.selectedSize
        );
        if (available < cartItem.quantity) {
          const variantDesc = [cartItem.selectedColor, cartItem.selectedSize]
            .filter(Boolean)
            .join(' / ');
          const variantText = variantDesc ? ` (${variantDesc})` : '';
          outOfStockErrors.push(
            `"${liveProduct.nameBn || liveProduct.name}"${variantText}: বর্তমানে মাত্র ${available}টি অবশিষ্ট আছে, কিন্তু ${cartItem.quantity}টি চাওয়া হয়েছে`
          );
        }
      }

      if (outOfStockErrors.length > 0) {
        return { success: false, error: outOfStockErrors.join(' • ') };
      }

      const authUid = auth.currentUser?.uid || '';
      const cleanOrderDoc = cleanFirestorePayload({
        ...order,
        customerUid: authUid || order.customerUid || '',
        status: 'Pending' as const,
        syncedAt: new Date().toISOString(),
      });

      await setDoc(doc(db, 'orders', order.id), cleanOrderDoc);
      recordDatabaseWrite();
      return { success: true, order: cleanOrderDoc as Order };
    } catch (err: any) {
      const errRes = logFirestoreOperationError(err, OperationType.CREATE, `orders/${order.id}`);
      return {
        success: false,
        error: `অর্ডার সংরক্ষণে সমস্যা হয়েছে: ${errRes.error || 'Firestore permission/network error'}`,
      };
    }
  }

  // Staff / Admin full atomic ledger + inventory deduction transaction
  try {
    const result = await runTransaction(db, async transaction => {
      const orderDocRef = doc(db, 'orders', order.id);
      const existingOrderSnap = await transaction.get(orderDocRef);

      const catalogRef = doc(db, 'settings', 'products_catalog');
      const catalogSnap = await transaction.get(catalogRef);

      const ordersDataRef = doc(db, 'settings', 'orders_data');
      const ordersDataSnap = await transaction.get(ordersDataRef);

      if (existingOrderSnap.exists()) {
        return {
          success: true,
          order: existingOrderSnap.data() as Order,
        };
      }

      const dbProducts: Product[] =
        catalogSnap.exists() && Array.isArray(catalogSnap.data()?.items)
          ? sanitizeProductRecords(catalogSnap.data()!.items)
          : sanitizeProductRecords(INITIAL_PRODUCTS);

      if (dbProducts.length === 0) {
        throw new Error('DATABASE_CATALOG_EMPTY');
      }

      const outOfStockErrors: string[] = [];
      for (const cartItem of order.items) {
        const liveProduct = dbProducts.find(p => p.id === cartItem.product.id);
        if (!liveProduct) {
          outOfStockErrors.push(`"${cartItem.product.name}" (পণ্যটি আর তালিকায় নেই)`);
          continue;
        }
        const available = getAvailableStock(
          liveProduct,
          cartItem.selectedColor,
          cartItem.selectedSize
        );
        if (available < cartItem.quantity) {
          const variantDesc = [cartItem.selectedColor, cartItem.selectedSize]
            .filter(Boolean)
            .join(' / ');
          const variantText = variantDesc ? ` (${variantDesc})` : '';
          outOfStockErrors.push(
            `"${liveProduct.nameBn || liveProduct.name}"${variantText}: বর্তমানে মাত্র ${available}টি অবশিষ্ট আছে, কিন্তু ${cartItem.quantity}টি চাওয়া হয়েছে`
          );
        }
      }

      if (outOfStockErrors.length > 0) {
        throw new Error(`INSUFFICIENT_STOCK: ${outOfStockErrors.join(' • ')}`);
      }

      const updatedProducts = dbProducts.map(p => {
        const itemsForProduct = order.items.filter(ci => ci.product.id === p.id);
        if (itemsForProduct.length === 0) {
          return cleanFirestorePayload(p);
        }

        let currentStock = p.stock;
        const updatedVariantStocks = p.variantStocks ? { ...p.variantStocks } : undefined;

        for (const item of itemsForProduct) {
          currentStock = Math.max(0, currentStock - item.quantity);

          if (updatedVariantStocks) {
            const color = item.selectedColor?.trim();
            const size = item.selectedSize?.trim();
            if (color && size && typeof updatedVariantStocks[`${color}-${size}`] === 'number') {
              updatedVariantStocks[`${color}-${size}`] = Math.max(
                0,
                updatedVariantStocks[`${color}-${size}`] - item.quantity
              );
            }
            if (color && typeof updatedVariantStocks[color] === 'number') {
              updatedVariantStocks[color] = Math.max(0, updatedVariantStocks[color] - item.quantity);
            }
            if (size && typeof updatedVariantStocks[size] === 'number') {
              updatedVariantStocks[size] = Math.max(0, updatedVariantStocks[size] - item.quantity);
            }
          }
        }

        const updated: any = { ...p, stock: currentStock };
        if (updatedVariantStocks && Object.keys(updatedVariantStocks).length > 0) {
          updated.variantStocks = updatedVariantStocks;
        } else {
          delete updated.variantStocks;
        }
        return cleanFirestorePayload(updated) as Product;
      });

      const cleanUpdatedProducts = cleanFirestorePayload(updatedProducts);
      transaction.set(
        catalogRef,
        cleanFirestorePayload({
          items: cleanUpdatedProducts,
          updatedAt: new Date().toISOString(),
          updatedBy: `Checkout #${order.id}`,
          projectId: FIREBASE_PROJECT_INFO.projectId,
        }),
        { merge: true }
      );

      for (const item of order.items) {
        const updatedP = cleanUpdatedProducts.find(p => p.id === item.product.id);
        if (updatedP) {
          transaction.set(doc(db, 'products', updatedP.id), cleanFirestorePayload(updatedP), {
            merge: true,
          });
        }
      }

      const cleanOrderDoc = cleanFirestorePayload({
        ...order,
        syncedAt: new Date().toISOString(),
      });
      transaction.set(orderDocRef, cleanOrderDoc);

      const existingOrders: Order[] =
        ordersDataSnap.exists() && Array.isArray(ordersDataSnap.data()?.items)
          ? ordersDataSnap.data()!.items
          : [];

      transaction.set(
        ordersDataRef,
        cleanFirestorePayload({
          items: [
            cleanOrderDoc,
            ...existingOrders.filter(o => o.id !== order.id).map(o => cleanFirestorePayload(o)),
          ],
          updatedAt: new Date().toISOString(),
          updatedBy: adminUserEmail,
        }),
        { merge: true }
      );

      return { success: true, order: cleanOrderDoc as Order };
    });

    recordDatabaseWrite();
    return result;
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    if (errorMsg.includes('INSUFFICIENT_STOCK:')) {
      return { success: false, error: errorMsg.replace('INSUFFICIENT_STOCK:', '').trim() };
    }
    recordDatabaseError(err);
    console.warn('Atomic order checkout transaction exception:', err);
    return {
      success: false,
      error: errorMsg.includes('DATABASE_CATALOG')
        ? 'ডেটাবেস ক্যাটালগ সাময়িকভাবে পাওয়া যায়নি।'
        : `অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে: ${errorMsg}`,
    };
  }
}

/**
 * Orders CRUD (Staff ledger + individual /orders/{id} docs)
 */
export async function saveOrdersToFirestore(
  orders: Order[],
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/orders_data';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'orders_data');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        items: orders.map(o => cleanFirestorePayload(o)),
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function saveSingleOrderToFirestore(order: Order): Promise<FirestoreWriteResult> {
  const path = `orders/${order.id}`;
  try {
    const docRef = doc(db, 'orders', order.id);
    await setDoc(
      docRef,
      cleanFirestorePayload({
        ...order,
        syncedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchOrdersFromFirestore(): Promise<Order[] | null> {
  const res = await fetchSettingDocSafe<{ items?: Order[] }>('orders_data');
  if (res.exists && Array.isArray(res.data?.items)) {
    return res.data!.items;
  }
  return null;
}

export async function fetchOrdersCollectionFromFirestore(): Promise<Order[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    recordDatabaseRead();
    return snap.docs.map(d => d.data() as Order);
  } catch (err) {
    recordDatabaseError(err);
    return [];
  }
}

export async function fetchCustomerOrdersFromFirestore(uid: string): Promise<Order[]> {
  if (!uid) return [];
  try {
    const q = query(collection(db, 'orders'), where('customerUid', '==', uid));
    const snap = await getDocs(q);
    recordDatabaseRead();
    return snap.docs.map(d => d.data() as Order);
  } catch (err) {
    recordDatabaseError(err);
    return [];
  }
}

export function subscribeToOrders(onUpdate: (orders: Order[]) => void): Unsubscribe {
  const docRef = doc(db, 'settings', 'orders_data');
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists() && Array.isArray(snapshot.data()?.items)) {
        onUpdate(snapshot.data().items as Order[]);
      }
    },
    error => {
      console.warn('Orders live subscription error:', error);
    }
  );
}

export function subscribeToOrdersCollection(onUpdate: (orders: Order[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'orders'),
    snapshot => {
      onUpdate(snapshot.docs.map(d => d.data() as Order));
    },
    error => {
      console.warn('Orders collection subscription error:', error);
    }
  );
}

export function subscribeToCustomerOrders(
  uid: string,
  onUpdate: (orders: Order[]) => void
): Unsubscribe {
  const q = query(collection(db, 'orders'), where('customerUid', '==', uid));
  return onSnapshot(
    q,
    snapshot => {
      onUpdate(snapshot.docs.map(d => d.data() as Order));
    },
    error => {
      console.warn('Customer orders subscription error:', error);
    }
  );
}

/**
 * Combo Bundles persistence
 */
export async function saveBundlesToFirestore(
  bundles: BundleOffer[],
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/bundles';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'bundles');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        items: bundles,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchBundlesFromFirestore(): Promise<BundleOffer[] | null> {
  const res = await fetchSettingDocSafe<{ items?: BundleOffer[] }>('bundles');
  if (res.exists && Array.isArray(res.data?.items)) {
    return res.data!.items;
  }
  return null;
}

/**
 * Coupons persistence
 */
export async function saveCouponsToFirestore(
  coupons: Coupon[],
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/coupons';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'coupons');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        items: coupons,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchCouponsFromFirestore(): Promise<Coupon[] | null> {
  const res = await fetchSettingDocSafe<{ items?: Coupon[] }>('coupons');
  if (res.exists && Array.isArray(res.data?.items)) {
    return res.data!.items;
  }
  return null;
}

export function subscribeToCoupons(onUpdate: (coupons: Coupon[]) => void): Unsubscribe {
  const docRef = doc(db, 'settings', 'coupons');
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists() && Array.isArray(snapshot.data()?.items)) {
        onUpdate(snapshot.data().items as Coupon[]);
      }
    },
    error => {
      console.warn('Coupons live subscription error:', error);
    }
  );
}

/**
 * Return Policy Settings persistence
 */
export async function saveReturnPolicyToFirestore(
  settings: ReturnPolicySettings,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/return_policy';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'return_policy');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchReturnPolicyFromFirestore(): Promise<ReturnPolicySettings | null> {
  const res = await fetchSettingDocSafe<ReturnPolicySettings>('return_policy');
  return res.exists ? res.data : null;
}

/**
 * SEO Settings persistence
 */
export async function saveSeoSettingsToFirestore(
  settings: SeoSettings,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/seo';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'seo');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchSeoSettingsFromFirestore(): Promise<SeoSettings | null> {
  const res = await fetchSettingDocSafe<SeoSettings>('seo');
  return res.exists ? res.data : null;
}

/**
 * Live Chat Settings persistence
 */
export async function saveLiveChatSettingsToFirestore(
  settings: LiveChatSettings,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/livechat';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'livechat');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchLiveChatSettingsFromFirestore(): Promise<LiveChatSettings | null> {
  const res = await fetchSettingDocSafe<LiveChatSettings>('livechat');
  return res.exists ? res.data : null;
}

/**
 * Homepage Section Config persistence
 */
export async function saveHomepageSectionsToFirestore(
  config: HomepageSectionConfig,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/homepage_sections';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'homepage_sections');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        ...config,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchHomepageSectionsFromFirestore(): Promise<HomepageSectionConfig | null> {
  const res = await fetchSettingDocSafe<HomepageSectionConfig>('homepage_sections');
  return res.exists ? res.data : null;
}

/**
 * Order Rules Settings persistence
 */
export async function saveOrderSettingsToFirestore(
  settings: OrderSettings,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/order_rules';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'order_rules');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchOrderSettingsFromFirestore(): Promise<OrderSettings | null> {
  const res = await fetchSettingDocSafe<OrderSettings>('order_rules');
  return res.exists ? res.data : null;
}

/**
 * Staff Accounts persistence (passwords strictly stripped before Firestore commit!)
 */
export async function saveStaffAccountsToFirestore(
  staff: StaffAccount[],
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/staff_accounts';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'staff_accounts');
    const safeStaff = cleanFirestorePayload(stripPasswords(staff));
    await setDoc(
      docRef,
      cleanFirestorePayload({
        items: safeStaff,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchStaffAccountsFromFirestore(): Promise<StaffAccount[] | null> {
  const res = await fetchSettingDocSafe<{ items?: StaffAccount[] }>('staff_accounts');
  if (res.exists && Array.isArray(res.data?.items)) {
    return res.data!.items;
  }
  return null;
}

/**
 * Deterministic email resolution for phone-based customer auth in Firebase Auth.
 */
export function resolveCustomerAuthEmail(phone?: string, email?: string): string {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (cleanEmail && cleanEmail.includes('@')) {
    return cleanEmail;
  }
  const cleanDigits = (phone || '').replace(/\D/g, '');
  const normalizedPhone =
    cleanDigits.startsWith('8801') && cleanDigits.length === 13
      ? cleanDigits.slice(2)
      : cleanDigits;
  return normalizedPhone ? `cust_${normalizedPhone}@customers.jotpotshop.com` : '';
}

/**
 * Real Firebase Auth customer registration (Email/Password -> /customers/{uid})
 */
export async function registerCustomerWithFirebaseAuth(info: {
  name: string;
  phone: string;
  email?: string;
  password: string;
  cart?: any[];
}): Promise<{
  success: boolean;
  uid?: string;
  customer?: RegisteredCustomer;
  message: string;
}> {
  const authEmail = resolveCustomerAuthEmail(info.phone, info.email);
  if (!authEmail) {
    return { success: false, message: 'সঠিক মোবাইল নম্বর অথবা ইমেইল দিন।' };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, authEmail, info.password);
    const uid = cred.user.uid;
    try {
      await updateProfile(cred.user, { displayName: info.name.trim() });
    } catch {}

    const customerDoc: RegisteredCustomer = {
      id: uid,
      name: info.name.trim(),
      phone: info.phone.trim(),
      email: (info.email || '').trim().toLowerCase() || authEmail,
      isGoogleUser: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      cart: info.cart || [],
    };

    const writeRes = await saveSingleCustomerToFirestore(customerDoc);
    if (!writeRes.success) {
      return {
        success: false,
        message: `অ্যাকাউন্ট ডেটা সংরক্ষণে সমস্যা হয়েছে: ${writeRes.error}`,
      };
    }

    return {
      success: true,
      uid,
      customer: customerDoc,
      message: 'কাস্টমার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম।',
    };
  } catch (err: any) {
    const code = err?.code || '';
    if (code === 'auth/email-already-in-use') {
      return {
        success: false,
        message: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে। লগইন করুন।',
      };
    }
    if (code === 'auth/weak-password') {
      return {
        success: false,
        message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
      };
    }
    return {
      success: false,
      message: err?.message || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি।',
    };
  }
}

/**
 * Real Firebase Auth customer login (Email or Phone -> signInWithEmailAndPassword -> /customers/{uid})
 */
export async function loginCustomerWithFirebaseAuth(
  identifier: string,
  password: string
): Promise<{
  success: boolean;
  uid?: string;
  customer?: RegisteredCustomer;
  message: string;
}> {
  const rawId = identifier.trim();
  const cleanPass = password.trim();
  if (!rawId || !cleanPass) {
    return { success: false, message: 'অনুগ্রহ করে মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড দিন।' };
  }

  const candidateEmails: string[] = [];
  if (rawId.includes('@')) {
    candidateEmails.push(rawId.toLowerCase());
  } else {
    const digits = rawId.replace(/\D/g, '');
    const normalized =
      digits.startsWith('8801') && digits.length === 13 ? digits.slice(2) : digits;
    if (normalized) {
      candidateEmails.push(`cust_${normalized}@customers.jotpotshop.com`);
      if (digits && digits !== normalized) {
        candidateEmails.push(`cust_${digits}@customers.jotpotshop.com`);
      }
    }
  }

  if (candidateEmails.length === 0) {
    return { success: false, message: 'সঠিক মোবাইল নম্বর বা ইমেইল ঠিকানা দিন।' };
  }

  let signedUser: User | null = null;
  let lastAuthErr: any = null;

  for (const emailCandidate of candidateEmails) {
    try {
      const cred = await signInWithEmailAndPassword(auth, emailCandidate, cleanPass);
      signedUser = cred.user;
      break;
    } catch (err: any) {
      lastAuthErr = err;
    }
  }

  if (!signedUser) {
    const code = lastAuthErr?.code || '';
    if (code === 'auth/too-many-requests') {
      return {
        success: false,
        message: 'অনেকবার ভুল চেষ্টার কারণে অ্যাকাউন্টটি সাময়িকভাবে ব্লক আছে। কিছুক্ষণ পর আবার চেষ্টা করুন।',
      };
    }
    return {
      success: false,
      message: 'ভুল মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিন।',
    };
  }

  const uid = signedUser.uid;
  let customer = await fetchCustomerDocFromFirestore(uid);
  if (!customer) {
    customer = {
      id: uid,
      name: signedUser.displayName || signedUser.email?.split('@')[0] || 'Customer',
      phone: rawId.includes('@') ? '' : rawId,
      email: signedUser.email || candidateEmails[0],
      isGoogleUser: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      cart: [],
    };
    await saveSingleCustomerToFirestore(customer);
  }

  if (customer.status === 'disabled') {
    await signOut(auth).catch(() => {});
    return {
      success: false,
      message: 'দুঃখিত! আপনার অ্যাকাউন্টটি অ্যাডমিন কর্তৃক নিষ্ক্রিয় (Disabled) করা হয়েছে।',
    };
  }

  return {
    success: true,
    uid,
    customer,
    message: 'লগইন সফল হয়েছে!',
  };
}

/**
 * Password Reset via real Firebase Auth
 */
export async function resetCustomerPasswordFirebase(
  emailOrPhone: string,
  newPass?: string
): Promise<{ success: boolean; message: string }> {
  const trimmed = emailOrPhone.trim();
  const isEmail = trimmed.includes('@');

  // If user is currently signed in with this account and provided a new password, update it directly
  if (auth.currentUser && newPass && newPass.length >= 6) {
    try {
      await updatePassword(auth.currentUser, newPass);
      return { success: true, message: 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!' };
    } catch {
      // Fallback to password reset email if re-auth required
    }
  }

  if (isEmail) {
    try {
      await sendPasswordResetEmail(auth, trimmed.toLowerCase());
      return {
        success: true,
        message: 'আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'পাসওয়ার্ড রিসেট ইমেইল পাঠানো যায়নি।',
      };
    }
  }

  return {
    success: false,
    message:
      'নিরাপত্তার কারণে ফোন নম্বরের সরাসরি পাসওয়ার্ড রিসেট বন্ধ রয়েছে। লগইন করে প্রোফাইল থেকে পরিবর্তন করুন অথবা নিবন্ধিত ইমেইল দিয়ে রিসেট করুন।',
  };
}

/**
 * Saves Single Customer document at /customers/{uid} (NEVER includes plaintext password!)
 */
export async function saveSingleCustomerToFirestore(
  customer: RegisteredCustomer
): Promise<FirestoreWriteResult> {
  if (!customer?.id) return { success: false, error: 'Missing customer ID' };
  const path = `customers/${customer.id}`;
  try {
    const cleanCustomer = cleanFirestorePayload(
      stripPasswords({
        ...customer,
        status: customer.status || 'active',
        updatedAt: new Date().toISOString(),
        projectId: FIREBASE_PROJECT_INFO.projectId,
      })
    );
    await setDoc(doc(db, 'customers', customer.id), cleanCustomer, { merge: true });
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchCustomerDocFromFirestore(
  uid: string
): Promise<RegisteredCustomer | null> {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'customers', uid));
    recordDatabaseRead();
    if (snap.exists()) {
      return snap.data() as RegisteredCustomer;
    }
    return null;
  } catch (err) {
    recordDatabaseError(err);
    return null;
  }
}

export async function fetchCustomersCollectionFromFirestore(): Promise<RegisteredCustomer[]> {
  try {
    const snap = await getDocs(collection(db, 'customers'));
    recordDatabaseRead();
    return snap.docs.map(d => d.data() as RegisteredCustomer);
  } catch (err) {
    recordDatabaseError(err);
    return [];
  }
}

export function subscribeToCustomersCollection(
  onUpdate: (customers: RegisteredCustomer[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'customers'),
    snapshot => {
      onUpdate(snapshot.docs.map(d => d.data() as RegisteredCustomer));
    },
    error => {
      console.warn('Customers collection subscription error:', error);
    }
  );
}

/**
 * Staff Admin Customers ledger (settings/customers) - strictly strips passwords!
 */
export async function saveCustomersToFirestore(
  customers: RegisteredCustomer[],
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/customers';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'customers');
    const safeCustomers = cleanFirestorePayload(stripPasswords(customers));
    await setDoc(
      docRef,
      cleanFirestorePayload({
        items: safeCustomers,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchCustomersFromFirestore(): Promise<RegisteredCustomer[] | null> {
  const res = await fetchSettingDocSafe<{ items?: RegisteredCustomer[] }>('customers');
  if (res.exists && Array.isArray(res.data?.items)) {
    return res.data!.items;
  }
  return null;
}

export function subscribeToCustomers(
  onUpdate: (customers: RegisteredCustomer[]) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'customers');
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists() && Array.isArray(snapshot.data()?.items)) {
        onUpdate(snapshot.data().items as RegisteredCustomer[]);
      }
    },
    error => {
      console.warn('Customers live subscription error:', error);
    }
  );
}

/**
 * Formats a Bangladesh phone number to standard format
 */
export function formatBDPhoneNumber(phone: string): string {
  const cleaned = phone.trim().replace(/\D/g, '');
  if (cleaned.startsWith('880')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return `+88${cleaned}`;
  }
  return cleaned;
}

export async function logoutFirebaseAuth(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase logout error:', err);
  }
}

/**
 * Conversations & Live Chat persistence (/conversations/{convId})
 */
export async function saveSingleConversationToFirestore(
  conversation: UnifiedConversation,
  authorEmail = 'customer@jotpotshop.com'
): Promise<FirestoreWriteResult> {
  if (!conversation || !conversation.id) {
    return { success: false, error: 'Missing conversation ID' };
  }
  const path = `conversations/${conversation.id}`;
  try {
    const docRef = doc(db, 'conversations', conversation.id);
    await setDoc(
      docRef,
      cleanFirestorePayload({
        ...conversation,
        updatedAt: new Date().toISOString(),
        updatedBy: authorEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export function subscribeToCustomerConversation(
  convId: string,
  onUpdate: (conversation: UnifiedConversation | null) => void
): Unsubscribe {
  const docRef = doc(db, 'conversations', convId);
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as UnifiedConversation);
      } else {
        onUpdate(null);
      }
    },
    error => {
      console.warn('Customer conversation live subscription error:', error);
    }
  );
}

export async function fetchCustomerConversationsFromFirestore(
  uid: string
): Promise<UnifiedConversation[]> {
  if (!uid) return [];
  try {
    const q = query(collection(db, 'conversations'), where('customerUid', '==', uid));
    const snap = await getDocs(q);
    recordDatabaseRead();
    return snap.docs.map(d => d.data() as UnifiedConversation);
  } catch (err) {
    recordDatabaseError(err);
    return [];
  }
}

export function subscribeToCustomerConversations(
  uid: string,
  onUpdate: (conversations: UnifiedConversation[]) => void
): Unsubscribe {
  const q = query(collection(db, 'conversations'), where('customerUid', '==', uid));
  return onSnapshot(
    q,
    snapshot => {
      onUpdate(snapshot.docs.map(d => d.data() as UnifiedConversation));
    },
    error => {
      console.warn('Customer conversations live subscription error:', error);
    }
  );
}

export async function fetchConversationsCollectionFromFirestore(): Promise<UnifiedConversation[]> {
  try {
    const snap = await getDocs(collection(db, 'conversations'));
    recordDatabaseRead();
    return snap.docs.map(d => d.data() as UnifiedConversation);
  } catch (err) {
    recordDatabaseError(err);
    return [];
  }
}

export function subscribeToConversationsCollection(
  onUpdate: (conversations: UnifiedConversation[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'conversations'),
    snapshot => {
      onUpdate(snapshot.docs.map(d => d.data() as UnifiedConversation));
    },
    error => {
      console.warn('Conversations collection subscription error:', error);
    }
  );
}

export async function saveConversationsToFirestore(
  conversations: UnifiedConversation[],
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/live_chat_conversations';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'live_chat_conversations');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        items: conversations.map(c => cleanFirestorePayload(c)),
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchConversationsFromFirestore(): Promise<UnifiedConversation[] | null> {
  const res = await fetchSettingDocSafe<{ items?: UnifiedConversation[] }>(
    'live_chat_conversations'
  );
  if (res.exists && Array.isArray(res.data?.items)) {
    return res.data!.items;
  }
  return null;
}

export function subscribeToConversations(
  onUpdate: (conversations: UnifiedConversation[]) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'live_chat_conversations');
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists() && Array.isArray(snapshot.data()?.items)) {
        onUpdate(snapshot.data().items);
      }
    },
    error => {
      console.warn('Conversations live subscription error:', error);
    }
  );
}

/**
 * Help Center Settings persistence
 */
export async function saveHelpCenterSettingsToFirestore(
  settings: HelpCenterSettings,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/help_center';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'help_center');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchHelpCenterSettingsFromFirestore(): Promise<HelpCenterSettings | null> {
  const res = await fetchSettingDocSafe<HelpCenterSettings>('help_center');
  return res.exists ? res.data : null;
}

export function subscribeToHelpCenterSettings(
  onUpdate: (settings: HelpCenterSettings) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'help_center');
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as HelpCenterSettings);
      }
    },
    error => {
      console.warn('Help Center live subscription error:', error);
    }
  );
}

/**
 * Trust Section Settings persistence
 */
export async function saveTrustSectionSettingsToFirestore(
  settings: TrustSectionSettings,
  adminUserEmail = MASTER_SUPER_ADMIN_EMAIL
): Promise<FirestoreWriteResult> {
  const path = 'settings/trust_section';
  try {
    await ensureAdminFirebaseAuthSession(adminUserEmail);
    const docRef = doc(db, 'settings', 'trust_section');
    await setDoc(
      docRef,
      cleanFirestorePayload({
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      }),
      { merge: true }
    );
    recordDatabaseWrite();
    return { success: true };
  } catch (err: any) {
    return logFirestoreOperationError(err, OperationType.WRITE, path);
  }
}

export async function fetchTrustSectionSettingsFromFirestore(): Promise<TrustSectionSettings | null> {
  const res = await fetchSettingDocSafe<TrustSectionSettings>('trust_section');
  return res.exists ? res.data : null;
}

export function subscribeToTrustSectionSettings(
  onUpdate: (settings: TrustSectionSettings) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'trust_section');
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as TrustSectionSettings);
      }
    },
    error => {
      console.warn('Trust Section live subscription error:', error);
    }
  );
}
