import React, { useState } from 'react';
import { ShoppingBag, Plus, Check, Package } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getAvailableStock } from '../utils/inventory';

export const CompleteTheLookSection: React.FC = () => {
  const {
    language,
    t,
    formatPrice,
    products,
    addBundleToCart,
    bundles,
    activeBundleId,
    setActiveBundleId,
  } = useShop();

  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  if (!bundles || bundles.length === 0) return null;

  const bundle = bundles.find(b => b.id === activeBundleId) || bundles[0];
  if (!bundle) return null;

  const bundleProducts = products.filter(p => p.isPublished !== false && bundle.productIds.includes(p.id));
  if (bundleProducts.length === 0) return null;

  const isBundleInStock = bundleProducts.every(p => getAvailableStock(p) > 0);

  const calculatedRegularPrice = bundle.regularPrice > 0
    ? bundle.regularPrice
    : bundleProducts.reduce((sum, p) => sum + p.price, 0);

  const saveAmount = Math.max(0, calculatedRegularPrice - bundle.bundlePrice);

  return (
    <section className="my-10 bg-[#111827] text-white rounded-2xl p-6 sm:p-8 border border-gray-800">
      {/* Bundle switcher tabs */}
      {bundles.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-5 border-b border-white/10 scrollbar-none">
          {bundles.map(b => {
            const isSelected = b.id === bundle.id;
            return (
              <button
                key={b.id}
                onClick={() => setActiveBundleId(b.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-white text-[#111827] border-white font-semibold'
                    : 'bg-white/5 text-gray-300 border-white/15 hover:bg-white/10'
                }`}
              >
                <span>{language === 'bn' ? b.titleBn : b.title}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="inline-block text-[11px] font-semibold text-amber-200 tracking-wide uppercase mb-1.5">
            {bundle.badge || t(`বান্ডেলে সাশ্রয় ${formatPrice(saveAmount)}`, `Save ${formatPrice(saveAmount)}`)}
          </span>
          <h2 className="font-editorial text-xl sm:text-2xl font-semibold tracking-tight text-white">
            {language === 'bn' ? (bundle.titleBn || bundle.title) : bundle.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl leading-relaxed">
            {language === 'bn' ? bundle.descriptionBn : bundle.description}
          </p>
        </div>

        {/* Pricing Box */}
        <div className="bg-white/5 border border-white/15 p-4 rounded-xl flex flex-col items-start sm:items-end shrink-0">
          <div className="sm:text-right tabular-nums">
            <span className="text-xs text-gray-400 block line-through">
              {t('রেগুলার মূল্য:', 'Regular:')} {formatPrice(calculatedRegularPrice)}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-white block mt-0.5">
              {t('বান্ডেল মূল্য:', 'Bundle:')} {formatPrice(bundle.bundlePrice)}
            </span>
            <span className="text-xs font-medium text-emerald-400 mt-0.5 block">
              {t(`মোট সাশ্রয় ${formatPrice(saveAmount)}`, `You save ${formatPrice(saveAmount)}`)}
            </span>
          </div>

          <button
            disabled={!isBundleInStock}
            onClick={() => addBundleToCart(bundle.productIds, bundle.bundlePrice)}
            className={`mt-3 font-semibold text-xs sm:text-sm px-5 py-2.5 min-h-[42px] rounded-xl flex items-center space-x-2 transition-colors ${
              !isBundleInStock
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-[#881337] hover:bg-[#9f1239] text-white cursor-pointer'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {isBundleInStock
                ? t('সম্পূর্ণ বান্ডেল ব্যাগে নিন', 'Add Bundle to Cart')
                : t('বান্ডেল স্টক নেই', 'Bundle Out of Stock')}
            </span>
          </button>
        </div>
      </div>

      {/* Bundle Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {bundleProducts.map((prod, index) => {
          const prodStock = getAvailableStock(prod);
          const isItemOut = prodStock <= 0;
          const img = prod.images?.[0];

          return (
            <React.Fragment key={prod.id}>
              <div
                className={`border rounded-xl p-3.5 flex items-center space-x-3.5 ${
                  isItemOut
                    ? 'bg-rose-950/30 border-rose-500/30 opacity-75'
                    : 'bg-white/5 border-white/15'
                }`}
              >
                <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-800 border border-white/10 flex items-center justify-center">
                  {img && !imgErrors[prod.id] ? (
                    <img
                      src={img}
                      alt={language === 'bn' ? prod.nameBn : prod.name}
                      referrerPolicy="no-referrer"
                      onError={() => setImgErrors(prev => ({ ...prev, [prod.id]: true }))}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-gray-500" />
                  )}
                  {isItemOut && (
                    <div className="absolute inset-0 bg-black/65 flex items-center justify-center p-1">
                      <span className="text-[10px] font-semibold text-rose-200 text-center">
                        {t('স্টক নেই', 'Out')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-gray-400 block truncate">
                    {language === 'bn' ? prod.categoryBn : prod.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-medium text-white line-clamp-2 mt-0.5 leading-snug">
                    {language === 'bn' ? prod.nameBn : prod.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1.5 tabular-nums">
                    <span className="text-xs font-semibold text-amber-200">
                      {formatPrice(prod.price)}
                    </span>
                    {isItemOut ? (
                      <span className="text-[11px] text-rose-400 font-medium">
                        {t('স্টক শেষ', 'Out of stock')}
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 flex items-center">
                        <Check className="w-3 h-3 mr-0.5" />
                        {t('বান্ডেলে অন্তর্ভুক্ত', 'Included')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {index < bundleProducts.length - 1 && (
                <div className="hidden sm:flex items-center justify-center text-white/50 -mx-6 z-10 pointer-events-none">
                  <div className="w-7 h-7 rounded-full bg-[#1f2937] border border-white/15 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};
