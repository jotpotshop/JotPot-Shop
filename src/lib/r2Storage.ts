/**
 * Client-side Cloudflare R2 Upload, Client Optimization & File Management Service
 * Replaces Firebase Storage completely for JotPotShop while keeping Firebase Auth & Firestore.
 *
 * Security & Resilience Guarantees:
 * - Zero R2 credentials on frontend.
 * - Authenticates every upload/delete/migration with a live Firebase Auth ID Token (`Authorization: Bearer ...`).
 * - Converts/compresses raster images to clean WebP (preserving aspect ratio, quality & transparency).
 * - Persists file metadata to Firestore `media_assets/{fileId}` (NO base64 stored in Firestore).
 * - Transactional rollback: if Firestore metadata persistence fails, removes orphan R2 object automatically.
 * - Legacy protection: NEVER deletes legacy `firebasestorage.*` assets during normal edits.
 */
import { auth, db, cleanFirestorePayload, ensureAdminFirebaseAuthSession, handleFirestoreError, OperationType, recordDatabaseRead, recordDatabaseWrite, recordDatabaseError, isCurrentUserStaffEmail } from './firebase';
import { doc, setDoc, deleteDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { MediaAssetRecord, StorageFolder } from '../types';

export interface UploadAssetResult {
  fileId: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  storagePath: string;
  storageType: 'cloudflare_r2';
  fileSize: number;
  width?: number;
  height?: number;
  contentType: string;
}

export interface StorageStatusResponse {
  ok: boolean;
  backend: 'cloudflare_r2';
  bucketName: string;
  bindingType: string;
  r2Configured: boolean;
  bucketReachable: boolean;
  publicBaseUrl: string;
  customDomainActive: boolean;
}

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'ico']);
const DOC_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp']);

export function isSafeSvg(svgContent: string): boolean {
  const lower = svgContent.toLowerCase();
  const dangerousPatterns = [
    '<script',
    'javascript:',
    'vbscript:',
    'data:text/html',
    'onload=',
    'onerror=',
    'onclick=',
    '<foreignobject',
    '<iframe',
    '<embed',
    '<object',
  ];
  return !dangerousPatterns.some(p => lower.includes(p));
}

export function isR2AssetUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed.includes('/api/storage/file/') ||
    trimmed.includes('assets.jotpotshop.com/')
  );
}

export function extractR2ObjectKeyFromUrl(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const marker = '/api/storage/file/';
  const idx = trimmed.indexOf(marker);
  if (idx !== -1) {
    const raw = trimmed.slice(idx + marker.length).split('?')[0].split('#')[0];
    try {
      return decodeURIComponent(raw).replace(/^\/+/, '');
    } catch {
      return raw.replace(/^\/+/, '');
    }
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.toLowerCase() === 'assets.jotpotshop.com') {
      return decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
    }
  } catch {
    // Ignore non-URL strings
  }
  return null;
}

export function isLegacyFirebaseStorageUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed.includes('firebasestorage.googleapis.com') ||
    trimmed.includes('firebasestorage.app') ||
    trimmed.startsWith('gs://')
  );
}

interface OptimizedImagePayload {
  file: File;
  thumbnail?: File;
  width?: number;
  height?: number;
}

function loadImageDimensions(file: File): Promise<{ img: HTMLImageElement; objectUrl: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, objectUrl });
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not decode selected image file'));
    };
    img.src = objectUrl;
  });
}

async function renderCanvasBlob(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, targetW);
  canvas.height = Math.max(1, targetH);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.clearRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), mimeType, quality);
  });
}

/**
 * Optimizes raster images cleanly to WebP (preserving aspect ratio & sharpness)
 * and builds an optional lightweight 360px thumbnail for product/banner feeds.
 */
