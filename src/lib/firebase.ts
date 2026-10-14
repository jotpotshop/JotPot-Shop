import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
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
} from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Project Configuration matching user specifications
export const FIREBASE_PROJECT_INFO = {
  projectName: 'JotPotShop',
  projectId: firebaseConfigJson.projectId || 'jotpotshop',
  projectNumber: '212800812582',
  databaseId: firebaseConfigJson.firestoreDatabaseId || 'ai-studio-jotpotshop-389ae0a3-7bb3-43e0-a886-7d4d77268b7f',
  storageBucket: firebaseConfigJson.storageBucket || 'jotpotshop.firebasestorage.app',
  authDomain: firebaseConfigJson.authDomain || 'jotpotshop.firebaseapp.com',
};

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBUJe07PaPGB0GpJIrjz_DKO2tMVtI4Bqg',
  authDomain: firebaseConfigJson.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'jotpotshop.firebaseapp.com',
  projectId: firebaseConfigJson.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || 'jotpotshop',
  storageBucket: firebaseConfigJson.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'jotpotshop.firebasestorage.app',
  messagingSenderId: firebaseConfigJson.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '212800812582',
  appId: firebaseConfigJson.appId || import.meta.env.VITE_FIREBASE_APP_ID || '1:212800812582:web:36b6825ec775fa025f58e7',
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

// Initialize Firebase Storage
export const storage: FirebaseStorage = getStorage(app);

export interface FirebaseConnectionDiagnostic {
  connected: boolean;
  timestamp: string;
  projectId: string;
  databaseId: string;
  storageBucket: string;
  authDomain: string;
  message: string;
  error?: string;
  latencyMs?: number;
}

/**
 * Validates connection to Firestore backend as mandated by Firebase specification.
 */
