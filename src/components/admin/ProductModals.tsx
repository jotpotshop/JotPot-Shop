import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Trash2,
  Save,
  AlertTriangle,
  Package,
  Sparkles,
  Tag,
  DollarSign,
  Layers,
  Image as ImageIcon,
  CheckCircle,
  Edit3,
  Percent,
  Check,
  Sliders,
  RefreshCw,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Product, NeedTag } from '../../types';
import { OCCASIONS_LIST, detectProductOccasions } from '../../data/occasionsData';
import { uploadProductImage, cleanupUnusedR2Asset } from '../../lib/r2Storage';
import { useShop } from '../../context/ShopContext';
import { RichTextEditor } from './RichTextEditor';

// -------------------------------------------------------------
// 1. PRODUCT ADD MODAL (Complete, Robust & Persistent)
// -------------------------------------------------------------
export interface ProductAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<{ success: boolean; error?: string }>;
}

export const ProductAddModal: React.FC<ProductAddModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [category, setCategory] = useState('men-fashion');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('JotPot Brand');
  const [sku, setSku] = useState(() => `JPS-${Math.floor(100000 + Math.random() * 900000)}`);
  const [price, setPrice] = useState<number | ''>(850);
  const [oldPrice, setOldPrice] = useState<number | ''>(1150);
  const [costPrice, setCostPrice] = useState<number | ''>(500);
  const [stock, setStock] = useState<number | ''>(20);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [colors, setColors] = useState('');
  const [sizes, setSizes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState(
    '<h2>Product Overview</h2><p>Premium crafted product designed for comfort, longevity, and everyday elegance. High-grade stitching and durable materials ensure supreme satisfaction.</p><h3>Key Highlights</h3><ul><li>Finest selected materials</li><li>Comfortable fit and breathable construction</li><li>Easy to wash and maintain</li></ul>'
  );
  const [descriptionBn, setDescriptionBn] = useState(
    '<h2>পণ্যের মূল বৈশিষ্ট্য</h2><p>১০০% প্রিমিয়াম সুতি ও আরামদায়ক টেক্সচার দিয়ে তৈরি। দৈনন্দিন অফিস, ক্যাজুয়াল কিংবা বিশেষ অনুষ্ঠানে পরার জন্য উপযুক্ত। সহজে ধোয়া যায় এবং দীর্ঘস্থায়ী রং গ্যারান্টি।</p><h3>কেন এটি কিনবেন?</h3><ul><li>উন্নত ফিনিশিং ও নিখুঁত সেলাই</li><li>সারাদিনের সর্বোচ্চ আরাম ও স্বস্তি</li><li>প্রি-ওয়াশড থাকায় ধোয়ার পর সংকুচিত হবে না</li></ul>'
  );
  const [descLangTab, setDescLangTab] = useState<'bn' | 'en'>('bn');
  const { categories: storeCategories } = useShop();
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(true);
  const [isTrending, setIsTrending] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [needTags, setNeedTags] = useState<NeedTag[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when reopened
  useEffect(() => {
    if (isOpen) {
      setSku(`JPS-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsPublished(true);
      setSaveError(null);
      setUploadError(null);
      setUploadProgress(null);
      setValidationErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previousUrl = imageUrl;
      setIsUploading(true);
      setUploadProgress(5);
      setUploadError(null);
      try {
        const uploadResult = await uploadProductImage(
          file,
          `${Date.now()}`,
          pct => setUploadProgress(pct)
        );
        setImageUrl(uploadResult.downloadUrl);
        if (previousUrl && previousUrl !== uploadResult.downloadUrl) {
          cleanupUnusedR2Asset(previousUrl, [uploadResult.downloadUrl]).catch(() => {});
        }
      } catch (err: any) {
        setUploadError(
          err?.message || 'Cloudflare R2-তে ছবি আপলোড ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    }
  };

  const handleGenerateSku = () => {
    const catCode = category.substring(0, 3).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setSku(`JPS-${catCode}-${rand}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    // Validation
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'ইংরেজি নাম প্রদান করা বাধ্যতামূলক';
    if (!nameBn.trim()) errors.nameBn = 'বাংলা নাম প্রদান করা বাধ্যতামূলক';
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) errors.price = 'সঠিক বিক্রয় মূল্য (> 0) প্রদান করুন';
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) errors.stock = 'সঠিক স্টক পরিমাণ (>= 0) লিখুন';
    if (!imageUrl.trim()) errors.imageUrl = 'পণ্যের ছবি আপলোড করা বা লিংক দেওয়া বাধ্যতামূলক';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsSaving(true);

    const numOldPrice = Number(oldPrice) || 0;
    const discountP =
      numOldPrice > numPrice && numOldPrice > 0
        ? Math.round(((numOldPrice - numPrice) / numOldPrice) * 100)
        : 0;

    const catObj = storeCategories.find(c => c.id === category);

    const newProd: Product = {
      id: `jps-prod-${Date.now()}`,
      name: name.trim(),
      nameBn: nameBn.trim(),
      category,
      categoryBn: catObj?.nameBn || 'ফ্যাশন',
      subcategory: subcategory.trim() || 'General',
      subcategoryBn: subcategory.trim() || 'সাধারণ',
      brand: brand.trim() || 'JotPot Brand',
      sku: sku.trim() || `JPS-${Date.now().toString().slice(-6)}`,
      price: numPrice,
      oldPrice: numOldPrice || undefined,
      discountPercent: discountP || undefined,
      costPrice: Number(costPrice) || 0,
      stock: numStock,
      variantStocks: Object.keys(variantStocks).length > 0 ? variantStocks : undefined,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      colors: colors
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      sizes: sizes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      images: [imageUrl.trim()],
      description: description.trim() || name.trim(),
      descriptionBn: descriptionBn.trim() || nameBn.trim(),
      specifications: {
        'ম্যাটেরিয়াল': '১০০% প্রিমিয়াম কোয়ালিটি',
        'উৎস': 'বাংলাদেশ (Bangladesh)',
        'স্ট্যান্ডার্ড': 'A+ গ্রেড স্ট্যান্ডার্ড',
      },
      warranty: '7 Days Replacement',
      warrantyBn: '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি',
      returnPolicy: '7 Days Easy Return',
      returnPolicyBn: '৭ দিনের সহজ রিটার্ন পলিসি',
      deliveryDays: 'Inside Dhaka 24-48 hrs, Outside 3-5 days',
      deliveryDaysBn: 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ৩-৫ দিন',
      tags: [category, subcategory.toLowerCase(), brand.toLowerCase()].filter(Boolean),
      rating: 5.0,
      reviewsCount: 1,
      isFlashSale,
      isBestSeller,
      isTrending,
      isPublished,
      needTags:
        needTags.length > 0
          ? needTags
          : detectProductOccasions({ name, nameBn, category, subcategory, description }),
      reviews: [],
    };

    try {
      const result = await onSave(newProd);
      if (result.success) {
        onClose();
      } else {
        setSaveError(result.error || 'Firebase-এ পণ্য সংরক্ষণ করতে সমস্যা হয়েছে।');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'সার্ভারে সংযোগ ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden my-auto border border-[#e6e3dd] flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f2937] flex items-center justify-between bg-[#111827] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#881337] flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                নতুন পণ্য যোগ করুন
              </h3>
              <p className="text-xs text-[#d1d5db]">
                ক্যাটালগ ও বিস্তারিত রিচ-টেক্সট বিবরণ সহ পণ্য তৈরি
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9ca3af] hover:text-white rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Error Banner */}
        {saveError && (
          <div className="bg-rose-50 border-b border-rose-200 p-3 px-6 text-xs text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>সংরক্ষণ ব্যর্থ:</strong> {saveError}
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Title Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                পণ্যের নাম (English) *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: '' }));
                }}
                className={`w-full bg-gray-50 border rounded-xl p-2.5 text-xs transition-colors ${
                  validationErrors.name
                    ? 'border-rose-500 bg-rose-50/30'
                    : 'border-gray-200 focus:border-rose-500 focus:bg-white'
                }`}
                placeholder="e.g. Premium Cotton Casual Shirt"
              />
              {validationErrors.name && (
                <p className="text-rose-600 text-[10px] mt-1 font-bold">{validationErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                পণ্যের নাম (বাংলা) *
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={e => {
                  setNameBn(e.target.value);
                  if (validationErrors.nameBn) setValidationErrors(prev => ({ ...prev, nameBn: '' }));
                }}
                className={`w-full bg-gray-50 border rounded-xl p-2.5 text-xs transition-colors ${
                  validationErrors.nameBn
                    ? 'border-rose-500 bg-rose-50/30'
                    : 'border-gray-200 focus:border-rose-500 focus:bg-white'
                }`}
                placeholder="যেমন: প্রিমিয়াম কটন ক্যাজুয়াল শার্ট"
              />
              {validationErrors.nameBn && (
                <p className="text-rose-600 text-[10px] mt-1 font-bold">{validationErrors.nameBn}</p>
              )}
            </div>
          </div>

          {/* Category, Subcategory, Brand, SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">ক্যাটাগরি *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs transition-colors cursor-pointer"
              >
                {storeCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameBn} ({c.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">সাবক্যাটাগরি</label>
              <input
                type="text"
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs transition-colors"
                placeholder="যেমন: শার্ট, প্যান্ট, ওয়াচ"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">ব্র্যান্ড</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs transition-colors"
                placeholder="e.g. JotPot Brand"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-gray-800">SKU কোড</label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer flex items-center space-x-0.5"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>রিলোড</span>
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs font-mono font-bold transition-colors"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-3 rounded-2xl border border-gray-200/60">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                বিক্রয় মূল্য (৳) *
              </label>
              <input
                type="number"
                value={price}
                onChange={e => {
                  setPrice(e.target.value === '' ? '' : Number(e.target.value));
                  if (validationErrors.price) setValidationErrors(prev => ({ ...prev, price: '' }));
                }}
                className={`w-full bg-white border rounded-xl p-2.5 text-xs font-bold text-rose-600 transition-colors ${
                  validationErrors.price ? 'border-rose-500' : 'border-gray-200 focus:border-rose-500'
                }`}
                placeholder="850"
              />
              {validationErrors.price && (
                <p className="text-rose-600 text-[10px] mt-1 font-bold">{validationErrors.price}</p>
              )}
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                পূর্বের মূল্য (৳)
              </label>
              <input
                type="number"
                value={oldPrice}
                onChange={e => setOldPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-gray-200 focus:border-rose-500 rounded-xl p-2.5 text-xs text-gray-500 transition-colors"
                placeholder="1150"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                ক্রয় খরচ (৳)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={e => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-gray-200 focus:border-rose-500 rounded-xl p-2.5 text-xs text-gray-700 transition-colors"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                স্টক পরিমাণ (pcs) *
              </label>
              <input
                type="number"
                value={stock}
                onChange={e => {
                  setStock(e.target.value === '' ? '' : Number(e.target.value));
                  if (validationErrors.stock) setValidationErrors(prev => ({ ...prev, stock: '' }));
                }}
                className={`w-full bg-white border rounded-xl p-2.5 text-xs font-bold text-emerald-600 transition-colors ${
                  validationErrors.stock ? 'border-rose-500' : 'border-gray-200 focus:border-rose-500'
                }`}
                placeholder="20"
              />
              {validationErrors.stock && (
                <p className="text-rose-600 text-[10px] mt-1 font-bold">{validationErrors.stock}</p>
              )}
            </div>
          </div>

          {/* Image Upload & Preview */}
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-gray-800">
                পণ্যের ছবি নির্বাচন (Image Upload) *
              </label>
              <span className="text-[11px] text-gray-400">
                সরাসরি ডিভাইস থেকে আপলোড (স্বয়ংক্রিয় অপ্টিমাইজড)
              </span>
            </div>

            {uploadError && (
              <p className="text-[#991b1b] text-xs font-medium bg-[#fef2f2] p-2.5 rounded-xl border border-[#fecaca] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadError}</span>
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {imageUrl && (
                <div className="relative group shrink-0">
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 object-cover rounded-xl border border-[#e6e3dd] bg-[#faf9f7]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      cleanupUnusedR2Asset(imageUrl, []).catch(() => {});
                      setImageUrl('');
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-[#881337] text-white rounded-full p-1 shadow-sm hover:bg-[#6d0f2c] cursor-pointer"
                    title="ছবি মুছুন"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex-1 w-full space-y-2">
                <label className="border border-dashed border-[#d1d5db] hover:border-[#881337] hover:bg-[#faf9f7] rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-xs font-semibold text-[#374151]">
                      {isUploading
                        ? `ছবি আপলোড হচ্ছে (${uploadProgress ?? 0}%)...`
                        : 'ডিভাইস থেকে পণ্যের ছবি আপলোড করুন'}
                    </span>
                  </div>
                  {isUploading && uploadProgress !== null && (
                    <div className="w-full max-w-xs h-1.5 bg-[#e6e3dd] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#881337] transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={handleImageFileChange}
                  />
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={e => {
                      setImageUrl(e.target.value);
                      if (validationErrors.imageUrl) setValidationErrors(prev => ({ ...prev, imageUrl: '' }));
                    }}
                    placeholder="অথবা সরাসরি ওয়েব ইমেজ লিংক দিন (https://...)"
                    className="w-full bg-[#faf9f7] border border-[#e6e3dd] focus:border-[#881337] focus:bg-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
            {validationErrors.imageUrl && (
              <p className="text-[#991b1b] text-xs font-semibold">{validationErrors.imageUrl}</p>
            )}
          </div>

          {/* DETAILED RICH-TEXT PRODUCT DESCRIPTION */}
          <div className="space-y-2 pt-2 border-t border-[#f3f1ed]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="font-bold text-[#111827] text-xs block">
                  পণ্যের বিস্তারিত রিচ-টেক্সট বিবরণ
                </label>
                <p className="text-xs text-[#6b7280]">
                  হেডিং, বুলেট পয়েন্ট, বোল্ড টেক্সট ও প্যারাগ্রাফ সমর্থন করে
                </p>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1 bg-[#faf9f7] p-1 rounded-xl border border-[#e6e3dd]">
                <button
                  type="button"
                  onClick={() => setDescLangTab('bn')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    descLangTab === 'bn'
                      ? 'bg-[#111827] text-white'
                      : 'text-[#6b7280] hover:text-[#111827]'
                  }`}
                >
                  বাংলা বিবরণ
                </button>
                <button
                  type="button"
                  onClick={() => setDescLangTab('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    descLangTab === 'en'
                      ? 'bg-[#111827] text-white'
                      : 'text-[#6b7280] hover:text-[#111827]'
                  }`}
                >
                  English Description
                </button>
              </div>
            </div>

            {/* Active Rich Text Editor */}
            {descLangTab === 'bn' ? (
              <RichTextEditor
                value={descriptionBn}
                onChange={setDescriptionBn}
                label="বাংলায় পণ্যের বিস্তারিত বৈশিষ্ট্য ও সুবিধা লিখুন"
                placeholder="যেমন: এই পণ্যটি ১০০% আরামদায়ক সুতি কাপড়ে তৈরি..."
                minHeight="170px"
              />
            ) : (
              <RichTextEditor
                value={description}
                onChange={setDescription}
                label="Write Detailed Product Description in English"
                placeholder="Describe key highlights, fabric quality, and sizing advice..."
                minHeight="170px"
              />
            )}
          </div>

          {/* Variants: Colors & Sizes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                রং / Available Colors (কমা দিয়ে লিখুন)
              </label>
              <input
                type="text"
                value={colors}
                onChange={e => setColors(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs"
                placeholder="Black, Navy Blue, Maroon"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                সাইজ / Available Sizes (কমা দিয়ে লিখুন)
              </label>
              <input
                type="text"
                value={sizes}
                onChange={e => setSizes(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs"
                placeholder="M, L, XL, XXL"
              />
            </div>
          </div>

          {/* Variant Stocks Manager */}
          {((colors && colors.trim().length > 0) || (sizes && sizes.trim().length > 0)) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 text-xs">
                  ভ্যারিয়েন্ট ভিত্তিক স্টক বণ্টন (Variant Stock Allocation)
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  প্রতিটি ভ্যারিয়েন্টের আলাদা স্টক সংখ্যা
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pt-1">
                {(() => {
                  const colorList = colors.split(',').map(s => s.trim()).filter(Boolean);
                  const sizeList = sizes.split(',').map(s => s.trim()).filter(Boolean);
                  const keysSet = new Set<string>();

                  if (colorList.length > 0 && sizeList.length > 0) {
                    colorList.forEach(c => {
                      sizeList.forEach(s => keysSet.add(`${c}-${s}`));
                    });
                  } else if (colorList.length > 0) {
                    colorList.forEach(c => keysSet.add(c));
                  } else if (sizeList.length > 0) {
                    sizeList.forEach(s => keysSet.add(s));
                  }

                  const variantKeys = Array.from(keysSet);
                  if (variantKeys.length === 0) return null;

                  return variantKeys.map(k => (
                    <div
                      key={k}
                      className="bg-white border border-gray-200 rounded-xl p-2 flex items-center justify-between gap-1 shadow-2xs"
                    >
                      <span className="text-[11px] font-semibold text-gray-700 truncate" title={k}>
                        {k}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={variantStocks[k] ?? (typeof stock === 'number' ? Math.floor(stock / variantKeys.length) || 5 : 5)}
                        onChange={e => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setVariantStocks(prev => ({ ...prev, [k]: val }));
                        }}
                        className="w-16 bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-0.5 text-xs text-right font-bold text-emerald-700 focus:bg-white focus:border-rose-500 transition-colors"
                      />
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Badges / Promotion Flags */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={e => setIsBestSeller(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
              />
              <span>বেস্ট সেলার (Best Seller)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isFlashSale}
                onChange={e => setIsFlashSale(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
              />
              <span>ফ্ল্যাশ সেল (Flash Sale)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={e => setIsTrending(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
              />
              <span>ট্রেন্ডিং পণ্য (Trending)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span>স্টোরে প্রকাশিত (Published / Live)</span>
            </label>
          </div>

          {/* Occasion / Shop by Need Badges */}
          <div className="space-y-2 pt-3 border-t border-[#f3f1ed]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#111827] flex items-center gap-1.5 text-xs">
                <span>উপলক্ষ ও প্রয়োজন নির্বাচন (আপনার কী প্রয়োজন?)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setNeedTags(
                    detectProductOccasions({ name, nameBn, category, subcategory, description })
                  )
                }
                className="text-xs font-semibold text-[#881337] hover:text-[#6d0f2c] cursor-pointer flex items-center gap-1 bg-[#faf9f7] px-2.5 py-1 rounded-lg border border-[#e6e3dd]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>স্মার্ট অটো-ডিটেক্ট</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS_LIST.map(occ => {
                const isSelected = needTags.includes(occ.id);
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setNeedTags(needTags.filter(t => t !== occ.id));
                      } else {
                        setNeedTags([...needTags, occ.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#111827] text-white border-[#111827]'
                        : 'bg-[#faf9f7] text-[#374151] border-[#e6e3dd] hover:bg-white'
                    }`}
                  >
                    <span>{occ.titleBn}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#34d399]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#f3f1ed] flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-[#e6e3dd] text-[#374151] font-semibold hover:bg-[#faf9f7] cursor-pointer transition-colors"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="min-h-[40px] px-6 py-2 rounded-xl bg-[#881337] hover:bg-[#6d0f2c] disabled:opacity-50 text-white font-semibold cursor-pointer transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>পণ্য সেভ ও লাইভ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. PRODUCT EDIT MODAL (Upgraded with RichTextEditor)
// -------------------------------------------------------------
interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Product) => Promise<boolean | { success: boolean; error?: string } | void> | void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const { categories: storeCategories } = useShop();
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [category, setCategory] = useState('men-fashion');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState(0);
  const [oldPrice, setOldPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [colors, setColors] = useState('');
  const [sizes, setSizes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [descLangTab, setDescLangTab] = useState<'bn' | 'en'>('bn');
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [needTags, setNeedTags] = useState<NeedTag[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setNameBn(product.nameBn || '');
      setCategory(product.category || 'men-fashion');
      setSubcategory(product.subcategory || '');
      setBrand(product.brand || 'JotPot Brand');
      setSku(product.sku || '');
      setPrice(product.price || 0);
      setOldPrice(product.oldPrice || 0);
      setCostPrice(product.costPrice || 0);
      setStock(product.stock || 0);
      setVariantStocks(product.variantStocks ? { ...product.variantStocks } : {});
      setLowStockThreshold(product.lowStockThreshold || 5);
      setColors(product.colors ? product.colors.join(', ') : '');
      setSizes(product.sizes ? product.sizes.join(', ') : '');
      setImageUrl(product.images?.[0] || '');
      setDescription(product.description || '');
      setDescriptionBn(product.descriptionBn || '');
      setIsFlashSale(Boolean(product.isFlashSale));
      setIsBestSeller(Boolean(product.isBestSeller));
      setIsTrending(Boolean(product.isTrending));
      setIsPublished(product.isPublished !== false);
      setNeedTags(
        product.needTags && product.needTags.length > 0
          ? product.needTags
          : detectProductOccasions(product)
      );
      setSaveError(null);
      setUploadError(null);
      setUploadProgress(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previousUrl = imageUrl;
      setIsUploading(true);
      setUploadProgress(5);
      setUploadError(null);
      try {
        const uploadResult = await uploadProductImage(
          file,
          product.id,
          pct => setUploadProgress(pct)
        );
        setImageUrl(uploadResult.downloadUrl);
        if (previousUrl && previousUrl !== uploadResult.downloadUrl) {
          cleanupUnusedR2Asset(previousUrl, [uploadResult.downloadUrl]).catch(() => {});
        }
      } catch (err: any) {
        setUploadError(
          err?.message || 'Cloudflare R2-তে ছবি আপলোড ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaveError(null);
    setIsSaving(true);

    const discountP =
      oldPrice > price && oldPrice > 0
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : 0;

    const catObj = storeCategories.find(c => c.id === category);

    const updatedProduct: Product = {
      ...product,
      name: name.trim(),
      nameBn: nameBn.trim() || name.trim(),
      category,
      categoryBn: catObj?.nameBn || product.categoryBn || 'ফ্যাশন',
      subcategory: subcategory.trim() || product.subcategory,
      subcategoryBn: subcategory.trim() || product.subcategoryBn,
      brand: brand.trim() || product.brand,
      sku: sku.trim() || product.sku,
      price: Number(price),
      oldPrice: Number(oldPrice),
      discountPercent: discountP,
      costPrice: Number(costPrice),
      stock: Number(stock),
      variantStocks: Object.keys(variantStocks).length > 0 ? variantStocks : product.variantStocks,
      lowStockThreshold: Number(lowStockThreshold),
      colors: colors
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      sizes: sizes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      images: imageUrl ? [imageUrl, ...(product.images?.slice(1) || [])] : product.images,
      description: description.trim(),
      descriptionBn: descriptionBn.trim() || description.trim(),
      isFlashSale,
      isBestSeller,
      isTrending,
      isPublished,
      needTags:
        needTags.length > 0
          ? needTags
          : detectProductOccasions({ name, nameBn, category, subcategory, description }),
    };

    try {
      const res = await onSave(updatedProduct);
      if (res === false || (typeof res === 'object' && res !== null && 'success' in res && !res.success)) {
        const errText =
          typeof res === 'object' && res !== null && 'error' in res && res.error
            ? res.error
            : 'Firebase-এ পরিবর্তন সংরক্ষণ করা যায়নি।';
        setSaveError(errText);
      }
    } catch (err: any) {
      setSaveError(err?.message || 'পণ্য আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden my-auto border border-[#e6e3dd] flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f2937] flex items-center justify-between bg-[#111827] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#881337] flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                পণ্য সম্পাদনা (Edit Product)
              </h3>
              <p className="text-[11px] text-[#9ca3af] font-mono tabular-nums">SKU: {product.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9ca3af] hover:text-white rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Error */}
        {saveError && (
          <div className="bg-rose-50 border-b border-rose-200 p-3 px-6 text-xs text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>ত্রুটি:</strong> {saveError}
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Title Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                পণ্যের নাম (English) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs transition-colors"
                placeholder="e.g. Premium Cotton Casual Shirt"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                পণ্যের নাম (বাংলা) *
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={e => setNameBn(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs transition-colors"
                placeholder="যেমন: প্রিমিয়াম কটন ক্যাজুয়াল শার্ট"
              />
            </div>
          </div>

          {/* Category, Subcategory, Brand, SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">ক্যাটাগরি</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs transition-colors cursor-pointer"
              >
                {storeCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameBn} ({c.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">সাবক্যাটাগরি</label>
              <input
                type="text"
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs transition-colors"
                placeholder="e.g. Shirts, Pants"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">ব্র্যান্ড</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs transition-colors"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">SKU কোড</label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs font-mono font-bold transition-colors"
              />
            </div>
          </div>

          {/* Prices & Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-3 rounded-2xl border border-gray-200/60">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                বিক্রয় মূল্য (৳) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full bg-white border border-gray-200 focus:border-rose-500 rounded-xl p-2.5 text-xs font-bold text-rose-600 transition-colors"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                পূর্বের মূল্য (৳)
              </label>
              <input
                type="number"
                value={oldPrice}
                onChange={e => setOldPrice(Number(e.target.value))}
                className="w-full bg-white border border-gray-200 focus:border-rose-500 rounded-xl p-2.5 text-xs text-gray-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                ক্রয় খরচ (৳)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={e => setCostPrice(Number(e.target.value))}
                className="w-full bg-white border border-gray-200 focus:border-rose-500 rounded-xl p-2.5 text-xs text-gray-700 transition-colors"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                বর্তমান স্টক (pcs) *
              </label>
              <input
                type="number"
                required
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                className="w-full bg-white border border-gray-200 focus:border-rose-500 rounded-xl p-2.5 text-xs font-bold text-emerald-600 transition-colors"
              />
            </div>
          </div>

          {/* Image Upload & Preview */}
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <label className="block font-bold text-gray-800">
              পণ্যের ছবি পরিবর্তন (Image Upload / URL)
            </label>
            {uploadError && (
              <p className="text-[#991b1b] text-xs font-medium bg-[#fef2f2] p-2.5 rounded-xl border border-[#fecaca] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadError}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {imageUrl && (
                <div className="relative group shrink-0">
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 object-cover rounded-xl border border-[#e6e3dd] bg-[#faf9f7]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      cleanupUnusedR2Asset(imageUrl, []).catch(() => {});
                      setImageUrl('');
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-[#881337] text-white rounded-full p-1 shadow-sm hover:bg-[#6d0f2c] cursor-pointer"
                    title="ছবি মুছুন"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex-1 w-full space-y-2">
                <label className="border border-dashed border-[#d1d5db] hover:border-[#881337] hover:bg-[#faf9f7] rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-xs font-semibold text-[#374151]">
                      {isUploading
                        ? `ছবি আপলোড হচ্ছে (${uploadProgress ?? 0}%)...`
                        : 'ডিভাইস থেকে নতুন ছবি আপলোড করুন'}
                    </span>
                  </div>
                  {isUploading && uploadProgress !== null && (
                    <div className="w-full max-w-xs h-1.5 bg-[#e6e3dd] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#881337] transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={handleImageFileChange}
                  />
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="অথবা সরাসরি ইমেজ লিংক (https://...)"
                    className="w-full bg-[#faf9f7] border border-[#e6e3dd] focus:border-[#881337] focus:bg-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED RICH-TEXT PRODUCT DESCRIPTION */}
          <div className="space-y-2 pt-2 border-t border-[#f3f1ed]">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-[#111827] text-xs block">
                  পণ্যের বিস্তারিত রিচ-টেক্সট বিবরণ
                </label>
                <p className="text-xs text-[#6b7280]">
                  প্যারাগ্রাফ, হেডিং ও বুলেট পয়েন্ট সহ কাস্টমারদের জন্য সুন্দর বিবরণ
                </p>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1 bg-[#faf9f7] p-1 rounded-xl border border-[#e6e3dd]">
                <button
                  type="button"
                  onClick={() => setDescLangTab('bn')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    descLangTab === 'bn'
                      ? 'bg-[#111827] text-white'
                      : 'text-[#6b7280] hover:text-[#111827]'
                  }`}
                >
                  বাংলা বিবরণ
                </button>
                <button
                  type="button"
                  onClick={() => setDescLangTab('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    descLangTab === 'en'
                      ? 'bg-[#111827] text-white'
                      : 'text-[#6b7280] hover:text-[#111827]'
                  }`}
                >
                  English Description
                </button>
              </div>
            </div>

            {/* Active Rich Text Editor */}
            {descLangTab === 'bn' ? (
              <RichTextEditor
                value={descriptionBn}
                onChange={setDescriptionBn}
                label="বাংলা বিবরণ"
                placeholder="পণ্যের বিস্তারিত বৈশিষ্ট্য, সুবিধা ও মেটেরিয়াল..."
                minHeight="160px"
              />
            ) : (
              <RichTextEditor
                value={description}
                onChange={setDescription}
                label="English Description"
                placeholder="Product highlights, specifications and details..."
                minHeight="160px"
              />
            )}
          </div>

          {/* Variants & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block font-bold text-gray-800 mb-1">রং / Colors (কমা দিয়ে)</label>
              <input
                type="text"
                value={colors}
                onChange={e => setColors(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs"
                placeholder="Black, White, Blue"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">সাইজ / Sizes (কমা দিয়ে)</label>
              <input
                type="text"
                value={sizes}
                onChange={e => setSizes(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs"
                placeholder="M, L, XL, XXL"
              />
            </div>
          </div>

          {/* Variant Stocks Breakdown */}
          {((colors && colors.trim().length > 0) || (sizes && sizes.trim().length > 0) || Object.keys(variantStocks).length > 0) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 text-xs">ভ্যারিয়েন্ট স্টক ম্যানেজমেন্ট (Variant Stocks)</span>
                <span className="text-[10px] text-gray-500 font-medium">প্রতিটি ভ্যারিয়েন্টের আলাদা স্টক পরিমাণ</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pt-1">
                {(() => {
                  const colorList = colors.split(',').map(s => s.trim()).filter(Boolean);
                  const sizeList = sizes.split(',').map(s => s.trim()).filter(Boolean);
                  
                  const keysSet = new Set<string>(Object.keys(variantStocks));
                  if (colorList.length > 0 && sizeList.length > 0) {
                    colorList.forEach(c => {
                      keysSet.add(c);
                      sizeList.forEach(s => keysSet.add(`${c}-${s}`));
                    });
                  } else if (colorList.length > 0) {
                    colorList.forEach(c => keysSet.add(c));
                  } else if (sizeList.length > 0) {
                    sizeList.forEach(s => keysSet.add(s));
                  }
                  
                  const variantKeys = Array.from(keysSet);
                  if (variantKeys.length === 0) {
                    return (
                      <p className="text-[11px] text-gray-400 col-span-3 py-1">কালার বা সাইজ লিখলে এখানে ভ্যারিয়েন্ট স্টক দেখতে পাবেন</p>
                    );
                  }

                  return variantKeys.map(k => (
                    <div key={k} className="bg-white border border-gray-200 rounded-xl p-2 flex items-center justify-between gap-1 shadow-2xs">
                      <span className="text-[11px] font-semibold text-gray-700 truncate" title={k}>{k}</span>
                      <input
                        type="number"
                        min="0"
                        value={variantStocks[k] ?? stock}
                        onChange={e => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setVariantStocks(prev => ({ ...prev, [k]: val }));
                        }}
                        className="w-16 bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-0.5 text-xs text-right font-bold text-emerald-700 focus:bg-white focus:border-rose-500 transition-colors"
                      />
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Badges / Flags */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={e => setIsBestSeller(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
              />
              <span>বেস্ট সেলার (Best Seller)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isFlashSale}
                onChange={e => setIsFlashSale(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
              />
              <span>ফ্ল্যাশ সেল (Flash Sale)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={e => setIsTrending(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
              />
              <span>ট্রেন্ডিং পণ্য (Trending)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span>স্টোরে প্রকাশিত (Published / Live)</span>
            </label>
          </div>

          {/* Occasion / Shop by Need Badges */}
          <div className="space-y-2 pt-3 border-t border-[#f3f1ed]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#111827] flex items-center gap-1.5 text-xs">
                <span>উপলক্ষ ও প্রয়োজন নির্বাচন (আপনার কী প্রয়োজন?)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setNeedTags(
                    detectProductOccasions({ name, nameBn, category, subcategory, description })
                  )
                }
                className="text-xs font-semibold text-[#881337] hover:text-[#6d0f2c] cursor-pointer flex items-center gap-1 bg-[#faf9f7] px-2.5 py-1 rounded-lg border border-[#e6e3dd]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>স্মার্ট অটো-ডিটেক্ট</span>
              </button>
            </div>
            <p className="text-xs text-[#6b7280]">
              যেসব উপলক্ষ টিক দেবেন, স্টোরফ্রন্টে "আপনার কী প্রয়োজন?" ট্যাবে পণ্যটি স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS_LIST.map(occ => {
                const isSelected = needTags.includes(occ.id);
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setNeedTags(needTags.filter(t => t !== occ.id));
                      } else {
                        setNeedTags([...needTags, occ.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#111827] text-white border-[#111827]'
                        : 'bg-[#faf9f7] text-[#374151] border-[#e6e3dd] hover:bg-white'
                    }`}
                  >
                    <span>{occ.titleBn}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#34d399]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#f3f1ed] flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 rounded-xl border border-[#e6e3dd] text-[#374151] font-semibold hover:bg-[#faf9f7] cursor-pointer transition-colors"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="min-h-[40px] px-6 py-2 rounded-xl bg-[#881337] hover:bg-[#6d0f2c] disabled:opacity-50 text-white font-semibold cursor-pointer transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. PRODUCT DELETE CONFIRMATION MODAL
// -------------------------------------------------------------
interface ProductDeleteModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productId: string) => void;
}

export const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-[#e6e3dd] p-6 space-y-5 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-[#111827]">
            পণ্য মুছে ফেলতে চান?
          </h3>
          <p className="text-xs text-[#6b7280] leading-relaxed">
            আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান? এটি মুছে ফেললে গ্রাহক ক্যাটালগ এবং ইনভেন্টরি থেকে স্থায়ীভাবে অপসারিত হবে।
          </p>
        </div>

        <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#e6e3dd] flex items-center gap-3 text-left">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 object-cover rounded-xl border border-[#e6e3dd] shrink-0 bg-white"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white border border-[#e6e3dd] flex items-center justify-center text-[#9ca3af] shrink-0">
              <Package className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0 flex-1 tabular-nums">
            <h4 className="font-bold text-xs text-[#111827] truncate">
              {product.nameBn || product.name}
            </h4>
            <p className="text-[11px] text-[#6b7280] font-mono">
              SKU: {product.sku} · স্টক: {product.stock} পিস
            </p>
            <p className="text-xs font-bold text-[#881337]">
              ৳{product.price}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[40px] py-2 rounded-xl border border-[#e6e3dd] text-[#374151] font-semibold hover:bg-[#faf9f7] cursor-pointer transition-colors text-xs"
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            onClick={() => onConfirm(product.id)}
            className="flex-1 min-h-[40px] py-2 rounded-xl bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-semibold cursor-pointer transition-colors text-xs flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>হ্যাঁ, মুছে ফেলুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. BULK PRODUCT DELETE MODAL
// -------------------------------------------------------------
interface BulkProductDeleteModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productIds: string[]) => void;
}

export const BulkProductDeleteModal: React.FC<BulkProductDeleteModalProps> = ({
  products,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-[#e6e3dd] p-6 space-y-5 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-[#991b1b] block">
            বাল্ক ডিলিট সতর্কতা
          </span>
          <h3 className="text-lg font-bold text-[#111827] tabular-nums">
            {products.length}টি পণ্য একসাথে মুছে ফেলতে চান?
          </h3>
          <p className="text-xs text-[#6b7280] leading-relaxed max-w-md mx-auto">
            নির্বাচিত <strong>{products.length}টি পণ্য</strong> স্থায়ীভাবে দোকান ও ইনভেন্টরি ক্যাটালগ থেকে মুছে যাবে। এই কাজটি আর ফিরিয়ে আনা যাবে না।
          </p>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-[#faf9f7] rounded-xl border border-[#e6e3dd] text-left">
          {products.map(p => (
            <div key={p.id} className="p-2 bg-white rounded-xl border border-[#e6e3dd] flex items-center gap-3 text-xs">
              {p.images?.[0] ? (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 object-cover rounded-lg border border-[#e6e3dd] shrink-0 bg-[#faf9f7]"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#faf9f7] border border-[#e6e3dd] flex items-center justify-center text-[#9ca3af] shrink-0">
                  <Package className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-[#111827] truncate">
                  {p.nameBn || p.name}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-[#6b7280] font-mono mt-0.5 tabular-nums">
                  <span>SKU: {p.sku}</span>
                  <span>·</span>
                  <span>স্টক: {p.stock} পিস</span>
                  <span>·</span>
                  <span className="font-bold text-[#881337]">৳{p.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[40px] py-2.5 rounded-xl border border-[#e6e3dd] text-[#374151] font-semibold hover:bg-[#faf9f7] cursor-pointer transition-colors text-xs"
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            onClick={() => onConfirm(products.map(p => p.id))}
            className="flex-1 min-h-[40px] py-2.5 rounded-xl bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-semibold cursor-pointer transition-colors text-xs flex items-center justify-center gap-2 tabular-nums"
          >
            <Trash2 className="w-4 h-4" />
            <span>হ্যাঁ, {products.length}টি পণ্য মুছে ফেলুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. BULK PRODUCT EDIT MODAL
// -------------------------------------------------------------
interface BulkProductEditModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    productIds: string[],
    updates: Partial<Product>,
    perProductUpdates?: Record<string, Partial<Product>>
  ) => Promise<{ success: boolean; error?: string } | void> | void;
}

export const BulkProductEditModal: React.FC<BulkProductEditModalProps> = ({
  products,
  isOpen,
  onClose,
  onSave,
}) => {
  const { categories: storeCategories } = useShop();

  // Field activation toggles
  const [updateCategory, setUpdateCategory] = useState(false);
  const [targetCategory, setTargetCategory] = useState('men-fashion');
  const [targetSubcategory, setTargetSubcategory] = useState('');

  const [updatePrice, setUpdatePrice] = useState(false);
  const [priceAction, setPriceAction] = useState<'fixed' | 'discount_percent' | 'add' | 'subtract'>('discount_percent');
  const [priceValue, setPriceValue] = useState<number>(10);

  const [updateStock, setUpdateStock] = useState(false);
  const [stockAction, setStockAction] = useState<'fixed' | 'add' | 'subtract'>('add');
  const [stockValue, setStockValue] = useState<number>(10);

  const [updateOccasions, setUpdateOccasions] = useState(false);
  const [selectedOccasions, setSelectedOccasions] = useState<NeedTag[]>([]);
  const [occasionMode, setOccasionMode] = useState<'add' | 'replace'>('add');

  const [updateBadges, setUpdateBadges] = useState(false);
  const [isTrending, setIsTrending] = useState<boolean | null>(null);
  const [isNewArrival, setIsNewArrival] = useState<boolean | null>(null);
  const [isBestSeller, setIsBestSeller] = useState<boolean | null>(null);
  const [isPublishedFlag, setIsPublishedFlag] = useState<boolean | null>(null);

  const [isApplying, setIsApplying] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  if (!isOpen || products.length === 0) return null;

  const currentCatObj = storeCategories.find(c => c.id === targetCategory);

  const handleToggleOccasion = (tag: NeedTag) => {
    setSelectedOccasions(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError(null);
    setIsApplying(true);

    const updates: Partial<Product> = {};

    if (updateCategory) {
      updates.category = targetCategory;
      updates.categoryBn = currentCatObj?.nameBn || targetCategory;
      if (targetSubcategory) {
        updates.subcategory = targetSubcategory;
      }
    }

    if (updateBadges) {
      if (isTrending !== null) updates.isTrending = isTrending;
      if (isNewArrival !== null) updates.isNewArrival = isNewArrival;
      if (isBestSeller !== null) updates.isBestSeller = isBestSeller;
      if (isPublishedFlag !== null) updates.isPublished = isPublishedFlag;
    }

    const perProductMap: Record<string, Partial<Product>> = {};
    products.forEach(p => {
      const singleUpdate: Partial<Product> = { ...updates };

      if (updatePrice) {
        if (priceAction === 'fixed') {
          singleUpdate.price = Math.max(0, priceValue);
        } else if (priceAction === 'discount_percent') {
          const discountAmt = Math.round((p.price * priceValue) / 100);
          singleUpdate.oldPrice = p.price;
          singleUpdate.price = Math.max(1, p.price - discountAmt);
          singleUpdate.discountPercent = priceValue;
        } else if (priceAction === 'add') {
          singleUpdate.price = p.price + priceValue;
        } else if (priceAction === 'subtract') {
          singleUpdate.price = Math.max(1, p.price - priceValue);
        }
      }

      if (updateStock) {
        if (stockAction === 'fixed') {
          singleUpdate.stock = Math.max(0, stockValue);
        } else if (stockAction === 'add') {
          singleUpdate.stock = p.stock + stockValue;
        } else if (stockAction === 'subtract') {
          singleUpdate.stock = Math.max(0, p.stock - stockValue);
        }
      }

      if (updateOccasions && selectedOccasions.length > 0) {
        if (occasionMode === 'replace') {
          singleUpdate.needTags = selectedOccasions;
        } else {
          const existing = p.needTags || [];
          singleUpdate.needTags = Array.from(new Set([...existing, ...selectedOccasions]));
        }
      }

      perProductMap[p.id] = singleUpdate;
    });

    try {
      const res = await onSave(
        products.map(p => p.id),
        updates,
        perProductMap
      );
      if (res && typeof res === 'object' && 'success' in res && !res.success) {
        setBulkError(res.error || 'বাল্ক আপডেট Firebase-এ সংরক্ষণ করা যায়নি।');
      } else {
        onClose();
      }
    } catch (err: any) {
      setBulkError(err?.message || 'বাল্ক আপডেট সম্পন্ন করা যায়নি।');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-auto border border-[#e6e3dd] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f2937] flex items-center justify-between bg-[#111827] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#881337] text-white flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tabular-nums">
                বাল্ক প্রোডাক্ট এডিটর · {products.length}টি পণ্য নির্বাচিত
              </h3>
              <p className="text-xs text-[#d1d5db]">
                একসাথে একাধিক পণ্যের মূল্য, স্টক, ক্যাটাগরি, উপলক্ষ ও ব্যাজ পরিবর্তন করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#9ca3af] hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleApply} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Target products preview badge */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
            <span className="text-gray-700 font-bold">
              নির্বাচিত পণ্য সংখ্যা: <strong className="text-blue-700">{products.length}টি</strong>
            </span>
            <span className="text-[11px] text-gray-500">
              শুধুমাত্র টিক দেওয়া ফিল্ডগুলোই পরিবর্তিত হবে
            </span>
          </div>

          {/* 1. Price Adjustment */}
          <div className={`p-4 rounded-2xl border transition-all ${updatePrice ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-gray-900 mb-2">
              <input
                type="checkbox"
                checked={updatePrice}
                onChange={e => setUpdatePrice(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>মূল্য ও ডিসকাউন্ট পরিবর্তন (Bulk Price Adjustments)</span>
              </span>
            </label>

            {updatePrice && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">অ্যাকশন নির্বাচন করুন:</label>
                  <select
                    value={priceAction}
                    onChange={e => setPriceAction(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="discount_percent">শতাংশ (%) ডিসকাউন্ট দিন</option>
                    <option value="fixed">নির্দিষ্ট বিক্রয় মূল্য সেট করুন (৳)</option>
                    <option value="add">বর্তমান মূল্যের সাথে যোগ করুন (+৳)</option>
                    <option value="subtract">বর্তমান মূল্য থেকে কমান (-৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    {priceAction === 'discount_percent' ? 'ডিসকাউন্টের শতকরা হার (%):' : 'টাকার পরিমাণ (৳):'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required={updatePrice}
                    value={priceValue}
                    onChange={e => setPriceValue(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Stock Adjustment */}
          <div className={`p-4 rounded-2xl border transition-all ${updateStock ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-gray-900 mb-2">
              <input
                type="checkbox"
                checked={updateStock}
                onChange={e => setUpdateStock(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center space-x-1.5">
                <Package className="w-4 h-4 text-blue-600" />
                <span>স্টক ও ইনভেন্টরি আপডেট (Bulk Stock Update)</span>
              </span>
            </label>

            {updateStock && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">স্টক অ্যাকশন:</label>
                  <select
                    value={stockAction}
                    onChange={e => setStockAction(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="add">বর্তমান স্টকে নতুন পিস যোগ করুন (+)</option>
                    <option value="fixed">নির্দিষ্ট স্টক সংখ্যা নির্ধারণ করুন</option>
                    <option value="subtract">স্টক থেকে কমান (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">পরিমাণ (Pieces):</label>
                  <input
                    type="number"
                    min="0"
                    required={updateStock}
                    value={stockValue}
                    onChange={e => setStockValue(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Category Reassignment */}
          <div className={`p-4 rounded-2xl border transition-all ${updateCategory ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-gray-900 mb-2">
              <input
                type="checkbox"
                checked={updateCategory}
                onChange={e => setUpdateCategory(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>ক্যাটাগরি স্থানান্তর (Reassign Category)</span>
              </span>
            </label>

            {updateCategory && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">টার্গেট ক্যাটাগরি:</label>
                  <select
                    value={targetCategory}
                    onChange={e => setTargetCategory(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    {storeCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.nameBn} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">সাব-ক্যাটাগরি (ঐচ্ছিক):</label>
                  <select
                    value={targetSubcategory}
                    onChange={e => setTargetSubcategory(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs"
                  >
                    <option value="">সাবক্যাটাগরি রাখুন যেমন আছে</option>
                    {currentCatObj?.subcategories?.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 4. Occasion Tags */}
          <div className={`p-4 rounded-2xl border transition-all ${updateOccasions ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-gray-900 mb-2">
              <input
                type="checkbox"
                checked={updateOccasions}
                onChange={e => setUpdateOccasions(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center space-x-1.5">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>উপলক্ষ ও কালেকশন ট্যাগ (Occasion / Need Tags)</span>
              </span>
            </label>

            {updateOccasions && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3 text-xs">
                  <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-gray-700">
                    <input
                      type="radio"
                      name="occasionMode"
                      value="add"
                      checked={occasionMode === 'add'}
                      onChange={() => setOccasionMode('add')}
                      className="text-blue-600"
                    />
                    <span>বর্তমান ট্যাগের সাথে যোগ করুন</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-gray-700">
                    <input
                      type="radio"
                      name="occasionMode"
                      value="replace"
                      checked={occasionMode === 'replace'}
                      onChange={() => setOccasionMode('replace')}
                      className="text-blue-600"
                    />
                    <span>পূর্বের ট্যাগ মুছে নতুন ট্যাগ বসান</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {OCCASIONS_LIST.map(occ => {
                    const isSelected = selectedOccasions.includes(occ.id);
                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => handleToggleOccasion(occ.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span>{occ.icon}</span>
                        <span>{occ.titleBn}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. Badges & Product Flags */}
          <div className={`p-4 rounded-2xl border transition-all ${updateBadges ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-gray-900 mb-2">
              <input
                type="checkbox"
                checked={updateBadges}
                onChange={e => setUpdateBadges(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>প্রদর্শনী ব্যাজ ও ফ্ল্যাগ (Trending / Best Seller / New Arrival)</span>
              </span>
            </label>

            {updateBadges && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1">
                  <span className="font-bold text-gray-800 block text-xs">ট্রেন্ডিং প্রোডাক্ট:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsTrending(isTrending === true ? null : true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isTrending === true ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      হ্যাঁ (Yes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTrending(isTrending === false ? null : false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isTrending === false ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      না (No)
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1">
                  <span className="font-bold text-gray-800 block text-xs">নিউ অ্যারাইভাল:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsNewArrival(isNewArrival === true ? null : true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isNewArrival === true ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      হ্যাঁ (Yes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewArrival(isNewArrival === false ? null : false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isNewArrival === false ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      না (No)
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1">
                  <span className="font-bold text-gray-800 block text-xs">বেস্টসেলার:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsBestSeller(isBestSeller === true ? null : true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isBestSeller === true ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      হ্যাঁ (Yes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBestSeller(isBestSeller === false ? null : false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isBestSeller === false ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      না (No)
                    </button>
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1 sm:col-span-3">
                  <span className="font-bold text-gray-800 block text-xs">স্টোর ভিজিবিলিটি (Publish Status):</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsPublishedFlag(isPublishedFlag === true ? null : true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isPublishedFlag === true ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      প্রকাশিত (Published)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublishedFlag(isPublishedFlag === false ? null : false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isPublishedFlag === false ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      লুকানো (Hidden / Draft)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {bulkError && (
            <div className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-xs text-[#991b1b] font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bulkError}</span>
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f3f1ed]">
            <button
              type="button"
              disabled={isApplying}
              onClick={onClose}
              className="min-h-[40px] py-2 px-4 rounded-xl border border-[#e6e3dd] text-[#374151] font-semibold hover:bg-[#faf9f7] cursor-pointer transition-colors text-xs"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isApplying || (!updatePrice && !updateStock && !updateCategory && !updateOccasions && !updateBadges)}
              className="min-h-[40px] py-2 px-6 rounded-xl bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold cursor-pointer transition-colors text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed tabular-nums"
            >
              <Save className="w-4 h-4" />
              <span>{isApplying ? 'সংরক্ষণ হচ্ছে...' : `${products.length}টি পণ্যে পরিবর্তন প্রয়োগ করুন`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

