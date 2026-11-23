import React, { useEffect, useMemo, useState } from 'react';
import {
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowRightLeft,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import {
  checkR2StorageStatus,
  cleanupUnusedR2Asset,
  fetchMediaAssetsFromFirestore,
  isLegacyFirebaseStorageUrl,
  migrateLegacyAssetToR2,
  StorageStatusResponse,
} from '../../lib/r2Storage';
import type { MediaAssetRecord, StorageFolder } from '../../types';

interface LegacyAssetEntry {
  id: string;
  sourceType: 'product' | 'category_icon' | 'category_banner' | 'hero_banner' | 'branding' | 'livechat' | 'seo';
  entityId: string;
  label: string;
  folder: StorageFolder;
  field: string;
  url: string;
  kind: 'firebase_storage' | 'base64_legacy';
}

export const R2StorageManagerPanel: React.FC = () => {
  const {
    products,
    categories,
    heroBanners,
    websiteSettings,
    liveChatSettings,
    seoSettings,
    updateProduct,
    updateCategory,
    updateHeroBanner,
    saveBrandingToRemote,
    updateLiveChatSettings,
    updateSeoSettings,
    currentRole,
  } = useShop();

  const isAdmin = currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN';

  const [r2Status, setR2Status] = useState<StorageStatusResponse | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetRecord[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [migratingId, setMigratingId] = useState<string | null>(null);
  const [batchMigrating, setBatchMigrating] = useState(false);
  const [migrationLog, setMigrationLog] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadStorageDashboard = async () => {
    setCheckingStatus(true);
    setLoadingAssets(true);
    try {
      const [statusRes, assets] = await Promise.all([
        checkR2StorageStatus().catch(() => null),
        fetchMediaAssetsFromFirestore(40),
      ]);
      if (statusRes) setR2Status(statusRes);
      setMediaAssets(assets);
    } finally {
      setCheckingStatus(false);
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    loadStorageDashboard();
  }, []);

  // Audit all live Firestore entities for any legacy Firebase Storage URLs or Base64 data URLs
  const legacyAssets = useMemo<LegacyAssetEntry[]>(() => {
    const items: LegacyAssetEntry[] = [];

    const classify = (url?: string): 'firebase_storage' | 'base64_legacy' | null => {
      if (!url || typeof url !== 'string') return null;
      const trimmed = url.trim();
      if (!trimmed) return null;
      if (isLegacyFirebaseStorageUrl(trimmed)) return 'firebase_storage';
      if (trimmed.startsWith('data:image/')) return 'base64_legacy';
      return null;
    };

    for (const p of products) {
      (p.images || []).forEach((imgUrl, idx) => {
        const kind = classify(imgUrl);
        if (kind) {
          items.push({
            id: `prod_${p.id}_${idx}`,
            sourceType: 'product',
            entityId: p.id,
            label: `${p.nameBn || p.name} (ছবি ${idx + 1})`,
            folder: 'products',
            field: `images[${idx}]`,
            url: imgUrl,
            kind,
          });
        }
      });
    }

    for (const c of categories) {
      const iconKind = classify(c.icon);
      if (iconKind) {
        items.push({
          id: `caticon_${c.id}`,
          sourceType: 'category_icon',
          entityId: c.id,
          label: `${c.nameBn || c.name} (আইকন)`,
          folder: 'categories',
          field: 'icon',
          url: c.icon,
          kind: iconKind,
        });
      }
      const bannerKind = classify(c.bannerImage);
      if (bannerKind) {
        items.push({
          id: `catbanner_${c.id}`,
          sourceType: 'category_banner',
          entityId: c.id,
          label: `${c.nameBn || c.name} (ব্যানার)`,
          folder: 'banners',
          field: 'bannerImage',
          url: c.bannerImage,
          kind: bannerKind,
        });
      }
    }

    for (const b of heroBanners) {
      const bKind = classify(b.image);
      if (bKind) {
        items.push({
          id: `hero_${b.id}`,
          sourceType: 'hero_banner',
          entityId: String(b.id),
          label: `হিরো ব্যানার: ${b.titleBn || b.titleEn}`,
          folder: 'banners',
          field: 'image',
          url: b.image,
          kind: bKind,
        });
      }
    }

    const brandingPairs: Array<[string, string | undefined, string]> = [
      ['website_logo', websiteSettings.logoUrl, 'ওয়েবসাইট লোগো'],
      ['mobile_logo', websiteSettings.mobileLogoUrl, 'মোবাইল লোগো'],
      ['favicon', websiteSettings.faviconUrl, 'ফেভিকন'],
    ];
    for (const [key, url, label] of brandingPairs) {
      const k = classify(url);
      if (k && url) {
        items.push({
          id: `branding_${key}`,
          sourceType: 'branding',
          entityId: key,
          label,
          folder: 'branding',
          field: key,
          url,
          kind: k,
        });
      }
    }

    const avatarKind = classify(liveChatSettings.agentAvatarUrl);
    if (avatarKind && liveChatSettings.agentAvatarUrl) {
      items.push({
        id: 'livechat_avatar',
        sourceType: 'livechat',
        entityId: 'agent_avatar',
        label: 'লাইভ চ্যাট এজেন্ট প্রোফাইল ছবি',
        folder: 'branding',
        field: 'agentAvatarUrl',
        url: liveChatSettings.agentAvatarUrl,
        kind: avatarKind,
      });
    }

    const ogKind = classify(seoSettings.ogImageUrl);
    if (ogKind && seoSettings.ogImageUrl) {
      items.push({
        id: 'seo_og',
        sourceType: 'seo',
        entityId: 'og_image',
        label: 'SEO OpenGraph শেয়ার ইমেজ',
        folder: 'branding',
        field: 'ogImageUrl',
        url: seoSettings.ogImageUrl,
        kind: ogKind,
      });
    }

    return items;
  }, [products, categories, heroBanners, websiteSettings, liveChatSettings, seoSettings]);

  const handleExportLegacyBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      projectId: 'jotpotshop',
      totalLegacyReferences: legacyAssets.length,
      items: legacyAssets,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jotpotshop-legacy-storage-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMigrationLog({
      type: 'info',
      text: `${legacyAssets.length}টি লিগ্যাসি ফাইলের ব্যাকআপ JSON ডাউনলোড সম্পন্ন হয়েছে।`,
    });
  };

  const migrateSingleEntry = async (entry: LegacyAssetEntry): Promise<boolean> => {
    if (!isAdmin) return false;
    setMigratingId(entry.id);
    try {
      const migrated = await migrateLegacyAssetToR2({
        sourceUrl: entry.url,
        folder: entry.folder,
        prefix: entry.entityId,
        entityId: entry.entityId,
      });

      // Verify uploaded R2 object actually serves cleanly via same-origin Worker route before updating DB reference
      const encodedStoragePath = migrated.storagePath
        .split('/')
        .map(part => encodeURIComponent(part))
        .join('/');
      const verifyRes = await fetch(`/api/storage/file/${encodedStoragePath}`, { method: 'GET' });
      if (!verifyRes.ok) {
        throw new Error(`R2 verification read failed (HTTP ${verifyRes.status})`);
      }

      if (entry.sourceType === 'product') {
        const prod = products.find(p => p.id === entry.entityId);
        if (prod) {
          const idxMatch = entry.field.match(/images\[(\d+)\]/);
          const idx = idxMatch ? Number(idxMatch[1]) : 0;
          const nextImages = [...(prod.images || [])];
          nextImages[idx] = migrated.downloadUrl;
          await updateProduct({ ...prod, images: nextImages });
        }
      } else if (entry.sourceType === 'category_icon') {
        const cat = categories.find(c => c.id === entry.entityId);
        if (cat) await updateCategory({ ...cat, icon: migrated.downloadUrl });
      } else if (entry.sourceType === 'category_banner') {
        const cat = categories.find(c => c.id === entry.entityId);
        if (cat) await updateCategory({ ...cat, bannerImage: migrated.downloadUrl });
      } else if (entry.sourceType === 'hero_banner') {
        const banner = heroBanners.find(b => String(b.id) === entry.entityId);
        if (banner) {
          await updateHeroBanner({
            ...banner,
            image: migrated.downloadUrl,
            imageStoragePath: migrated.storagePath,
          });
        }
      } else if (entry.sourceType === 'branding') {
        if (entry.field === 'website_logo') {
          await saveBrandingToRemote({ logoUrl: migrated.downloadUrl, logoStoragePath: migrated.storagePath });
        } else if (entry.field === 'mobile_logo') {
          await saveBrandingToRemote({ mobileLogoUrl: migrated.downloadUrl });
        } else if (entry.field === 'favicon') {
          await saveBrandingToRemote({ faviconUrl: migrated.downloadUrl });
        }
      } else if (entry.sourceType === 'livechat') {
        await updateLiveChatSettings({ agentAvatarUrl: migrated.downloadUrl });
      } else if (entry.sourceType === 'seo') {
        await updateSeoSettings({ ogImageUrl: migrated.downloadUrl });
      }

      setMigrationLog({
        type: 'success',
        text: `"${entry.label}" সফলভাবে Cloudflare R2-তে মাইগ্রেট ও যাচাই সম্পন্ন হয়েছে। পুরনো ফাইল অপরিবর্তিত রাখা হয়েছে।`,
      });
      return true;
    } catch (err: any) {
      setMigrationLog({
        type: 'error',
        text: `"${entry.label}" মাইগ্রেশন ব্যর্থ: ${err?.message || 'Unknown error'}`,
      });
      return false;
    } finally {
      setMigratingId(null);
    }
  };

  const handleBatchMigrate = async () => {
    if (!isAdmin || legacyAssets.length === 0) return;
    setBatchMigrating(true);
    let okCount = 0;
    let failCount = 0;

    for (const item of legacyAssets) {
      const ok = await migrateSingleEntry(item);
      if (ok) okCount++;
      else failCount++;
    }

    await loadStorageDashboard();
    setBatchMigrating(false);
    setMigrationLog({
      type: failCount === 0 ? 'success' : 'info',
      text: `মাইগ্রেশন সারাংশ: ${okCount}টি সফল, ${failCount}টি ব্যর্থ। (নিরাপত্তার স্বার্থে পুরনো Firebase Storage ফাইল ডিলিট করা হয়নি।)`,
    });
  };

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleDeleteR2Media = async (asset: MediaAssetRecord) => {
    if (!isAdmin) return;
    const deleted = await cleanupUnusedR2Asset(asset.publicUrl, []);
    if (!deleted) {
      setMigrationLog({
        type: 'error',
        text: `R2 ফাইল (${asset.objectKey}) মুছে ফেলা যায়নি। আপনার এডমিন সেশন বা R2 সংযোগ পরীক্ষা করুন।`,
      });
      return;
    }
    setMediaAssets(prev => prev.filter(m => m.fileId !== asset.fileId));
    setMigrationLog({
      type: 'info',
      text: `R2 ফাইল (${asset.objectKey}) মুছে ফেলা হয়েছে।`,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e6e3dd] p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e3dd]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#111827] text-white flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-[#111827]">
                Cloudflare R2 Storage ও লিগ্যাসি মাইগ্রেশন
              </h4>
              <span
                className={`text-[11px] font-semibold inline-flex items-center gap-1 ${
                  r2Status?.ok ? 'text-[#15803d]' : 'text-[#b91c1c]'
                }`}
              >
                {r2Status?.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>{r2Status?.ok ? 'R2 সংযুক্ত ও সচল' : 'পরীক্ষা চলছে'}</span>
              </span>
            </div>
            <p className="text-xs text-[#6b7280] mt-0.5 tabular-nums">
              Bucket: <span className="font-mono font-semibold text-[#111827]">jotpotshop</span>
              <span className="mx-1.5">·</span>
              Mode: <span className="font-mono">{r2Status?.bindingType || 'cloudflare_r2_native'}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadStorageDashboard}
          disabled={checkingStatus}
          className="min-h-[38px] px-3.5 py-2 rounded-xl border border-[#e6e3dd] bg-[#faf9f7] hover:bg-gray-100 text-[#111827] font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
          <span>R2 স্ট্যাটাস রিফ্রেশ</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {migrationLog && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium ${
            migrationLog.type === 'success'
              ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]'
              : migrationLog.type === 'error'
              ? 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]'
              : 'bg-[#faf9f7] border-[#e6e3dd] text-[#111827]'
          }`}
        >
          {migrationLog.text}
        </div>
      )}

      {/* Legacy Audit & Migration Controls */}
      <div className="bg-[#faf9f7] rounded-xl border border-[#e6e3dd] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h5 className="font-bold text-xs sm:text-sm text-[#111827]">
              পুরনো Firebase Storage / Base64 ইমেজ অডিট ({legacyAssets.length}টি পাওয়া গেছে)
            </h5>
            <p className="text-[11px] text-[#6b7280] mt-0.5">
              নতুন সব আপলোড সরাসরি Cloudflare R2-তে সংরক্ষিত হয়। পুরনো লিংক নিরাপদে যাচাইসহ R2-তে স্থানান্তর করুন।
            </p>
          </div>

          {legacyAssets.length > 0 && isAdmin && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportLegacyBackup}
                className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#e6e3dd] bg-white hover:bg-gray-50 text-[#111827] font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ব্যাকআপ JSON</span>
              </button>
              <button
                type="button"
                onClick={handleBatchMigrate}
                disabled={batchMigrating || migratingId !== null}
                className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#881337] hover:bg-[#6d0f2c] disabled:opacity-50 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRightLeft className={`w-3.5 h-3.5 ${batchMigrating ? 'animate-spin' : ''}`} />
                <span>{batchMigrating ? 'মাইগ্রেট হচ্ছে...' : 'সবগুলো R2-তে নিন'}</span>
              </button>
            </div>
          )}
        </div>

        {legacyAssets.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-[#15803d] font-medium pt-1">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>সব সক্রিয় প্রোডাক্ট, ক্যাটাগরি ও ব্র্যান্ডিং ইমেজ পরিচ্ছন্ন অবস্থায় রয়েছে। কোনো অনিষ্পন্ন Firebase Storage লিংক নেই।</span>
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto divide-y divide-[#e6e3dd] bg-white rounded-xl border border-[#e6e3dd]">
            {legacyAssets.map(entry => (
              <div key={entry.id} className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={entry.url}
                    alt={entry.label}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover border border-[#e6e3dd] shrink-0 bg-[#faf9f7]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#111827] truncate">{entry.label}</p>
                    <p className="text-[10px] font-mono text-[#6b7280] truncate">
                      {entry.kind === 'firebase_storage' ? 'Firebase Storage URL' : 'Base64 Legacy'} · /{entry.folder}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    disabled={migratingId === entry.id || batchMigrating}
                    onClick={() => migrateSingleEntry(entry).then(loadStorageDashboard)}
                    className="min-h-[32px] px-3 py-1 rounded-lg bg-[#111827] hover:bg-black disabled:opacity-50 text-white text-[11px] font-semibold shrink-0 cursor-pointer"
                  >
                    {migratingId === entry.id ? 'হচ্ছে...' : 'R2-তে নিন'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* R2 Media Registry List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h5 className="font-bold text-xs text-[#111827]">
            সাম্প্রতিক Cloudflare R2 মিডিয়া রেজিস্ট্রি ({mediaAssets.length})
          </h5>
          <span className="text-[11px] text-[#6b7280] font-mono">Firestore: media_assets/*</span>
        </div>

        {loadingAssets ? (
          <p className="text-xs text-[#6b7280] py-3">লোড হচ্ছে...</p>
        ) : mediaAssets.length === 0 ? (
          <p className="text-xs text-[#6b7280] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl p-3">
            এখনও কোনো নতুন ফাইল R2-তে আপলোড করা হয়নি। প্রোডাক্ট, ক্যাটাগরি বা লোগো আপলোড করলে এখানে যুক্ত হবে।
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto divide-y divide-[#e6e3dd] rounded-xl border border-[#e6e3dd]">
            {mediaAssets.map(asset => (
              <div key={asset.fileId} className="p-3 flex items-center justify-between gap-3 hover:bg-[#faf9f7]">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={asset.thumbnailUrl || asset.publicUrl}
                    alt={asset.fileName}
                    className="w-10 h-10 rounded-lg object-cover border border-[#e6e3dd] shrink-0 bg-white"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#111827] truncate">{asset.objectKey}</p>
                    <p className="text-[11px] text-[#6b7280] font-mono tabular-nums">
                      {(asset.fileSize / 1024).toFixed(1)} KB · {asset.contentType}
                      {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(asset.publicUrl, asset.fileId)}
                    title="লিংক কপি করুন"
                    className="p-2 rounded-lg border border-[#e6e3dd] bg-white hover:bg-gray-50 text-[#374151] cursor-pointer"
                  >
                    {copiedKey === asset.fileId ? <Check className="w-3.5 h-3.5 text-[#15803d]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={asset.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="খুলে দেখুন"
                    className="p-2 rounded-lg border border-[#e6e3dd] bg-white hover:bg-gray-50 text-[#374151]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteR2Media(asset)}
                      title="R2 থেকে মুছুন"
                      className="p-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] hover:bg-red-100 text-[#b91c1c] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