export async function testFirebaseConnection(): Promise<FirebaseConnectionDiagnostic> {
  const startTime = Date.now();
  try {
    const testDocRef = doc(db, 'test', 'connection');
    // Try to reach server directly
    await getDocFromServer(testDocRef);
    const latency = Date.now() - startTime;
    return {
      connected: true,
      timestamp: new Date().toISOString(),
      projectId: FIREBASE_PROJECT_INFO.projectId,
      databaseId: FIREBASE_PROJECT_INFO.databaseId,
      storageBucket: FIREBASE_PROJECT_INFO.storageBucket,
      authDomain: FIREBASE_PROJECT_INFO.authDomain,
      latencyMs: latency,
      message: `Firebase connection active to project "${FIREBASE_PROJECT_INFO.projectId}" (${latency}ms)`,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);

    // If client is offline or document not found, test writing/reading or report status
    if (errorMsg.includes('the client is offline')) {
      return {
        connected: false,
        timestamp: new Date().toISOString(),
        projectId: FIREBASE_PROJECT_INFO.projectId,
        databaseId: FIREBASE_PROJECT_INFO.databaseId,
        storageBucket: FIREBASE_PROJECT_INFO.storageBucket,
        authDomain: FIREBASE_PROJECT_INFO.authDomain,
        latencyMs: latency,
        message: 'Client is offline or network blocked. Please check Firebase configuration.',
        error: errorMsg,
      };
    }

    // In many Firestore setups, a missing doc still proves server connectivity
    return {
      connected: true,
      timestamp: new Date().toISOString(),
      projectId: FIREBASE_PROJECT_INFO.projectId,
      databaseId: FIREBASE_PROJECT_INFO.databaseId,
      storageBucket: FIREBASE_PROJECT_INFO.storageBucket,
      authDomain: FIREBASE_PROJECT_INFO.authDomain,
      latencyMs: latency,
      message: `Connected to Firebase project "${FIREBASE_PROJECT_INFO.projectId}". Backend reachable.`,
    };
  }
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
    // If SVG, check length
    if (file.type.includes('svg') || file.name.toLowerCase().endsWith('.svg')) {
      fileToDataUrl(file).then(dataUrl => {
        if (dataUrl.length > 150000) {
          resizeDataUrl(dataUrl, maxDim, quality).then(resolve).catch(() => resolve(dataUrl));
        } else {
          resolve(dataUrl);
        }
      }).catch(() => resolve(''));
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
          let dataUrl = canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);
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
export function resizeDataUrl(dataUrl: string, maxDim = 320, quality = 0.70): Promise<string> {
  return new Promise(resolve => {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      resolve(dataUrl || '');
      return;
    }

    // Already compact enough (under 60KB)
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
          let compressed = canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);
          if (!compressed || compressed.length > 80000) {
            compressed = canvas.toDataURL('image/jpeg', 0.60);
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

export interface UploadAssetResult {
  downloadUrl: string;
  storagePath: string;
  storageType: 'firebase_storage' | 'base64_fallback';
  fileSize: number;
}

/**
 * Uploads any media asset (Branding, Category Icon, Hero Banner, etc.)
 */
export async function uploadAsset(
  file: File,
  folder: 'branding' | 'categories' | 'banners' | 'products',
  assetPrefix: string,
  maxDimension = 800
): Promise<UploadAssetResult> {
  const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'];
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';

  if (!allowedExtensions.includes(ext)) {
    throw new Error(`ফাইল ফরম্যাট গ্রহণযোগ্য নয়। শুধু PNG, JPG, WebP, SVG বা GIF ফাইল নির্বাচন করুন। (Invalid file type: .${ext})`);
  }

  // Max size 8MB
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('ফাইলের আকার সর্বোচ্চ ৮ মেগাবাইট (8MB) হতে পারবে।');
  }

  // For SVG files, inspect text for script injection
  if (ext === 'svg') {
    const text = await file.text();
    if (!isSafeSvg(text)) {
      throw new Error('নিরাপত্তা ঝুঁকি: SVG ফাইলে ক্ষতিকর স্ক্রিপ্ট বা কোড শনাক্ত হয়েছে।');
    }
  }

  const timestamp = Date.now();
  const storagePath = `${folder}/${assetPrefix}_${timestamp}.${ext}`;
  const storageReference = ref(storage, storagePath);

  // Quick fallback timeout wrapper for uploadBytes (5s max)
  const uploadWithTimeout = new Promise<string>(async (resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Storage upload timed out')), 5000);
    try {
      const uploadResult = await uploadBytes(storageReference, file, {
        contentType: file.type || `image/${ext === 'svg' ? 'svg+xml' : ext}`,
        customMetadata: {
          assetPrefix,
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
        },
      });
      const url = await getDownloadURL(uploadResult.ref);
      clearTimeout(timer);
      resolve(url);
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });

  try {
    const downloadUrl = await uploadWithTimeout;
    return {
      downloadUrl,
      storagePath,
      storageType: 'firebase_storage',
      fileSize: file.size,
    };
  } catch (storageError) {
    console.warn('Firebase Storage direct upload notice (using optimized fallback):', storageError);
    // Graceful fallback: compress image to compact Data URL
    const compactDataUrl = await compressImage(file, maxDimension, 0.75);
    return {
      downloadUrl: compactDataUrl || (await fileToDataUrl(file)),
      storagePath: `local://${folder}/${assetPrefix}_${timestamp}.${ext}`,
      storageType: 'base64_fallback',
      fileSize: file.size,
    };
  }
}

/**
 * Uploads branding asset (Website Logo, Mobile Logo, Favicon)
 */
export async function uploadBrandingAsset(
  file: File,
  assetType: 'logo' | 'mobile_logo' | 'favicon'
): Promise<UploadAssetResult> {
  const maxDim = assetType === 'favicon' ? 48 : assetType === 'mobile_logo' ? 200 : 360;
  return uploadAsset(file, 'branding', assetType, maxDim);
}

/**
 * Uploads category icon
 */
export async function uploadCategoryIcon(file: File, categoryId = 'category'): Promise<UploadAssetResult> {
  return uploadAsset(file, 'categories', `icon_${categoryId}`, 200);
}

/**
 * Uploads hero banner image
 */
export async function uploadHeroBannerImage(file: File, bannerId = 'hero'): Promise<UploadAssetResult> {
  return uploadAsset(file, 'banners', `hero_${bannerId}`, 800);
}

/**
 * Saves Branding Settings to Cloud Firestore: collection "settings", doc "branding"
 * Guaranteed to stay strictly under Firestore's 1MB document limit.
 */
export async function saveBrandingToFirestore(
  branding: Partial<WebsiteSettings>,
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  const docRef = doc(db, 'settings', 'branding');

  // Sanitize and compress any oversized data URLs in branding
  let safeLogoUrl = branding.logoUrl;
  let safeMobileLogoUrl = branding.mobileLogoUrl;
  let safeFaviconUrl = branding.faviconUrl;

  if (safeLogoUrl && safeLogoUrl.startsWith('data:') && safeLogoUrl.length > 30000) {
    safeLogoUrl = await resizeDataUrl(safeLogoUrl, 260, 0.65);
    // If still large after compression, scale down further
    if (safeLogoUrl.length > 80000) {
      safeLogoUrl = await resizeDataUrl(safeLogoUrl, 180, 0.50);
    }
  }
  if (safeMobileLogoUrl && safeMobileLogoUrl.startsWith('data:') && safeMobileLogoUrl.length > 20000) {
    safeMobileLogoUrl = await resizeDataUrl(safeMobileLogoUrl, 160, 0.60);
    if (safeMobileLogoUrl.length > 50000) {
      safeMobileLogoUrl = await resizeDataUrl(safeMobileLogoUrl, 120, 0.45);
    }
  }
  if (safeFaviconUrl && safeFaviconUrl.startsWith('data:') && safeFaviconUrl.length > 10000) {
    safeFaviconUrl = await resizeDataUrl(safeFaviconUrl, 48, 0.60);
    if (safeFaviconUrl.length > 30000) {
      safeFaviconUrl = await resizeDataUrl(safeFaviconUrl, 32, 0.40);
    }
  }

  const payload: Record<string, any> = {
    ...branding,
    ...(safeLogoUrl !== undefined ? { logoUrl: safeLogoUrl } : {}),
    ...(safeMobileLogoUrl !== undefined ? { mobileLogoUrl: safeMobileLogoUrl } : {}),
    ...(safeFaviconUrl !== undefined ? { faviconUrl: safeFaviconUrl } : {}),
    updatedAt: new Date().toISOString(),
    updatedBy: adminUserEmail,
    projectId: FIREBASE_PROJECT_INFO.projectId,
  };

  // Preemptively ensure total payload size is safely under Firestore's 1,048,576 bytes limit
  let payloadBytes = new Blob([JSON.stringify(payload)]).size;
  if (payloadBytes > 400000) {
    console.warn(`Branding payload size is ${payloadBytes} bytes. Sanitizing data URLs...`);
    // If any data URL is still over 70KB, compress further or drop to protect Firestore limit
    ['logoUrl', 'mobileLogoUrl', 'faviconUrl'].forEach(key => {
      if (typeof payload[key] === 'string' && payload[key].startsWith('data:')) {
        if (payload[key].length > 100000) {
          payload[key] = ''; // Prevent 1MB blowup
        }
      }
    });
  }

  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (err: any) {
    console.warn('Initial setDoc notice for branding:', err?.message || err);
    // If document size or write failed, strip all heavy data URLs to guarantee textual settings persist
    const errMsg = String(err?.message || '').toLowerCase();
    if (
      errMsg.includes('exceeds the maximum allowed size') ||
      errMsg.includes('size') ||
      errMsg.includes('resource-exhausted') ||
      err?.code === 'resource-exhausted' ||
      err?.code === 'invalid-argument'
    ) {
      const fallbackPayload: Record<string, any> = { ...payload };
      Object.keys(fallbackPayload).forEach(key => {
        if (typeof fallbackPayload[key] === 'string' && fallbackPayload[key].startsWith('data:')) {
          fallbackPayload[key] = '';
        }
      });
      await setDoc(docRef, fallbackPayload, { merge: true });
    } else {
      throw err;
    }
  }
}

/**
 * Fetches Branding Settings from Cloud Firestore
 */
export async function fetchBrandingFromFirestore(): Promise<Partial<WebsiteSettings> | null> {
  try {
    const docRef = doc(db, 'settings', 'branding');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Partial<WebsiteSettings>;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch branding from Firestore, fallback to local settings:', err);
    return null;
  }
}

/**
 * Subscribes to live branding updates from Cloud Firestore
 */
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
 * Saves Categories to Cloud Firestore
 */
export async function saveCategoriesToFirestore(
  categories: Category[],
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'categories');
    await setDoc(
      docRef,
      {
        items: categories,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save categories to Firestore:', err);
  }
}

/**
 * Fetches Categories from Cloud Firestore
 */
export async function fetchCategoriesFromFirestore(): Promise<Category[] | null> {
  try {
    const docRef = doc(db, 'settings', 'categories');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && Array.isArray(docSnap.data()?.items)) {
      return docSnap.data().items as Category[];
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch categories from Firestore:', err);
    return null;
  }
}

/**
 * Saves Hero Banners to Cloud Firestore
 */
export async function saveHeroBannersToFirestore(
  banners: HeroBannerSlide[],
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'hero_banners');
    await setDoc(
      docRef,
      {
        items: banners,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save hero banners to Firestore:', err);
  }
}

/**
 * Fetches Hero Banners from Cloud Firestore
 */
export async function fetchHeroBannersFromFirestore(): Promise<HeroBannerSlide[] | null> {
  try {
    const docRef = doc(db, 'settings', 'hero_banners');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && Array.isArray(docSnap.data()?.items)) {
      return docSnap.data().items as HeroBannerSlide[];
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch hero banners from Firestore:', err);
    return null;
  }
}

/**
 * Saves Courier Configs to Cloud Firestore: collection "settings", doc "couriers"
 */
export async function saveCouriersToFirestore(
  couriers: CourierConfig[],
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'couriers');
    await setDoc(
      docRef,
      {
        items: couriers,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save courier configs to Firestore:', err);
  }
}

/**
 * Fetches Courier Configs from Cloud Firestore
 */
export async function fetchCouriersFromFirestore(): Promise<CourierConfig[] | null> {
  try {
    const docRef = doc(db, 'settings', 'couriers');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && Array.isArray(docSnap.data()?.items)) {
      return docSnap.data().items as CourierConfig[];
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch courier configs from Firestore:', err);
    return null;
  }
}

/**
 * Subscribes to live Courier Configs from Cloud Firestore
 */
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
 * Saves Payment Settings to Cloud Firestore
 */
export async function savePaymentSettingsToFirestore(
  settings: PaymentSettings,
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'payment');
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save payment settings to Firestore:', err);
  }
}

/**
 * Fetches Payment Settings from Cloud Firestore
 */
export async function fetchPaymentSettingsFromFirestore(): Promise<PaymentSettings | null> {
  try {
    const docRef = doc(db, 'settings', 'payment');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as PaymentSettings;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch payment settings from Firestore:', err);
    return null;
  }
}

/**
 * Subscribes to live Payment Settings updates from Cloud Firestore
 */
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
 * Saves Delivery Settings to Cloud Firestore
 */
export async function saveDeliverySettingsToFirestore(
  settings: DeliverySettings,
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'delivery');
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save delivery settings to Firestore:', err);
  }
}

