import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Check,
  Search,
  ShoppingBag,
  DollarSign,
  Tag,
  Eye,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { BundleOffer, Product } from '../../types';

export const BundleManager: React.FC = () => {
  const {
    language,
    t,
    formatPrice,
    products,
    bundles,
    activeBundleId,
    setActiveBundleId,
    addBundle,
    updateBundle,
    deleteBundle,
    autoGenerateBundle,
    currentRole,
    hasPermission,
  } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<BundleOffer | null>(null);
  const [deletingBundleId, setDeletingBundleId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Create/Edit Modal
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [badge, setBadge] = useState('SAVE ৳300');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bundlePrice, setBundlePrice] = useState<number>(0);
  const [productPickerSearch, setProductPickerSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openCreateModal = () => {
    setTitleBn('');
    setTitleEn('');
    setDescriptionBn('অফিস বা বিশেষ অনুষ্ঠানের জন্য সম্পূর্ণ লুক। একসাথে কিনে সাশ্রয় করুন আকর্ষণীয় ছাড়!');
    setDescriptionEn('Complete look for office or special events. Save big with bundled price!');
    setBadge('SAVE ৳331');
    // Pre-select first 2 products if available
    if (products.length >= 2) {
      const p1 = products[0];
      const p2 = products[1];
      setSelectedProductIds([p1.id, p2.id]);
      const reg = p1.price + p2.price;
      const disc = Math.round(reg * 0.18);
      setBundlePrice(reg - disc);
      setBadge(`SAVE ৳${disc}`);
    } else {
      setSelectedProductIds([]);
      setBundlePrice(0);
    }
    setEditingBundle(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (b: BundleOffer) => {
    setEditingBundle(b);
    setTitleBn(b.titleBn || b.title);
    setTitleEn(b.title);
    setDescriptionBn(b.descriptionBn || b.description);
    setDescriptionEn(b.description);
    setBadge(b.badge || 'SAVE ৳300');
    setSelectedProductIds(b.productIds || []);
    setBundlePrice(b.bundlePrice || 0);
    setIsCreateModalOpen(true);
  };

  const toggleSelectProduct = (productId: string) => {
    let next: string[];
    if (selectedProductIds.includes(productId)) {
      next = selectedProductIds.filter(id => id !== productId);
    } else {
      next = [...selectedProductIds, productId];
    }
    setSelectedProductIds(next);

    // Auto recalculate regular price and suggest discount price
    const newItems = products.filter(p => next.includes(p.id));
    const newReg = newItems.reduce((sum, p) => sum + p.price, 0);
    if (bundlePrice === 0 || bundlePrice >= newReg) {
      const disc = Math.round(newReg * 0.18);
      const newOffer = Math.max(100, newReg - disc);
      setBundlePrice(newOffer);
      setBadge(`SAVE ৳${newReg - newOffer}`);
    }
  };

  const handleSaveBundle = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length < 2) {
      showToast('⚠️ কম্বো বান্ডেল তৈরি করতে কমপক্ষে ২টি পণ্য নির্বাচন করুন।');
      return;
    }
    if (!titleBn.trim() && !titleEn.trim()) {
      showToast('⚠️ বান্ডেলের একটি শিরোনাম প্রদান করুন।');
      return;
    }

    const selectedProds = products.filter(p => selectedProductIds.includes(p.id));
    const regularPrice = selectedProds.reduce((sum, p) => sum + p.price, 0);
    const finalBundlePrice = Number(bundlePrice) > 0 ? Number(bundlePrice) : Math.round(regularPrice * 0.85);
    const saveAmount = Math.max(0, regularPrice - finalBundlePrice);
    const finalBadge = badge.trim() || `SAVE ৳${saveAmount}`;

    if (editingBundle) {
      const updated: BundleOffer = {
        ...editingBundle,
        title: titleEn.trim() || titleBn.trim(),
        titleBn: titleBn.trim() || titleEn.trim(),
        description: descriptionEn.trim() || descriptionBn.trim(),
        descriptionBn: descriptionBn.trim() || descriptionEn.trim(),
        productIds: selectedProductIds,
        regularPrice,
        bundlePrice: finalBundlePrice,
        badge: finalBadge,
      };
      updateBundle(updated);
      showToast('✅ কম্বো বান্ডেল সফলভাবে আপডেট করা হয়েছে!');
    } else {
      const newBundle: BundleOffer = {
        id: `bundle-${Date.now()}`,
        title: titleEn.trim() || titleBn.trim(),
        titleBn: titleBn.trim() || titleEn.trim(),
        description: descriptionEn.trim() || descriptionBn.trim(),
        descriptionBn: descriptionBn.trim() || descriptionEn.trim(),
        productIds: selectedProductIds,
        regularPrice,
        bundlePrice: finalBundlePrice,
        badge: finalBadge,
        isActive: true,
      };
      addBundle(newBundle);
      showToast('🎉 নতুন কম্বো বান্ডেল তৈরি ও স্টোরফ্রন্টে সক্রিয় করা হয়েছে!');
    }

    setIsCreateModalOpen(false);
    setEditingBundle(null);
  };

  const handleAutoGenerate = () => {
    const created = autoGenerateBundle();
    if (created) {
      showToast(`⚡ অটো-কম্বো সফলভাবে তৈরি করা হয়েছে: "${created.titleBn}"`);
    } else {
      showToast('⚠️ পর্যাপ্ত বৈচিত্র্যময় পণ্য পাওয়া যায়নি। ম্যানুয়ালি তৈরি করুন।');
    }
  };

  const handleDelete = (bundleId: string) => {
    deleteBundle(bundleId);
    setDeletingBundleId(null);
    showToast('🗑️ কম্বো বান্ডেল মুছে ফেলা হয়েছে।');
  };

  const filteredBundles = bundles.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.titleBn.toLowerCase().includes(q) ||
      b.badge.toLowerCase().includes(q)
    );
  });

  const selectedProductsForForm = products.filter(p => selectedProductIds.includes(p.id));
  const currentRegularTotal = selectedProductsForForm.reduce((sum, p) => sum + p.price, 0);
  const currentSaveTotal = Math.max(0, currentRegularTotal - Number(bundlePrice));

  const pickerProducts = products.filter(p => {
    if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) return false;
    if (productPickerSearch) {
      const q = productPickerSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.nameBn.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const canManage = hasPermission('homepage', 'manage') || hasPermission('homepage', 'create') || currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold border border-amber-400">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-rose-950 to-gray-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-amber-400 text-gray-950 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complete The Look & Combo Deals</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {t('কম্বো ও বান্ডেল ম্যানেজার', 'Combo & Bundle Manager')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
              হোমপেজের <strong>"Complete The Look — কম্বো স্টাইল বান্ডেল"</strong> সেকশনে প্রদর্শিত বান্ডেল পরিচালনা করুন।
              সুপার এডমিন ও এডমিন যেকোনো সময় ১-ক্লিকে অটো বান্ডেল তৈরি বা কাস্টম পণ্য সিলেক্ট করে নতুন বান্ডেল এড ও এডিট করতে পারেন।
            </p>
          </div>

          {canManage && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleAutoGenerate}
                className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-black text-xs px-4 py-2.5 rounded-2xl flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                title="ক্যাটালগ থেকে স্বয়ংক্রিয়ভাবে ম্যাচিং কম্বো তৈরি করবে"
              >
                <Zap className="w-4 h-4 text-gray-950" />
                <span>{t('⚡ অটো-কম্বো জেনারেট', '⚡ Auto Generate')}</span>
              </button>

              <button
                onClick={openCreateModal}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2.5 rounded-2xl flex items-center space-x-2 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('+ নতুন কম্বো তৈরি করুন', '+ Create Bundle')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-gray-400 block">মোট বান্ডেল</span>
            <span className="text-lg font-black text-white">{bundles.length} টি</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-gray-400 block">স্টোরফ্রন্টে একটিভ</span>
            <span className="text-lg font-black text-amber-400">
              {bundles.find(b => b.id === activeBundleId)?.badge || 'একটিভ'}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-gray-400 block">সর্বোচ্চ সাশ্রয় অফার</span>
            <span className="text-lg font-black text-emerald-400">
              {bundles.length > 0
                ? formatPrice(Math.max(...bundles.map(b => b.regularPrice - b.bundlePrice)))
                : '৳০'}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-gray-400 block">উপলব্ধ ক্যাটালগ পণ্য</span>
            <span className="text-lg font-black text-cyan-300">{products.length} টি</span>
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-start space-x-3 text-xs text-emerald-900">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">💡 অটো ও ম্যানুয়াল উভয় পদ্ধতি সুপার এডমিন ও এডমিনের জন্য উন্মুক্ত:</p>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            • <strong>অটো এড্ড / জেনারেট:</strong> "⚡ অটো-কম্বো জেনারেট" বাটনে ক্লিক করলে সিস্টেম শার্ট+ওয়ালেট বা টেক গ্যাজেটের মতো ম্যাচিং আইটেম জোড়া লাগিয়ে স্বয়ংক্রিয়ভাবে ১৮% সাশ্রয়ী রেডিমেড বান্ডেল বানিয়ে দেবে।<br />
            • <strong>ম্যানুয়াল কাস্টম বান্ডেল:</strong> "+ নতুন কম্বো তৈরি করুন" বাটনে ক্লিক করে পছন্দমতো যে কোনো ২-৪টি পণ্য সিলেক্ট করে কাস্টম বান্ডেল প্রাইস ও "SAVE ৳৩৩১" জাতীয় আকর্ষণীয় সাশ্রয় ব্যাজ দিয়ে হোমপেজে লাইভ করতে পারবেন।
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="বান্ডেল নাম বা ব্যাজ দিয়ে খুঁজুন..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-9 pr-3 py-2 text-xs focus:border-rose-500"
          />
        </div>
      </div>

      {/* Bundles Grid */}
      <div className="space-y-4">
        {filteredBundles.map(bundle => {
          const isActiveOnFront = bundle.id === activeBundleId;
          const bundleItems = products.filter(p => bundle.productIds.includes(p.id));
          const calculatedRegular = bundle.regularPrice > 0
            ? bundle.regularPrice
            : bundleItems.reduce((s, p) => s + p.price, 0);
          const saveAmount = Math.max(0, calculatedRegular - bundle.bundlePrice);

          return (
            <div
              key={bundle.id}
              className={`bg-white rounded-3xl p-5 border transition-all shadow-xs space-y-4 ${
                isActiveOnFront
                  ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {bundle.badge}
                    </span>
                    {isActiveOnFront && (
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>স্টোরফ্রন্টে প্রদর্শিত</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-gray-900">
                    {bundle.titleBn || bundle.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {bundle.descriptionBn || bundle.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      setActiveBundleId(bundle.id);
                      showToast('⭐ এই কম্বোটি এখন স্টোরফ্রন্টে মূল ফিচার হিসেবে দৃশ্যমান!');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isActiveOnFront
                        ? 'bg-amber-400 text-gray-950 font-black shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isActiveOnFront ? 'ফিচার্ড একটিভ' : 'হোমপেজে দেখান'}</span>
                  </button>

                  {canManage && (
                    <>
                      <button
                        onClick={() => openEditModal(bundle)}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                        title="এডিট করুন"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingBundleId(bundle.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Items in this bundle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {bundleItems.map((prod, idx) => (
                  <div
                    key={prod.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block truncate">
                        {language === 'bn' ? prod.categoryBn : prod.category}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {language === 'bn' ? prod.nameBn : prod.name}
                      </h4>
                      <span className="text-xs font-black text-rose-600">
                        {formatPrice(prod.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing summary bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 bg-gray-50/50 p-3 rounded-2xl text-xs">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-400 block text-[10px]">রেগুলার মূল্য:</span>
                    <span className="font-bold text-gray-500 line-through">
                      {formatPrice(calculatedRegular)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">বান্ডেল অফার প্রাইস:</span>
                    <span className="font-black text-rose-600 text-sm">
                      {formatPrice(bundle.bundlePrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">মোট সাশ্রয়:</span>
                    <span className="font-black text-emerald-600">
                      {formatPrice(saveAmount)}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] text-gray-500 font-mono">
                  আইটেম সংখ্যা: {bundleItems.length} টি
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    {editingBundle ? 'কম্বো বান্ডেল এডিট করুন' : 'নতুন কম্বো স্টাইল বান্ডেল তৈরি করুন'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    পণ্য নির্বাচন করুন, বান্ডেল প্রাইস নির্ধারণ করুন এবং স্টোরফ্রন্টে ফিচার করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingBundle(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBundle} className="space-y-4 text-xs">
              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-gray-800">বান্ডেল শিরোনাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={titleBn}
                    onChange={e => setTitleBn(e.target.value)}
                    placeholder="যেমন: এক্সিকিউটিভ স্টাইল বান্ডেল (শার্ট + ওয়ালেট + সানগ্লাস)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-800">অফার ব্যাজ (Badge)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    placeholder="যেমন: SAVE ৳331 বা কম্বো অফার"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-black text-amber-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-800">Title (English)</label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={e => setTitleEn(e.target.value)}
                  placeholder="e.g. Executive Style Bundle (Shirt + Wallet + Sunglasses)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-800">বিবরণ (বাংলা)</label>
                  <textarea
                    rows={2}
                    value={descriptionBn}
                    onChange={e => setDescriptionBn(e.target.value)}
                    placeholder="অফিস বা বিশেষ অনুষ্ঠানের জন্য সম্পূর্ণ লুক। একসাথে কিনে সাশ্রয় করুন ৫০০+ টাকা!"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-800">Description (English)</label>
                  <textarea
                    rows={2}
                    value={descriptionEn}
                    onChange={e => setDescriptionEn(e.target.value)}
                    placeholder="Everything you need for an unmatched sharp look..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Pricing section with real-time math */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-gray-900 flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>দাম ও সাশ্রয় হিসাব ক্যালকুলেটর</span>
                  </span>
                  <span className="text-[11px] text-gray-500">
                    নির্বাচিত পণ্য: {selectedProductIds.length} টি
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-[11px] text-gray-500 block">মোট রেগুলার মূল্য</span>
                    <span className="text-base font-black text-gray-900 block mt-0.5">
                      {formatPrice(currentRegularTotal)}
                    </span>
                    <span className="text-[10px] text-gray-400">(স্বয়ংক্রিয় যোগফল)</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-rose-300 ring-2 ring-rose-400/20">
                    <label className="text-[11px] font-bold text-rose-700 block">
                      বান্ডেল অফার প্রাইস (টাকা) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={bundlePrice}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setBundlePrice(val);
                        const save = Math.max(0, currentRegularTotal - val);
                        setBadge(`SAVE ৳${save}`);
                      }}
                      className="w-full bg-rose-50/50 border border-rose-300 rounded-lg p-1.5 font-black text-rose-600 text-sm mt-0.5"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[11px] font-bold text-emerald-700 block">মোট সাশ্রয় (Savings)</span>
                    <span className="text-base font-black text-emerald-700 block mt-0.5">
                      {formatPrice(currentSaveTotal)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      গ্রাহক সাশ্রয় করবেন!
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Picker */}
              <div className="space-y-2 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-gray-800 flex items-center space-x-1.5">
                    <ShoppingBag className="w-4 h-4 text-rose-600" />
                    <span>বান্ডেলে অন্তর্ভুক্ত পণ্য নির্বাচন করুন (কমপক্ষে ২টি) *</span>
                  </label>

                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productPickerSearch}
                      onChange={e => setProductPickerSearch(e.target.value)}
                      placeholder="পণ্য খুঁজুন..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-2.5 py-1 text-xs"
                    />
                  </div>
                </div>

                {/* Selected pills list */}
                {selectedProductsForForm.length > 0 && (
                  <div className="p-2.5 bg-rose-50/50 rounded-2xl border border-rose-100 flex flex-wrap gap-2 items-center">
                    <span className="text-[11px] font-bold text-rose-800">বাছাইকৃত:</span>
                    {selectedProductsForForm.map(p => (
                      <span
                        key={p.id}
                        className="inline-flex items-center space-x-1 bg-white border border-rose-200 px-2 py-1 rounded-xl text-[11px] font-bold text-gray-800 shadow-xs"
                      >
                        <img src={p.images[0]} alt="" className="w-4 h-4 rounded object-cover" />
                        <span className="max-w-[140px] truncate">{p.nameBn || p.name}</span>
                        <span className="text-rose-600">({formatPrice(p.price)})</span>
                        <button
                          type="button"
                          onClick={() => toggleSelectProduct(p.id)}
                          className="text-gray-400 hover:text-rose-600 cursor-pointer ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Products selector table / grid */}
                <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-2xl divide-y divide-gray-100">
                  {pickerProducts.map(prod => {
                    const isSelected = selectedProductIds.includes(prod.id);
                    return (
                      <label
                        key={prod.id}
                        className={`flex items-center justify-between p-2.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectProduct(prod.id)}
                            className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                          />
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 truncate">
                              {prod.nameBn || prod.name}
                            </h4>
                            <span className="text-[10px] text-gray-400">
                              {prod.categoryBn || prod.category} | স্টক: {prod.stock}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-rose-600 text-xs">
                            {formatPrice(prod.price)}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingBundle(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black cursor-pointer shadow-md shadow-rose-600/30 flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{editingBundle ? 'পরিবর্তন সংরক্ষণ করুন' : 'বান্ডেল সংরক্ষণ ও সক্রিয় করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingBundleId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">কম্বো বান্ডেল মুছে ফেলতে চান?</h3>
              <p className="text-xs text-gray-500 mt-1">
                এই কম্বোটি হোমপেজ এবং স্টোরফ্রন্ট থেকে অপসারিত হবে।
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBundleId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                না, রাখুন
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingBundleId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-white shadow-md cursor-pointer"
              >
                হ্যাঁ, মুছুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
