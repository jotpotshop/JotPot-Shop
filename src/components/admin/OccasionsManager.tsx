import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Search,
  Zap,
  ShoppingBag,
  Layers,
  ArrowRight,
  Info,
  Package,
  X,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { OCCASIONS_LIST } from '../../data/occasionsData';
import { NeedTag, Product } from '../../types';

export const OccasionsManager: React.FC = () => {
  const {
    language,
    t,
    formatPrice,
    products,
    updateProductNeedTags,
    autoTagAllProducts,
    currentRole,
    hasPermission,
  } = useShop();

  const [activeOccasion, setActiveOccasion] = useState<NeedTag>('gift');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentOccasionConfig = OCCASIONS_LIST.find(o => o.id === activeOccasion) || OCCASIONS_LIST[0];

  // Products assigned to the current active occasion
  const assignedProducts = products.filter(
    p => Array.isArray(p.needTags) && p.needTags.includes(activeOccasion)
  );

  const filteredAssigned = assignedProducts.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.nameBn.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    );
  });

  const handleToggleProductOccasion = async (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const currentTags = Array.isArray(prod.needTags) ? prod.needTags : [];
    const isRemoving = currentTags.includes(activeOccasion);
    const updatedTags: NeedTag[] = isRemoving
      ? currentTags.filter(t => t !== activeOccasion)
      : [...currentTags, activeOccasion];

    const res = await updateProductNeedTags(productId, updatedTags);
    if (!res.success) {
      showToast(`ট্যাগ সংরক্ষণ ব্যর্থ: ${res.error || 'ফায়ারবেস ত্রুটি'}`, 'error');
      return;
    }

    if (isRemoving) {
      showToast(`'${prod.nameBn || prod.name}' এই উপলক্ষ থেকে রিমুভ করা হয়েছে`);
    } else {
      showToast(`'${prod.nameBn || prod.name}' এই উপলক্ষে যুক্ত করা হয়েছে`);
    }
  };

  const handleRunAutoTagging = () => {
    const count = autoTagAllProducts();
    showToast(`স্মার্ট অটো-ট্যাগিং সম্পন্ন হয়েছে! ${count} টি পণ্যে স্বয়ংক্রিয় উপলক্ষ যুক্ত হয়েছে।`);
  };

  const canManage =
    hasPermission('homepage', 'manage') ||
    hasPermission('products', 'edit') ||
    currentRole === 'SUPER_ADMIN' ||
    currentRole === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2 text-xs font-semibold border ${
            toastMessage.type === 'error'
              ? 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]'
              : 'bg-[#111827] text-white border-gray-800'
          }`}
        >
          <Check className={`w-4 h-4 shrink-0 ${toastMessage.type === 'error' ? 'text-[#b91c1c]' : 'text-[#15803d]'}`} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#111827] rounded-2xl p-6 text-white border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Shop By Need &amp; Occasion Collections
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {t('উপলক্ষ ও কিউরেটেড কালেকশন ম্যানেজার', 'Occasions & Need Collections Manager')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
              হোমপেজের <strong>"আপনার কী প্রয়োজন? উপলক্ষ অনুযায়ী কেনাকাটা করুন"</strong> সেকশনে উপহার, অফিস, ক্যাম্পাস, বিবাহ ইত্যাদি ক্যাটাগরিতে পণ্য নিয়ন্ত্রণ করুন।
              সুপার এডমিন ও এডমিন চাইলে ১-ক্লিকে সব পণ্য অটো-ট্যাগ করতে পারেন অথবা প্রতি উপলক্ষ অনুযায়ী আলাদা আলাদা পণ্য নির্ধারণ করতে পারেন।
            </p>
          </div>

          {canManage && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleRunAutoTagging}
                className="bg-white hover:bg-[#faf9f7] text-[#111827] font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer min-h-[38px]"
                title="ক্যাটাগরি ও টাইটেল অ্যানালাইসিস করে সব পণ্যে স্বয়ংক্রিয়ভাবে মানানসই উপলক্ষ ট্যাগ করবে"
              >
                <Zap className="w-4 h-4 text-[#881337]" />
                <span>{t('অটো স্মার্ট-ট্যাগিং চালান', 'Run Auto Tagging')}</span>
              </button>

              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer min-h-[38px]"
              >
                <Plus className="w-4 h-4" />
                <span>{t('পণ্য যুক্ত / রিমুভ করুন', 'Assign Products')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Guidance Card */}
      <div className="p-4 bg-[#faf9f7] border border-[#e6e3dd] rounded-2xl flex items-start space-x-3 text-xs text-gray-700">
        <Info className="w-5 h-5 text-[#111827] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#111827]">কীভাবে স্বয়ংক্রিয় ও ম্যানুয়াল কাজ করে?</p>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            • <strong className="text-[#111827]">স্বয়ংক্রিয় অ্যাড (Auto Add):</strong> এডমিন প্যানেল থেকে যেকোনো নতুন পণ্য অ্যাড করার সময় সিস্টেম পণ্যের নাম ও ক্যাটাগরি (যেমন ঘড়ি, শার্ট, ব্যাগ, পাঞ্জাবি) যাচাই করে নিজে নিজেই উপযুক্ত উপলক্ষ (উপহার, অফিস, ক্যাম্পাস, বিবাহ ইত্যাদি) বসিয়ে দেয়।<br />
            • <strong className="text-[#111827]">ম্যানুয়াল পূর্ণ ক্ষমতা:</strong> সুপার এডমিন ও এডমিন চাইলে যেকোনো সময় পণ্য এডিট করার সময় বা নিচের তালিকা থেকে সরাসরি যেকোনো উপলক্ষ্যে পণ্য যুক্ত বা বাদ দিতে পারেন।
          </p>
        </div>
      </div>

      {/* Occasions Tabs Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
        {OCCASIONS_LIST.map(occ => {
          const isSelected = activeOccasion === occ.id;
          const count = products.filter(
            p => Array.isArray(p.needTags) && p.needTags.includes(occ.id)
          ).length;

          return (
            <button
              key={occ.id}
              onClick={() => setActiveOccasion(occ.id)}
              className={`p-3 rounded-xl text-center transition-colors cursor-pointer border flex flex-col items-center justify-center space-y-1 ${
                isSelected
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-white hover:bg-[#faf9f7] text-gray-700 border-[#e6e3dd]'
              }`}
            >
              <span className="text-2xl">{occ.icon}</span>
              <span className="text-xs font-bold truncate w-full">{occ.titleBn}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md tabular-nums ${
                  isSelected ? 'bg-[#1f2937] text-white' : 'bg-[#faf9f7] text-gray-600'
                }`}
              >
                {count} টি পণ্য
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Occasion Detailed Management */}
      <div className="bg-white rounded-2xl p-6 border border-[#e6e3dd] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e6e3dd]">
          <div className="flex items-center space-x-3">
            <span className="text-3xl p-2 bg-[#faf9f7] border border-[#e6e3dd] rounded-xl">{currentOccasionConfig.icon}</span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#111827]">
                  {currentOccasionConfig.titleBn} কালেকশন ({currentOccasionConfig.titleEn})
                </h3>
                <span className="bg-[#faf9f7] border border-[#e6e3dd] text-[#881337] text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums">
                  মোট {assignedProducts.length} টি পণ্য
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {currentOccasionConfig.descriptionBn}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="এই উপলক্ষের পণ্য খুঁজুন..."
                className="w-full bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-9 pr-3 py-1.5 text-xs focus:border-[#881337] focus:bg-white focus:outline-hidden min-h-[38px]"
              />
            </div>

            {canManage && (
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-black text-white text-xs font-semibold shrink-0 cursor-pointer flex items-center space-x-1 min-h-[38px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>পণ্য যোগ করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Assigned Products Table / Grid */}
        {filteredAssigned.length === 0 ? (
          <div className="py-12 text-center bg-[#faf9f7] rounded-xl border border-dashed border-[#e6e3dd]">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-700 text-xs">
              "{currentOccasionConfig.titleBn}" উপলক্ষে কোনো পণ্য পাওয়া যায়নি
            </p>
            <p className="text-[11px] text-gray-500 mt-1 max-w-sm mx-auto">
              উপরে "পণ্য যোগ করুন" বাটনে ক্লিক করে পণ্য নির্বাচন করুন অথবা "অটো স্মার্ট-ট্যাগিং চালান" এ ক্লিক করুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {filteredAssigned.map(prod => (
              <div
                key={prod.id}
                className="p-3 bg-[#faf9f7] rounded-xl border border-[#e6e3dd] flex flex-col justify-between space-y-2 hover:border-gray-400 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {prod.images?.[0] ? (
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-lg object-cover border border-[#e6e3dd] shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-white border border-[#e6e3dd] flex items-center justify-center shrink-0 text-gray-400">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block truncate">
                      {language === 'bn' ? prod.categoryBn : prod.category}
                    </span>
                    <h4 className="text-xs font-bold text-[#111827] truncate">
                      {prod.nameBn || prod.name}
                    </h4>
                    <span className="text-xs font-bold text-[#881337] block mt-0.5 tabular-nums">
                      {formatPrice(prod.price)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e6e3dd] flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono tabular-nums">
                    স্টক: {prod.stock}
                  </span>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleToggleProductOccasion(prod.id)}
                      className="text-[11px] text-[#b91c1c] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                      title="এই উপলক্ষ থেকে বাদ দিন"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>বাদ দিন</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ASSIGN PRODUCTS MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-[#e6e3dd] space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e3dd]">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{currentOccasionConfig.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-[#111827]">
                    "{currentOccasionConfig.titleBn}" উপলক্ষে পণ্য নির্বাচন
                  </h3>
                  <p className="text-xs text-gray-500">
                    টিক চিহ্ন দিয়ে যুক্ত বা বাদ দিন। পরিবর্তন সাথে সাথে সেভ হবে।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 text-gray-500 hover:text-[#111827] rounded-xl hover:bg-[#faf9f7] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={assignSearch}
                onChange={e => setAssignSearch(e.target.value)}
                placeholder="পণ্য বা ক্যাটালগ খুঁজুন..."
                className="w-full bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-9 pr-3 py-2 text-xs focus:border-[#881337] focus:bg-white focus:outline-hidden min-h-[38px]"
              />
            </div>

            {/* List with checkboxes */}
            <div className="flex-1 overflow-y-auto border border-[#e6e3dd] rounded-xl divide-y divide-[#e6e3dd]">
              {products
                .filter(p => {
                  if (!assignSearch) return true;
                  const q = assignSearch.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(q) ||
                    p.nameBn.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q)
                  );
                })
                .map(prod => {
                  const isAssigned =
                    Array.isArray(prod.needTags) && prod.needTags.includes(activeOccasion);

                  return (
                    <label
                      key={prod.id}
                      className={`flex items-center justify-between p-3 hover:bg-[#faf9f7] cursor-pointer transition-colors ${
                        isAssigned ? 'bg-[#881337]/5' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => handleToggleProductOccasion(prod.id)}
                          className="rounded accent-[#881337] w-4 h-4 cursor-pointer"
                        />
                        {prod.images?.[0] ? (
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover border border-[#e6e3dd] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#faf9f7] border border-[#e6e3dd] flex items-center justify-center shrink-0 text-gray-400">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-semibold text-[#111827] truncate text-xs">
                            {prod.nameBn || prod.name}
                          </h4>
                          <span className="text-[10px] text-gray-500 tabular-nums">
                            {prod.categoryBn || prod.category} | {formatPrice(prod.price)}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isAssigned
                            ? 'bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d]'
                            : 'bg-[#faf9f7] border border-[#e6e3dd] text-gray-500'
                        }`}
                      >
                        {isAssigned ? 'যুক্ত আছে' : 'যুক্ত নয়'}
                      </span>
                    </label>
                  );
                })}
            </div>

            <div className="pt-3 border-t border-[#e6e3dd] flex justify-end">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#111827] hover:bg-black text-white font-semibold text-xs cursor-pointer min-h-[38px]"
              >
                সম্পন্ন করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
