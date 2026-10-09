import React from 'react';
import { X, Trash2, ShoppingBag, Star, CheckCircle, Truck, ShieldCheck, Scale } from 'lucide-react';
import { useShop } from '../context/ShopContext';

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                {t('পণ্য তুলনা করুন (২-৪টি পণ্য)', 'Compare Products (2-4 items)')}
              </h3>
              <p className="text-xs text-gray-500">
                {t('ফিচার, দাম ও ওয়ারেন্টির সরাসরি তুলনামূলক তালিকা', 'Side-by-side matrix of specs, prices, and warranties')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {comparedProducts.length > 0 && (
              <button
                onClick={clearComparison}
                className="text-xs text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('সব মুছুন', 'Clear All')}</span>
              </button>
            )}
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-4 sm:p-6 overflow-x-auto flex-1">
          {comparedProducts.length === 0 ? (
            <div className="text-center py-16">
              <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-700">
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
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-bold text-gray-400 w-36 uppercase tracking-wider text-[11px]">
                      {t('পণ্য', 'Product')}
                    </td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-3 px-4 min-w-[200px] align-top">
                        <div className="relative aspect-square w-32 rounded-xl overflow-hidden bg-gray-50 mb-2 border border-gray-100">
                          <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeFromComparison(prod.id)}
                            className="absolute top-1 right-1 bg-white/80 hover:bg-white text-gray-600 hover:text-rose-600 p-1 rounded-full shadow-xs cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2">
                          {language === 'bn' ? prod.nameBn : prod.name}
                        </h4>
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: Price */}
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-gray-500">{t('মূল্য', 'Price')}</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-3 px-4">
                        <div className="flex items-baseline space-x-2">
                          <span className="font-black text-rose-600 text-base">{formatPrice(prod.price)}</span>
                          {prod.oldPrice && (
                            <span className="text-xs text-gray-400 line-through">{formatPrice(prod.oldPrice)}</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Rating */}
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-bold text-gray-500">{t('রেটিং ও রিভিউ', 'Rating')}</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-3 px-4">
                        <div className="flex items-center space-x-1 text-amber-500 font-bold">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <span>{prod.rating}</span>
                          <span className="text-gray-400 font-normal">({prod.reviewsCount})</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 4: Brand */}
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-gray-500">{t('ব্র্যান্ড', 'Brand')}</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-3 px-4 font-semibold text-gray-800">
                        {prod.brand}
                      </td>
                    ))}
                  </tr>

                  {/* Row 5: Stock / Availability */}
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-bold text-gray-500">{t('স্টক অবস্থা', 'Availability')}</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-3 px-4">
                        {prod.stock > 0 ? (
                          <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{t(`স্টকে আছে (${prod.stock}টি)`, `In Stock (${prod.stock})`)}</span>
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold">{t('স্টক আউট', 'Out of Stock')}</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 6: Delivery Info */}
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-gray-500">{t('ডেলিভারি', 'Delivery')}</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-3 px-4 text-xs text-gray-700">
                        <div className="flex items-center space-x-1">
                          <Truck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{language === 'bn' ? prod.deliveryDaysBn : prod.deliveryDays}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 7: Warranty */}
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-bold text-gray-500">{t('ওয়ারেন্টি', 'Warranty')}</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-3 px-4 text-xs text-gray-700">
                        <div className="flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{language === 'bn' ? prod.warrantyBn : prod.warranty}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 8: Action button */}
                  <tr>
                    <td className="py-4 px-4 font-bold text-gray-500">{t('অ্যাকশন', 'Action')}</td>
                    {comparedProducts.map(prod => (
                      <td key={prod.id} className="py-4 px-4">
                        <button
                          onClick={() => {
                            addToCart(prod, 1);
                            setActiveModal('cart');
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t('ব্যাগে যোগ করুন', 'Add to Cart')}</span>
                        </button>
                      </td>
                    ))}
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
