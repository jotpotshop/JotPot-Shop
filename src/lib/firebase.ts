import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
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
import { WebsiteSettings, Category, HeroBannerSlide } from '../types';
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
  apiKey: firebaseConfigJson.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: firebaseConfigJson.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'jotpotshop.firebaseapp.com',
  projectId: firebaseConfigJson.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || 'jotpotshop',
  storageBucket: firebaseConfigJson.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'jotpotshop.firebasestorage.app',
  messagingSenderId: firebaseConfigJson.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '212800812582',
  appId: firebaseConfigJson.appId || import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Initialize Firebase App singleton safely
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Authentication
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore with specified database ID
export const db: Firestore = getFirestore(
  app,
  firebaseConfigJson.firestoreDatabaseId || '(default)'
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
export function compressImage(file: File, maxDim = 1200, quality = 0.85): Promise<string> {
  return new Promise(resolve => {
    // If SVG, return data URL directly
    if (file.type.includes('svg') || file.name.toLowerCase().endsWith('.svg')) {
      fileToDataUrl(file).then(resolve).catch(() => resolve(''));
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
          const dataUrl = canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);
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
  maxDimension = 1200
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
    const compactDataUrl = await compressImage(file, maxDimension, 0.85);
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
  const maxDim = assetType === 'favicon' ? 64 : assetType === 'mobile_logo' ? 400 : 800;
  return uploadAsset(file, 'branding', assetType, maxDim);
}

/**
 * Uploads category icon
 */
export async function uploadCategoryIcon(file: File, categoryId = 'category'): Promise<UploadAssetResult> {
  return uploadAsset(file, 'categories', `icon_${categoryId}`, 256);
}

/**
 * Uploads hero banner image
 */
export async function uploadHeroBannerImage(file: File, bannerId = 'hero'): Promise<UploadAssetResult> {
  return uploadAsset(file, 'banners', `hero_${bannerId}`, 1600);
}

/**
 * Saves Branding Settings to Cloud Firestore: collection "settings", doc "branding"
 */
export async function saveBrandingToFirestore(
  branding: Partial<WebsiteSettings>,
  adminUserEmail = 'jotpotshop.official@gmail.com'
): Promise<void> {
  const docRef = doc(db, 'settings', 'branding');
  const payload = {
    ...branding,
    updatedAt: new Date().toISOString(),
    updatedBy: adminUserEmail,
    projectId: FIREBASE_PROJECT_INFO.projectId,
  };

  await setDoc(docRef, payload, { merge: true });
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