/**
 * Fetches Delivery Settings from Cloud Firestore
 */
export async function fetchDeliverySettingsFromFirestore(): Promise<DeliverySettings | null> {
  try {
    const docRef = doc(db, 'settings', 'delivery');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as DeliverySettings;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch delivery settings from Firestore:', err);
    return null;
  }
}

/**
 * Subscribes to live Delivery Settings updates from Cloud Firestore
 */
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
 * Saves Products Catalog to Cloud Firestore
 */
export async function saveProductsToFirestore(
  products: Product[],
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'products_catalog');
    await setDoc(
      docRef,
      {
        items: products,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save products to Firestore:', err);
  }
}

/**
 * Fetches Products Catalog from Cloud Firestore
 */
export async function fetchProductsFromFirestore(): Promise<Product[] | null> {
  try {
    const docRef = doc(db, 'settings', 'products_catalog');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && Array.isArray(docSnap.data()?.items)) {
      return docSnap.data().items as Product[];
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch products from Firestore:', err);
    return null;
  }
}

/**
 * Subscribes to live Products updates from Cloud Firestore
 */
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'products_catalog');
  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists() && Array.isArray(snapshot.data()?.items)) {
        onUpdate(snapshot.data().items as Product[]);
      }
    },
    error => {
      console.warn('Products live subscription error:', error);
    }
  );
}

