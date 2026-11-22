import React from 'react';
import { X, Trash2, ShoppingBag, Star, Check, Truck, ShieldCheck, Scale, Package } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getAvailableStock, getStockStatusInfo } from '../utils/inventory';

export const ProductComparisonModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    comparisonList,
    removeFromComparison,
    clearComparison,
    products,
    t,
    formatPrice,
    addToCart,
    language,
  } = useShop();

  if (activeModal !== 'compare') return null;

  const comparedProducts = products.filter(p => comparisonList.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto border border-[#e6e3dd] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6e3dd] flex items-center justify-between bg-[#faf9f7]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#111827] text-white flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial font-bold text-base sm:text-lg text-[#111827]">
                {t('পণ্য তুলনা করুন (২-৪টি পণ্য)', 'Compare Products (2-4 items)')}
              </h3>
              <p className="text-xs text-gray-500">
                {t('দাম, ফিচার, ওয়ারেন্টি ও স্টকের সরাসরি তুলনামূলক তালিকা', 'Side-by-side matrix of prices, specs, and warranties')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {comparedProducts.length > 0 && (
              <button
                onClick={clearComparison}
                className="text-xs text-[#881337] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('সব মুছুন', 'Clear All')}</span>
              </button>
            )}
            <button
              onClick={() => setActiveModal(null)}
              aria-label={t('বন্ধ করুন', 'Close')}
              className="p-2 text-gray-500 hover:text-[#111827] rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-4 sm:p-6 overflow-x-auto flex-1">
          {comparedProducts.length === 0 ? (
            <div className="text-center py-16">
              <Scale className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#111827]">
                {t('তুলনার জন্য কোনো পণ্য নির্বাচিত নেই', 'No products selected for comparison')}
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                {t(
                  'পণ্য কার্ডের তুলনা আইকনে ক্লিক করে ২ থেকে ৪টি পণ্য যুক্ত করুন।',
                  'Click the compare icon on any product cards to add them here.'
                )}
              </p>
            </div>
          ) : (
            <div className="min-w-[650px]">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <tbody>
                  {/* Row 1: Product Thumbnail and Title */}
                  <tr className="border-b border-[#e6e3dd]">
                    <td className="py-3.5 px-4 font-semibold text-gray-500 w-36 text-xs">
                      {t('পণ্য', 'Product')}
                    </td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-3.5 px-4 min-w-[200px] align-top">
                        <div className="relative aspect-square w-32 rounded-xl overflow-hidden bg-[#faf9f7] mb-2.5 border border-[#e6e3dd] flex items-center justify-center">
                          {prod.images[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={language === 'bn' ? prod.nameBn : prod.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-7 h-7 text-gray-300" />
                          )}
                          <button
                            onClick={() => removeFromComparison(prod.id)}
                            aria-label={t('বাদ দিন', 'Remove')}
                            className="absolute top-1.5 right-1.5 bg-white/95 hover:bg-white text-gray-600 hover:text-[#881337] p-1 rounded-full border border-[#e6e3dd] cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-semibold text-[#111827] text-xs sm:text-sm line-clamp-2">
                          {language === 'bn' ? prod.nameBn : prod.name}
                        </h4>
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: Price */}
                  <tr className="border-b border-[#e6e3dd] bg-[#faf9f7]">
                    <td className="py-3.5 px-4 font-semibold text-gray-600">{t('মূল্য', 'Price')}</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-3.5 px-4 tabular-nums">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-[#111827] text-base">{formatPrice(prod.price)}</span>
                          {prod.oldPrice && (
                            <span className="text-xs text-gray-400 line-through">{formatPrice(prod.oldPrice)}</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Rating */}
                  <tr className="border-b border-[#e6e3dd]">
                    <td className="py-3.5 px-4 font-semibold text-gray-600">{t('রিভিউ', 'Reviews')}</td>
                    {comparedProducts.map(prod => {
                      const hasReviews = Array.isArray(prod.reviews) && prod.reviews.length > 0;
                      return (
                        <td key={prod.id} className="py-3.5 px-4 tabular-nums">
                          {hasReviews ? (
                            <div className="flex items-center gap-1 text-[#111827] font-semibold">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{prod.rating}</span>
                              <span className="text-gray-400 font-normal">({prod.reviews.length})</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">{t('কোনো রিভিউ নেই', 'No reviews yet')}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 4: Brand */}
                  <tr className="border-b border-[#e6e3dd] bg-[#faf9f7]">
                    <td className="py-3.5 px-4 font-semibold text-gray-600">{t('ব্র্যান্ড', 'Brand')}</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-3.5 px-4 font-semibold text-[#111827]">
                        {prod.brand}
                      </td>
                    ))}
                  </tr>

                  {/* Row 5: Delivery Info */}
                  <tr className="border-b border-[#e6e3dd]">
                    <td className="py-3.5 px-4 font-semibold text-gray-600">{t('ডেলিভারি', 'Delivery')}</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-3.5 px-4 text-xs text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{language === 'bn' ? prod.deliveryDaysBn : prod.deliveryDays}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 6: Warranty */}
                  <tr className="border-b border-[#e6e3dd] bg-[#faf9f7]">
                    <td className="py-3.5 px-4 font-semibold text-gray-600">{t('ওয়ারেন্টি', 'Warranty')}</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-3.5 px-4 text-xs text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#111827] shrink-0" />
                          <span>{language === 'bn' ? prod.warrantyBn : prod.warranty}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 7: Live Stock Status */}
                  <tr className="border-b border-[#e6e3dd]">
                    <td className="py-3.5 px-4 font-semibold text-gray-600">{t('স্টক অবস্থা', 'Stock Status')}</td>
                    {comparedProducts.map(prod => {
                      const live = products.find(p => p.id === prod.id) || prod;
                      const stockInfo = getStockStatusInfo(live, undefined, undefined, language);
                      const available = getAvailableStock(live);

                      return (
                        <td key={prod.id} className="py-3.5 px-4 text-xs font-semibold tabular-nums">
                          {stockInfo.isOutOfStock ? (
                            <span className="text-[#881337]">
                              {t('স্টক নেই', 'Out of Stock')}
                            </span>
                          ) : stockInfo.isLowStock ? (
                            <span className="text-amber-700">
                              {t(`মাত্র ${available}টি বাকি`, `Only ${available} left`)}
                            </span>
                          ) : (
                            <span className="text-[#15803d] inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              {t(`ইন স্টক (${available}টি)`, `In Stock (${available})`)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 8: Action button */}
                  <tr>
                    <td className="py-4 px-4 font-semibold text-gray-600">{t('অ্যাকশন', 'Action')}</td>
                    {comparedProducts.map(prod => {
                      const live = products.find(p => p.id === prod.id) || prod;
                      const isOut = getAvailableStock(live) <= 0;

                      return (
                        <td key={prod.id} className="py-4 px-4">
                          <button
                            disabled={isOut}
                            onClick={() => {
                              if (isOut) return;
                              const added = addToCart(live, 1);
                              if (added) {
                                setActiveModal('cart');
                              }
                            }}
                            className={`font-semibold text-xs px-4 py-2 min-h-[38px] rounded-xl inline-flex items-center gap-1.5 transition-colors ${
                              isOut
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-[#e6e3dd]'
                                : 'bg-[#881337] hover:bg-[#6d0f2c] text-white cursor-pointer'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{isOut ? t('স্টক আউট', 'Out of Stock') : t('ব্যাগে যোগ করুন', 'Add to Cart')}</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