async function optimizeImageForR2(
  file: File,
  folder: StorageFolder,
  maxDimension: number,
  generateThumbnail = false
): Promise<OptimizedImagePayload> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'svg' || ext === 'ico' || ext === 'gif' || ext === 'pdf') {
    return { file };
  }

  try {
    const { img, objectUrl } = await loadImageDimensions(file);
    try {
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;

      if (origW < 16 || origH < 16) {
        throw new Error('ছবির রেজোলিউশন অত্যন্ত ছোট (ন্যূনতম ১৬×১৬ পিক্সেল প্রয়োজন)।');
      }

      let targetW = origW;
      let targetH = origH;
      if (origW > maxDimension || origH > maxDimension) {
        if (origW >= origH) {
          targetW = maxDimension;
          targetH = Math.round((origH * maxDimension) / origW);
        } else {
          targetH = maxDimension;
          targetW = Math.round((origW * maxDimension) / origH);
        }
      }

      const quality = folder === 'branding' ? 0.9 : 0.85;
      const webpBlob = await renderCanvasBlob(img, targetW, targetH, 'image/webp', quality);

      let finalFile = file;
      if (webpBlob && (webpBlob.size < file.size || ext !== 'webp' || targetW !== origW)) {
        const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
        finalFile = new File([webpBlob], `${baseName}.webp`, { type: 'image/webp' });
      }

      let thumbFile: File | undefined;
      if (generateThumbnail && (targetW > 420 || targetH > 420)) {
        const thumbMax = 360;
        const tW = origW >= origH ? thumbMax : Math.round((origW * thumbMax) / origH);
        const tH = origH > origW ? thumbMax : Math.round((origH * thumbMax) / origW);
        const thumbBlob = await renderCanvasBlob(img, tW, tH, 'image/webp', 0.78);
        if (thumbBlob) {
          const baseName = file.name.replace(/\.[^.]+$/, '') || 'thumb';
          thumbFile = new File([thumbBlob], `${baseName}_thumb.webp`, { type: 'image/webp' });
        }
      }

      return {
        file: finalFile,
        thumbnail: thumbFile,
        width: targetW,
        height: targetH,
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch (err: any) {
    if (err?.message?.includes('রেজোলিউশন')) {
      throw err;
    }
    return { file };
  }
}

async function getAuthenticatedIdToken(requireStaff: boolean): Promise<string> {
  if (requireStaff && (!auth.currentUser || !isCurrentUserStaffEmail())) {
    await ensureAdminFirebaseAuthSession();
  }
  const current = auth.currentUser;
  if (!current) {
    throw new Error('আপলোড করার জন্য অনুগ্রহ করে আগে লগইন করুন। (Firebase Auth required)');
  }
  return current.getIdToken();
}

function postFormDataWithProgress(
  url: string,
  formData: FormData,
  idToken: string,
  onProgress?: (percent: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
    xhr.timeout = 45000;

    xhr.upload.onprogress = evt => {
      if (evt.lengthComputable && onProgress) {
        const pct = Math.min(88, Math.max(12, Math.round((evt.loaded / evt.total) * 85)));
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      let data: any = {};
      try {
        data = JSON.parse(xhr.responseText || '{}');
      } catch {
        data = { error: xhr.responseText || `HTTP ${xhr.status}` };
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.success) {
        resolve(data);
      } else {
        reject(new Error(data?.errorBn || data?.error || `R2 upload failed (HTTP ${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error('R2 সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে।'));
    xhr.ontimeout = () => reject(new Error('ফাইল আপলোড সময়সীমা অতিক্রম করেছে। আবার চেষ্টা করুন।'));
    xhr.send(formData);
  });
}

async function saveMediaAssetMetadataToFirestore(record: MediaAssetRecord): Promise<void> {
  const path = `media_assets/${record.fileId}`;
  try {
    await setDoc(doc(db, 'media_assets', record.fileId), cleanFirestorePayload(record));
    recordDatabaseWrite();
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

async function deleteR2ObjectByKey(objectKey: string, idToken: string): Promise<void> {
  const encoded = objectKey.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(`/api/storage/file/${encoded}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok && res.status !== 404) {
    const body = await res.json().catch(() => ({})) as any;
    throw new Error(body?.error || `Failed to delete R2 object (${res.status})`);
  }
}

/**
 * Primary R2 upload pipeline:
 * Validates -> Optimizes WebP + Optional Thumb -> Uploads to Worker R2 API -> Saves Firestore metadata -> Rolls back orphan R2 object on DB failure.
 */
export async function uploadAssetToR2(
  file: File,
  folder: StorageFolder,
  assetPrefix: string,
  maxDimension = 1000,
  onProgress?: (percent: number) => void,
  options?: { entityId?: string; isPrivate?: boolean; generateThumbnail?: boolean }
): Promise<UploadAssetResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const validExtSet = folder === 'documents' ? DOC_EXTENSIONS : IMAGE_EXTENSIONS;

  if (!ext || !validExtSet.has(ext)) {
    throw new Error(
      `ফাইল ফরম্যাট গ্রহণযোগ্য নয় (.${ext || 'unknown'})। PNG, JPG, WebP বা অনুমোদিত ফরম্যাট দিন।`
    );
  }

  const maxBytes = folder === 'documents' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      `ফাইলের আকার সর্বোচ্চ ${Math.round(maxBytes / (1024 * 1024))} মেগাবাইট হতে পারবে।`
    );
  }

  if (ext === 'svg') {
    const svgText = await file.text();
    if (!isSafeSvg(svgText)) {
      throw new Error('নিরাপত্তা ঝুঁকি: SVG ফাইলে ক্ষতিকর স্ক্রিপ্ট বা কোড শনাক্ত হয়েছে।');
    }
  }

  if (onProgress) onProgress(8);

  const optimized = await optimizeImageForR2(
    file,
    folder,
    maxDimension,
    Boolean(options?.generateThumbnail)
  );

  const requireStaff = folder !== 'support';
  const idToken = await getAuthenticatedIdToken(requireStaff);

  const formData = new FormData();
  formData.append('file', optimized.file);
  formData.append('folder', folder);
  formData.append('prefix', assetPrefix);
  formData.append('entityId', options?.entityId || assetPrefix);
  if (options?.isPrivate) {
    formData.append('isPrivate', 'true');
  }
  if (optimized.thumbnail) {
    formData.append('thumbnail', optimized.thumbnail);
  }

  const uploadRes = await postFormDataWithProgress(
    '/api/storage/upload',
    formData,
    idToken,
    onProgress
  );

  if (onProgress) onProgress(92);

  const metadataRecord: MediaAssetRecord = {
    fileId: uploadRes.fileId,
    fileName: uploadRes.fileName,
    objectKey: uploadRes.objectKey,
    publicUrl: uploadRes.publicUrl,
    ...(uploadRes.thumbnailKey ? { thumbnailKey: uploadRes.thumbnailKey } : {}),
    ...(uploadRes.thumbnailUrl ? { thumbnailUrl: uploadRes.thumbnailUrl } : {}),
    contentType: uploadRes.contentType,
    fileSize: Number(uploadRes.fileSize),
    ...(optimized.width ? { width: optimized.width } : {}),
    ...(optimized.height ? { height: optimized.height } : {}),
    folder,
    entityId: options?.entityId || assetPrefix,
    visibility: uploadRes.visibility === 'private' ? 'private' : 'public',
    storageBackend: 'cloudflare_r2',
    uploadedByUid: uploadRes.uploadedByUid || auth.currentUser?.uid || '',
    uploadedByEmail: uploadRes.uploadedByEmail || auth.currentUser?.email || '',
    createdAt: uploadRes.createdAt || new Date().toISOString(),
  };

  try {
    await saveMediaAssetMetadataToFirestore(metadataRecord);
  } catch (dbErr) {
    // Transactional orphan rollback on R2 if Firestore metadata write fails
    await deleteR2ObjectByKey(uploadRes.objectKey, idToken).catch(() => {});
    if (uploadRes.thumbnailKey) {
      await deleteR2ObjectByKey(uploadRes.thumbnailKey, idToken).catch(() => {});
    }
    throw dbErr;
  }

  if (onProgress) onProgress(100);

  return {
    fileId: uploadRes.fileId,
    downloadUrl: uploadRes.publicUrl,
    thumbnailUrl: uploadRes.thumbnailUrl,
    storagePath: uploadRes.objectKey,
    storageType: 'cloudflare_r2',
    fileSize: Number(uploadRes.fileSize),
    width: optimized.width,
    height: optimized.height,
    contentType: uploadRes.contentType,
  };
}

/**
 * Deletes ONLY Cloudflare R2 objects when no longer referenced.
 * Safety Policy: NEVER deletes legacy Firebase Storage (`firebasestorage.*`) files automatically.
 */
export async function cleanupUnusedR2Asset(
  oldUrl?: string,
  remainingUrlsInUse: string[] = []
): Promise<void> {
  if (!oldUrl || typeof oldUrl !== 'string') return;
  const trimmed = oldUrl.trim();
  if (!trimmed || trimmed.startsWith('data:') || remainingUrlsInUse.includes(trimmed)) return;

  // Preserve old Firebase Storage files unless manually migrated & cleaned up separately
  if (isLegacyFirebaseStorageUrl(trimmed)) return;

  const objectKey = extractR2ObjectKeyFromUrl(trimmed);
  if (!objectKey) return;

  try {
    const idToken = await getAuthenticatedIdToken(true);
    await deleteR2ObjectByKey(objectKey, idToken);

    // Clean up matching media_assets metadata record if known
    const parts = objectKey.split('/');
    if (parts.length >= 2) {
      const filePart = parts[parts.length - 1].replace(/\.[^.]+$/, '');
      const segments = filePart.split('_');
      if (segments.length >= 2) {
        const ts = segments[segments.length - 2];
        const rand = segments[segments.length - 1];
        const fileId = `${parts[0]}_${ts}_${rand}`;
        await deleteDoc(doc(db, 'media_assets', fileId)).catch(() => {});
      }
    }
  } catch (err: any) {
    console.warn('Non-fatal R2 cleanup notice:', err?.message || err);
  }
}

export async function migrateLegacyAssetToR2(params: {
  sourceUrl: string;
  folder: StorageFolder;
  prefix: string;
  entityId: string;
}): Promise<UploadAssetResult> {
  const idToken = await getAuthenticatedIdToken(true);
  const res = await fetch('/api/storage/migrate-legacy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(params),
  });

  const data = (await res.json()) as any;
  if (!res.ok || !data?.success) {
    throw new Error(data?.errorBn || data?.error || `Migration failed (${res.status})`);
  }

  const record: MediaAssetRecord = {
    fileId: data.fileId,
    fileName: data.fileName,
    objectKey: data.objectKey,
    publicUrl: data.publicUrl,
    contentType: data.contentType,
    fileSize: Number(data.fileSize),
    folder: params.folder,
    entityId: params.entityId,
    visibility: 'public',
    storageBackend: 'cloudflare_r2',
    uploadedByUid: auth.currentUser?.uid || '',
    uploadedByEmail: auth.currentUser?.email || '',
    createdAt: data.createdAt || new Date().toISOString(),
  };

  try {
    await saveMediaAssetMetadataToFirestore(record);
  } catch (dbErr) {
    await deleteR2ObjectByKey(data.objectKey, idToken).catch(() => {});
    throw dbErr;
  }

  return {
    fileId: data.fileId,
    downloadUrl: data.publicUrl,
    storagePath: data.objectKey,
    storageType: 'cloudflare_r2',
    fileSize: Number(data.fileSize),
    contentType: data.contentType,
  };
}

export async function fetchMediaAssetsFromFirestore(maxItems = 60): Promise<MediaAssetRecord[]> {
  try {
    const q = query(collection(db, 'media_assets'), orderBy('createdAt', 'desc'), limit(maxItems));
    const snap = await getDocs(q);
    recordDatabaseRead();
    return snap.docs.map(d => d.data() as MediaAssetRecord);
  } catch (err) {
    recordDatabaseError(err);
    return [];
  }
}

export async function checkR2StorageStatus(): Promise<StorageStatusResponse> {
  const res = await fetch('/api/storage/status', { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Storage health check returned HTTP ${res.status}`);
  }
  return res.json() as Promise<StorageStatusResponse>;
}

export async function uploadBrandingAsset(
  file: File,
  assetType: 'logo' | 'mobile_logo' | 'favicon',
  onProgress?: (percent: number) => void
): Promise<UploadAssetResult> {
  const maxDim = assetType === 'favicon' ? 128 : assetType === 'mobile_logo' ? 320 : 640;
  return uploadAssetToR2(file, 'branding', assetType, maxDim, onProgress, {
    entityId: `branding_${assetType}`,
  });
}

export async function uploadCategoryIcon(
  file: File,
  categoryId = 'category',
  onProgress?: (percent: number) => void
): Promise<UploadAssetResult> {
  return uploadAssetToR2(file, 'categories', `icon_${categoryId}`, 512, onProgress, {
    entityId: categoryId,
  });
}

export async function uploadHeroBannerImage(
  file: File,
  bannerId = 'hero',
  onProgress?: (percent: number) => void
): Promise<UploadAssetResult> {
  return uploadAssetToR2(file, 'banners', `hero_${bannerId}`, 1600, onProgress, {
    entityId: bannerId,
    generateThumbnail: true,
  });
}

export async function uploadProductImage(
  file: File,
  productId = 'product',
  onProgress?: (percent: number) => void
): Promise<UploadAssetResult> {
  return uploadAssetToR2(file, 'products', `prod_${productId}`, 1200, onProgress, {
    entityId: productId,
    generateThumbnail: true,
  });
}