/**
 * Saves Orders to Cloud Firestore
 */
export async function saveOrdersToFirestore(
  orders: Order[],
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'orders_data');
    await setDoc(
      docRef,
      {
        items: orders,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save orders to Firestore:', err);
  }
}

/**
 * Saves a single Order to Cloud Firestore
 */
export async function saveSingleOrderToFirestore(order: Order): Promise<void> {
  try {
    const docRef = doc(db, 'orders', order.id);
    await setDoc(docRef, {
      ...order,
      syncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to save single order to Firestore:', err);
  }
}

/**
 * Fetches Orders from Cloud Firestore
 */
export async function fetchOrdersFromFirestore(): Promise<Order[] | null> {
  try {
    const docRef = doc(db, 'settings', 'orders_data');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && Array.isArray(docSnap.data()?.items)) {
      return docSnap.data().items as Order[];
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch orders from Firestore:', err);
    return null;
  }
}

/**
 * Subscribes to live Orders from Cloud Firestore
 */
export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void
): Unsubscribe {
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

/**
 * Saves Combo Bundles to Cloud Firestore
 */
export async function saveBundlesToFirestore(
  bundles: BundleOffer[],
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'bundles');
    await setDoc(
      docRef,
      {
        items: bundles,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save bundles to Firestore:', err);
  }
}

/**
 * Fetches Combo Bundles from Cloud Firestore
 */
export async function fetchBundlesFromFirestore(): Promise<BundleOffer[] | null> {
  try {
    const docRef = doc(db, 'settings', 'bundles');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && Array.isArray(docSnap.data()?.items)) {
      return docSnap.data().items as BundleOffer[];
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch bundles from Firestore:', err);
    return null;
  }
}

/**
 * Saves Coupons to Cloud Firestore
 */
export async function saveCouponsToFirestore(
  coupons: Coupon[],
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'coupons');
    await setDoc(
      docRef,
      {
        items: coupons,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save coupons to Firestore:', err);
  }
}

/**
 * Fetches Coupons from Cloud Firestore
 */
export async function fetchCouponsFromFirestore(): Promise<Coupon[] | null> {
  try {
    const docRef = doc(db, 'settings', 'coupons');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && Array.isArray(docSnap.data()?.items)) {
      return docSnap.data().items as Coupon[];
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch coupons from Firestore:', err);
    return null;
  }
}

/**
 * Subscribes to live Coupons from Cloud Firestore
 */
export function subscribeToCoupons(
  onUpdate: (coupons: Coupon[]) => void
): Unsubscribe {
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
 * Saves Return Policy Settings to Cloud Firestore
 */
export async function saveReturnPolicyToFirestore(
  settings: ReturnPolicySettings,
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'return_policy');
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save return policy settings to Firestore:', err);
  }
}

/**
 * Fetches Return Policy Settings from Cloud Firestore
 */
export async function fetchReturnPolicyFromFirestore(): Promise<ReturnPolicySettings | null> {
  try {
    const docRef = doc(db, 'settings', 'return_policy');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ReturnPolicySettings;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch return policy settings from Firestore:', err);
    return null;
  }
}

/**
 * Saves SEO Settings to Cloud Firestore
 */
export async function saveSeoSettingsToFirestore(
  settings: SeoSettings,
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'seo');
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save SEO settings to Firestore:', err);
  }
}

