import React from 'react';
import { Sparkles, ShoppingBag, Plus, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { INITIAL_BUNDLES } from '../data/mockData';

export const CompleteTheLookSection: React.FC = () => {
  const { language, t, formatPrice, products, addBundleToCart } = useShop();

  const bundle = INITIAL_BUNDLES[0];
  if (!bundle) return null;

  const bundleProducts = products.filter(p => bundle.productIds.includes(p.id));
  const saveAmount = bundle.regularPrice - bundle.bundlePrice;

  return (
    <section className="my-8 bg-gradient-to-r from-gray-900 via-rose-950 to-gray-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-amber-400 text-gray-950 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{bundle.badge}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
              {t('Complete The Look — কম্বো স্টাইল বান্ডেল', 'Complete The Look — Smart Bundle')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              {language === 'bn' ? bundle.descriptionBn : bundle.description}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-end shrink-0">
            <div className="text-right">
              <span className="text-xs text-gray-400 block line-through">
                {t('রেগুলার দাম:', 'Regular:')} {formatPrice(bundle.regularPrice)}
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 block">
                {t('বান্ডেল অফার:', 'Bundle:')} {formatPrice(bundle.bundlePrice)}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {t(`মোট সাশ্রয়: ${formatPrice(saveAmount)}`, `You Save: ${formatPrice(saveAmount)}`)}
              </span>
            </div>

            <button
              onClick={() => addBundleToCart(bundle.productIds, bundle.bundlePrice)}
              className="mt-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('সম্পূর্ণ লুক ব্যাগে নিন', 'Add Full Bundle to Cart')}</span>
            </button>
          </div>
        </div>

        {/* Bundle Items Visual Chain */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {bundleProducts.map((prod, index) => (
            <React.Fragment key={prod.id}>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex items-center space-x-3.5">
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-white/20 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                    {language === 'bn' ? prod.categoryBn : prod.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 mt-0.5">
                    {language === 'bn' ? prod.nameBn : prod.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-extrabold text-amber-400">
                      {formatPrice(prod.price)}
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center">
                      <Check className="w-3 h-3 mr-0.5" />
                      {t('বান্ডেল অন্তর্ভুক্ত', 'Included')}
                    </span>
                  </div>
                </div>
              </div>

              {index < bundleProducts.length - 1 && (
                <div className="hidden sm:flex items-center justify-center text-white/50 -mx-6 z-10 pointer-events-none">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
