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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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

  const handleToggleProductOccasion = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const currentTags = Array.isArray(prod.needTags) ? prod.needTags : [];
    let updatedTags: NeedTag[];
    if (currentTags.includes(activeOccasion)) {
      updatedTags = currentTags.filter(t => t !== activeOccasion);
      showToast(`'${prod.nameBn || prod.name}' এই উপলক্ষ থেকে রিমুভ করা হয়েছে`);
    } else {
      updatedTags = [...currentTags, activeOccasion];
      showToast(`'${prod.nameBn || prod.name}' এই উপলক্ষে যুক্ত করা হয়েছে`);
    }
    updateProductNeedTags(productId, updatedTags);
  };

  const handleRunAutoTagging = () => {
    const count = autoTagAllProducts();
    showToast(`⚡ স্মার্ট অটো-ট্যাগিং সম্পন্ন হয়েছে! ${count} টি পণ্যে স্বয়ংক্রিয় উপলক্ষ যুক্ত হয়েছে।`);
  };

  const canManage =
    hasPermission('homepage', 'manage') ||
    hasPermission('products', 'edit') ||
    currentRole === 'SUPER_ADMIN' ||
    currentRole === 'ADMIN';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold border border-rose-400">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-indigo-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>Shop By Need & Occasion Collections</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {t('🎯 উপলক্ষ ও কিউরেটেড কালেকশন ম্যানেজার', 'Occasions & Need Collections Manager')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
              হোমপেজের <strong>"আপনার কী প্রয়োজন? উপলক্ষ অনুযায়ী কেনাকাটা করুন"</strong> সেকশনে উপহার, অফিস, ক্যাম্পাস, বিবাহ ইত্যাদি ক্যাটাগরিতে পণ্য নিয়ন্ত্রণ করুন।
              সুপার এডমিন ও এডমিন চাইলে ১-ক্লিকে সব পণ্য অটো-ট্যাগ করতে পারেন অথবা প্রতি উপলক্ষ অনুযায়ী আলাদা আলাদা পণ্য নির্ধারণ করতে পারেন।
            </p>
          </div>

          {canManage && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleRunAutoTagging}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs px-4 py-2.5 rounded-2xl flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                title="ক্যাটাগরি ও টাইটেল অ্যানালাইসিস করে সব পণ্যে স্বয়ংক্রিয়ভাবে মানানসই উপলক্ষ ট্যাগ করবে"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{t('⚡ অটো স্মার্ট-ট্যাগিং চালান', '⚡ Run Auto Tagging')}</span>
              </button>

              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2.5 rounded-2xl flex items-center space-x-2 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('+ পণ্য যুক্ত / রিমুভ করুন', '+ Assign Products')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Guidance Card */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-3xl flex items-start space-x-3 text-xs text-blue-900">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">💡 কীভাবে স্বয়ংক্রিয় ও ম্যানুয়াল কাজ করে?</p>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            • <strong>স্বয়ংক্রিয় অ্যাড (Auto Add):</strong> এডমিন প্যানেল থেকে যেকোনো নতুন পণ্য অ্যাড করার সময় সিস্টেম পণ্যের নাম ও ক্যাটাগরি (যেমন ঘড়ি, শার্ট, ব্যাগ, পাঞ্জাবি) যাচাই করে নিজে নিজেই উপযুক্ত উপলক্ষ (উপহার, অফিস, ক্যাম্পাস, বিবাহ ইত্যাদি) বসিয়ে দেয়। ফলে কোনো পণ্য যোগ করলেই স্বয়ংক্রিয়ভাবে "আপনার কী প্রয়োজন?"-এ ভেসে ওঠে।<br />
            • <strong>ম্যানুয়াল পূর্ণ ক্ষমতা:</strong> সুপার এডমিন ও এডমিন চাইলে যেকোনো সময় পণ্য এডিট করার সময় বা নিচের তালিকা থেকে সরাসরি যেকোনো উপলক্ষ্যে পণ্য যুক্ত বা বাদ দিতে পারেন।
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
              className={`p-3 rounded-2xl text-center transition-all cursor-pointer border flex flex-col items-center justify-center space-y-1 ${
                isSelected
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-102 ring-2 ring-rose-500/30'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <span className="text-2xl">{occ.icon}</span>
              <span className="text-xs font-black truncate w-full">{occ.titleBn}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count} টি পণ্য
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Occasion Detailed Management */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <span className="text-3xl p-2 bg-gray-100 rounded-2xl">{currentOccasionConfig.icon}</span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-gray-900">
                  {currentOccasionConfig.titleBn} কালেকশন ({currentOccasionConfig.titleEn})
                </h3>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full">
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:border-rose-500"
              />
            </div>

            {canManage && (
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shrink-0 cursor-pointer flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>পণ্য যোগ করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Assigned Products Table / Grid */}
        {filteredAssigned.length === 0 ? (
          <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-700 text-xs">
              "{currentOccasionConfig.titleBn}" উপলক্ষে কোনো পণ্য পাওয়া যায়নি
            </p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
              উপরে "পণ্য যোগ করুন" বাটনে ক্লিক করে পণ্য নির্বাচন করুন অথবা "⚡ অটো স্মার্ট-ট্যাগিং চালান" এ ক্লিক করুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {filteredAssigned.map(prod => (
              <div
                key={prod.id}
                className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-2 hover:border-gray-300 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block truncate">
                      {language === 'bn' ? prod.categoryBn : prod.category}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 truncate">
                      {prod.nameBn || prod.name}
                    </h4>
                    <span className="text-xs font-black text-rose-600 block mt-0.5">
                      {formatPrice(prod.price)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono">
                    স্টক: {prod.stock}
                  </span>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleToggleProductOccasion(prod.id)}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{currentOccasionConfig.icon}</span>
                <div>
                  <h3 className="text-base font-black text-gray-900">
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
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={assignSearch}
                onChange={e => setAssignSearch(e.target.value)}
                placeholder="পণ্য বা ক্যাটালগ খুঁজুন..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs"
              />
            </div>

            {/* List with checkboxes */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-2xl divide-y divide-gray-100">
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
                      className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        isAssigned ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => handleToggleProductOccasion(prod.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate text-xs">
                            {prod.nameBn || prod.name}
                          </h4>
                          <span className="text-[10px] text-gray-400">
                            {prod.categoryBn || prod.category} | {formatPrice(prod.price)}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAssigned
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isAssigned ? 'যুক্ত আছে ✓' : 'যুক্ত নয়'}
                      </span>
                    </label>
                  );
                })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs cursor-pointer"
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