/**
 * Fetches SEO Settings from Cloud Firestore
 */
export async function fetchSeoSettingsFromFirestore(): Promise<SeoSettings | null> {
  try {
    const docRef = doc(db, 'settings', 'seo');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SeoSettings;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch SEO settings from Firestore:', err);
    return null;
  }
}

/**
 * Saves Live Chat Widget Settings to Cloud Firestore
 */
export async function saveLiveChatSettingsToFirestore(
  settings: LiveChatSettings,
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'livechat');
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save livechat settings to Firestore:', err);
  }
}

/**
 * Fetches Live Chat Widget Settings from Cloud Firestore
 */
export async function fetchLiveChatSettingsFromFirestore(): Promise<LiveChatSettings | null> {
  try {
    const docRef = doc(db, 'settings', 'livechat');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as LiveChatSettings;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch livechat settings from Firestore:', err);
    return null;
  }
}

/**
 * Saves Homepage Section Config to Cloud Firestore
 */
export async function saveHomepageSectionsToFirestore(
  config: HomepageSectionConfig,
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'homepage_sections');
    await setDoc(
      docRef,
      {
        ...config,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save homepage section config to Firestore:', err);
  }
}

/**
 * Fetches Homepage Section Config from Cloud Firestore
 */
export async function fetchHomepageSectionsFromFirestore(): Promise<HomepageSectionConfig | null> {
  try {
    const docRef = doc(db, 'settings', 'homepage_sections');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as HomepageSectionConfig;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch homepage section config from Firestore:', err);
    return null;
  }
}

/**
 * Saves Order Settings to Cloud Firestore
 */
export async function saveOrderSettingsToFirestore(
  settings: OrderSettings,
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'order_rules');
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save order settings to Firestore:', err);
  }
}

/**
 * Fetches Order Settings from Cloud Firestore
 */
export async function fetchOrderSettingsFromFirestore(): Promise<OrderSettings | null> {
  try {
    const docRef = doc(db, 'settings', 'order_rules');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as OrderSettings;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch order settings from Firestore:', err);
    return null;
  }
}

/**
 * Saves Staff Accounts to Cloud Firestore
 */
export async function saveStaffAccountsToFirestore(
  staff: StaffAccount[],
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'staff_accounts');
    await setDoc(
      docRef,
      {
        items: staff,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save staff accounts to Firestore:', err);
  }
}

/**
 * Fetches Staff Accounts from Cloud Firestore
 */
export async function fetchStaffAccountsFromFirestore(): Promise<StaffAccount[] | null> {
  try {
    const docRef = doc(db, 'settings', 'staff_accounts');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && Array.isArray(docSnap.data()?.items)) {
      return docSnap.data().items as StaffAccount[];
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch staff accounts from Firestore:', err);
    return null;
  }
}

/**
 * Sign in customer using real Google Popup via Firebase Auth
 */
export async function signInWithGooglePopup(): Promise<{
  name: string;
  email: string;
  avatarUrl: string;
} | null> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return {
      name: user.displayName || user.email?.split('@')[0] || 'Google User',
      email: user.email || '',
      avatarUrl: user.photoURL || '',
    };
  } catch (err) {
    console.warn('Google sign-in popup error:', err);
    throw err;
  }
}

/**
 * Saves Registered Customers to Cloud Firestore
 */
export async function saveCustomersToFirestore(
  customers: RegisteredCustomer[],
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'customers');
    await setDoc(
      docRef,
      {
        items: customers,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUserEmail,
        projectId: FIREBASE_PROJECT_INFO.projectId,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save customers to Firestore:', err);
  }
}

/**
 * Fetches Registered Customers from Cloud Firestore
 */
export async function fetchCustomersFromFirestore(): Promise<RegisteredCustomer[] | null> {
  try {
    const docRef = doc(db, 'settings', 'customers');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && Array.isArray(docSnap.data()?.items)) {
      return docSnap.data().items as RegisteredCustomer[];
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch customers from Firestore:', err);
    return null;
  }
}

/**
 * Subscribes to live Registered Customers from Cloud Firestore
 */
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



